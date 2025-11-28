"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Panel } from "./extensions/Panel";
import { Character } from "./extensions/Character";
import { Dialogue } from "./extensions/Dialogue";
import { ScreenplayShortcuts } from "./extensions/Shortcuts";
import { Sfx } from "./extensions/Sfx";
import Focus from "@tiptap/extension-focus";
import { ScreenplayDocument } from "./extensions/Document";
import { Page } from "./extensions/Page";
import { StoryPageHeader } from "./extensions/StoryPageHeader";
import { EditorToolbar } from "./EditorToolbar";
import { useEffect, useState } from "react";
import { TextSelection } from "@tiptap/pm/state";

const STORAGE_KEY = "yousee-content-v1";

const DEFAULT_CONTENT = `
   <div data-type="page">
       <story-page-header></story-page-header>
       <panel-block>EXT. RUA DE KASTELLUM - NOITE</panel-block>
       <p>A chuva cai pesada sobre os paralelepípedos.</p>

       <panel-block>INT. TAVERNA</panel-block>
       <character-node>BOB</character-node>
       <dialogue-node>Essa chuva não vai parar nunca?</dialogue-node>
   </div>
`;

export function TipTapEditor() {
  const [isLoaded, setIsLoaded] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ document: false }),
      ScreenplayDocument,
      Page,
      StoryPageHeader,
      Panel,
      Character,
      Dialogue,
      ScreenplayShortcuts,
      Sfx,
      Focus.configure({ className: "has-focus", mode: "all" }),
    ],
    content: DEFAULT_CONTENT,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "outline-none" },
    },
    onUpdate({ editor }) {
      // Salva apenas se já estiver carregado para evitar sobrescrever com o padrão
      if (!isLoaded) return;
      
      const json = editor.getJSON();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
    },
  });

  // --- 1. CARREGAR (Correção com Microtask) ---
  useEffect(() => {
    if (!editor) return;
    if (isLoaded) return;

    // queueMicrotask: Agenda para rodar logo após o ciclo atual do React
    queueMicrotask(() => {
      const savedContent = localStorage.getItem(STORAGE_KEY);
      
      if (savedContent) {
        try {
          const json = JSON.parse(savedContent);
          // O editor já está montado (embora invisível), então é seguro setar conteúdo
          editor.commands.setContent(json);
          // Pequena pausa para garantir que o cursor vá para o fim
          editor.commands.focus('end');
        } catch (e) {
          console.error("Erro ao carregar:", e);
        }
      }
      
      // Libera a visualização
      setIsLoaded(true);
    });
  }, [editor, isLoaded]);

  // --- MOTOR DE PAGINAÇÃO (Mantido igual) ---
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    let resizeObserver: ResizeObserver | null = null;

    const setupObserver = () => {
      if (editor.isDestroyed) return;
      const pageElements = editor.view.dom.querySelectorAll('.page-node');
      if (pageElements.length === 0) return;
      const lastPageElement = pageElements[pageElements.length - 1];

      if (resizeObserver) resizeObserver.disconnect();

      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target.isConnected && entry.contentRect.height > 1050) {
            resizeObserver?.disconnect();
            
            console.log("🚨 ESTOURO DETECTADO! Migrando...");

            editor.commands.command(({ tr, state, dispatch }) => {
              if (!dispatch) return true;
              
              const pageIndex = Array.from(pageElements).indexOf(entry.target as HTMLElement);
              if (pageIndex === -1) return false;
              
              const pageNode = state.doc.content.child(pageIndex);
              if (!pageNode || pageNode.type.name !== 'page') return false;
              
              const lastChild = pageNode.lastChild;
              if (!lastChild) return false;

              let pos = 0;
              for (let i = 0; i < pageIndex; i++) pos += state.doc.content.child(i).nodeSize;
              
              const pageStartPos = pos; 
              const from = pageStartPos + pageNode.nodeSize - lastChild.nodeSize - 1;
              const to = pageStartPos + pageNode.nodeSize - 1;

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

  if (!editor) return null;

  return (
    <div
      className={`
        flex justify-center w-full bg-zinc-950 py-12 pt-20 overflow-y-auto h-screen cursor-default 
        transition-opacity duration-500 
        ${isLoaded ? 'opacity-100' : 'opacity-0'} 
      `} 
      onClick={(e) => {
        if (e.target == e.currentTarget) {
          editor?.commands.blur();
        }
      }}
    >
      <EditorToolbar editor={editor} />
      <div className="w-full">
        {/* Renderizamos SEMPRE, apenas escondemos com CSS se não estiver loaded */}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}