import { Editor } from "@tiptap/react";
import { useEffect } from "react";
import { TextSelection } from "@tiptap/pm/state";

export function usePagination(editor: Editor | null) {
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    let resizeObserver: ResizeObserver | null = null;

    const setupObserver = () => {
      if (editor.isDestroyed) return;

      // 1. Busca as páginas
      const pageElements = editor.view.dom.querySelectorAll('.page-node');
      if (pageElements.length === 0) return;

      // 2. Vigia apenas a última
      const lastPageElement = pageElements[pageElements.length - 1];

      if (resizeObserver) resizeObserver.disconnect();

      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          // Limite de segurança (A4)
          if (entry.target.isConnected && entry.contentRect.height > 1050) {
            resizeObserver?.disconnect();
            
            console.log("🚨 ESTOURO DETECTADO! Migrando conteúdo...");

            editor.commands.command(({ tr, state, dispatch }) => {
              if (!dispatch) return true;

              // A. Mapeamento
              const pageIndex = Array.from(pageElements).indexOf(entry.target as HTMLElement);
              if (pageIndex === -1) return false;

              const pageNode = state.doc.content.child(pageIndex);
              if (!pageNode || pageNode.type.name !== 'page') return false;

              const lastChild = pageNode.lastChild;
              if (!lastChild) return false;

              // B. Cálculos
              let pos = 0;
              for (let i = 0; i < pageIndex; i++) pos += state.doc.content.child(i).nodeSize;
              
              const pageStartPos = pos; 
              const from = pageStartPos + pageNode.nodeSize - lastChild.nodeSize - 1;
              const to = pageStartPos + pageNode.nodeSize - 1;

              // C. Cirurgia (Move o conteúdo)
              const slice = tr.doc.slice(from, to);
              tr.delete(from, to);
              
              const contentToMove = slice.content.size > 0 ? slice.content : state.schema.nodes.paragraph.create();
              const newPageNode = state.schema.nodes.page.create(null, contentToMove);
              
              const insertPos = tr.doc.content.size;
              tr.insert(insertPos, newPageNode);

              try {
                const newSelection = TextSelection.create(tr.doc, insertPos + 2);
                tr.setSelection(newSelection);
              } catch (e) { console.warn(e); }
              
              return true;
            });

            // Reinicia o observador após o DOM atualizar
            setTimeout(() => setupObserver(), 200);
          }
        }
      });

      resizeObserver.observe(lastPageElement);
    };

    editor.on("update", setupObserver);
    setupObserver();

    return () => {
      editor.off("update", setupObserver);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [editor]);
}