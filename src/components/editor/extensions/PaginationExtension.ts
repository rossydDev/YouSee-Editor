import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';

export const PaginationExtension = Extension.create({
  name: 'pagination',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('pagination'),
        view(editorView) {
          return {
            update(view, prevState) {
              const docChanged = !view.state.doc.eq(prevState.doc);
              const selectionChanged = !view.state.selection.eq(prevState.selection);

              if (docChanged || selectionChanged) {
                const cleaned = cleanupEmptyPages(view);
                if (!cleaned) {
                   checkPageOverflow(view);
                }
              }
            },
          };
        },
      }),
    ];
  },
});

function cleanupEmptyPages(view: any) {
  const { state, dispatch } = view;
  const { doc, selection } = state;
  let tr = state.tr;
  let hasChanges = false;

  for (let i = doc.childCount - 1; i > 0; i--) {
    const pageNode = doc.child(i);
    if (pageNode.type.name !== 'page') continue;

    const hasHeader = pageNode.firstChild?.type.name === 'storyPageHeader';
    const isEmpty = pageNode.childCount === 0 || 
                    (pageNode.childCount === 1 && pageNode.firstChild?.content.size === 0);

    if (!hasHeader && isEmpty) {
      let pos = 0;
      doc.forEach((node: any, offset: number, index: number) => {
        if (index === i) pos = offset;
      });

      const pageEnd = pos + pageNode.nodeSize;
      const isCursorInside = selection.from >= pos && selection.to <= pageEnd;

      if (!isCursorInside) {
        tr.delete(pos, pageEnd);
        hasChanges = true;
      }
    }
  }

  if (hasChanges && !view.isDestroyed) {
      dispatch(tr.setMeta('addToHistory', false)); 
      return true;
  }
  return false;
}

function checkPageOverflow(view: any) {
  const MAX_HEIGHT = 1200; 

  const { state, dispatch } = view;
  const { doc, selection } = state;
  
  if (view.isDestroyed) return;

  let tr = state.tr;
  let hasChanges = false;
  let modifiedPageFound = false;

  doc.forEach((pageNode: any, offset: number, index: number) => {
    if (modifiedPageFound) return;
    if (pageNode.type.name !== 'page') return;

    const dom = view.nodeDOM(offset);
    if (!dom || !dom.scrollHeight) return;

    if (dom.scrollHeight > MAX_HEIGHT) {
      
      // Travas de segurança
      if (pageNode.childCount <= 2 && pageNode.firstChild?.type.name === 'storyPageHeader') return;
      if (pageNode.childCount <= 1) return;

      const lastChild = pageNode.lastChild;
      if (!lastChild) return;
      if (lastChild.type.name === 'storyPageHeader') return;

      // --- LOGICA DE GRUPO (NOVO) ---
      // Verifica se devemos mover o par "Personagem + Diálogo"
      let nodesToMoveCount = 1;
      let nodesToMoveSize = lastChild.nodeSize;

      // Se o último nó é Diálogo, checa se o penúltimo é Personagem
      if (lastChild.type.name === 'dialogue' && pageNode.childCount >= 2) {
          const secondLastChild = pageNode.child(pageNode.childCount - 2);
          if (secondLastChild && secondLastChild.type.name === 'character') {
              // Bingo! Achamos um par. Vamos mover os dois.
              console.log("Detectado par Personagem/Diálogo. Movendo juntos.");
              nodesToMoveCount = 2;
              nodesToMoveSize += secondLastChild.nodeSize;
          }
      }

      // --- 1. CÁLCULOS ---
      // O 'fromPos' agora recua baseado no tamanho total do grupo (1 ou 2 nós)
      const fromPos = offset + pageNode.nodeSize - nodesToMoveSize - 1; 
      const toPos = fromPos + nodesToMoveSize;

      // --- 2. PRESERVAÇÃO DE CURSOR ---
      const isCursorInMovedNode = selection.from >= fromPos && selection.to <= toPos;
      const cursorOffset = selection.from - fromPos;

      console.log(`🚨 Quebra na Pág ${index + 1}. Movendo ${nodesToMoveCount} nó(s).`);

      // --- 3. PREPARAR CONTEÚDO PARA MOVER ---
      // Slice recorta o pedaço do documento que queremos mover
      const sliceToMove = state.doc.slice(fromPos, toPos);

      // --- 4. EXECUÇÃO ---
      const nextPageIndex = index + 1;
      let nextPagePos = -1;
      
      if (nextPageIndex < doc.childCount) {
         doc.forEach((n: any, o: number, i: number) => {
            if (i === nextPageIndex) nextPagePos = o;
         });
      }

      let insertPos = -1;

      if (nextPagePos !== -1) {
        // Mover para página existente
        const nextPageNode = doc.child(nextPageIndex);
        let insertOffset = 1; 
        
        if (nextPageNode.firstChild?.type.name === 'storyPageHeader') {
            insertOffset += nextPageNode.firstChild.nodeSize;
        }

        tr.delete(fromPos, toPos);
        
        // Recalculo da posição de destino
        const shiftedNextPagePos = nextPagePos - nodesToMoveSize;
        insertPos = shiftedNextPagePos + insertOffset;
        
        // Inserimos o slice (que pode ter 1 ou 2 nós)
        tr.insert(insertPos, sliceToMove.content);

      } else {
        // Criar nova página (Continuação)
        tr.delete(fromPos, toPos);
        
        // Cria página com o conteúdo do slice
        // sliceToMove.content já é um Fragment com os nós corretos
        const newPage = state.schema.nodes.page.create(null, sliceToMove.content);
        
        insertPos = tr.mapping.map(doc.content.size); 
        tr.insert(insertPos, newPage);
        insertPos = insertPos + 1; 
      }

      // --- 5. RESTAURAR CURSOR ---
      if (isCursorInMovedNode && insertPos !== -1) {
        const newCursorPos = insertPos + cursorOffset;
        try {
            tr.setSelection(TextSelection.create(tr.doc, newCursorPos));
            tr.scrollIntoView();
        } catch (e) {
            console.warn("Erro ao restaurar cursor", e);
        }
      }

      hasChanges = true;
      modifiedPageFound = true;
    }
  });

  if (hasChanges) {
    setTimeout(() => {
        if (!view.isDestroyed) {
             dispatch(tr);
        }
    }, 10);
  }
}