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
import { EditorToolbar } from "./EditorToolbar";
import { useEffect } from "react";

export function TipTapEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        document: false,
      }), // Traz funcionalidades básicas (negrito, listas, parágrafros)
      ScreenplayDocument,
      Page,
      Panel,
      Character,
      Dialogue,
      ScreenplayShortcuts,
      Sfx,
      Focus.configure({
        className: "has-focus",
        mode: "all",
      }),
    ],
    content: `
           <div data-type="page">
                <panel-block>EXT. RUA DE KASTELLUM - NOITE</panel-block>
                <p>A chuva cai pesada sobre os paralelepípedos.</p>
      
                <panel-block>INT. TAVERNA</panel-block>
                <character-node>BOB</character-node>
                <dialogue-node>Essa chuva não vai parar nunca?</dialogue-node>
            </div>

             <div data-type="page">
                <panel-block>OUTRO LUGAR - SONHO</panel-block>
                <p>O silêncio aqui é absoluto.</p>
            </div>
        `,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "outline-none",
      },
    },
  });

  // Adicione este useEffect junto com os outros imports
  useEffect(() => {
    if (!editor) return;

    let resizeObserver: ResizeObserver | null = null;

    const setupObserver = () => {
      // 1. Encontra todas as páginas renderizadas no DOM do editor
      const pages = editor.view.dom.querySelectorAll('.page-node');
      const lastPage = pages[pages.length - 1];

      if (!lastPage) return;

      // Desconecta o anterior para não vigiar páginas velhas
      if (resizeObserver) resizeObserver.disconnect();

      // 2. Cria o novo vigia
     resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          
          // MUDANÇA 1: Limite Real (A4 + pequena folga)
          // Se passar de 1130px, significa que o conteúdo esticou a folha
          if (entry.contentRect.height > 1130) {
            
            // Segurança: Desconecta imediatamente para não criar 50 páginas de uma vez
            resizeObserver?.disconnect();
            
            // MUDANÇA 2: A Ação de Criar Página
            const endPos = editor.state.doc.content.size;
            
            editor.chain()
              .insertContentAt(endPos, {
                type: "page",
                content: [
                  { type: "panel", content: [{ type: "text", text: " " }] },
                  { type: "paragraph" },
                ],
              })
              // Opcional: Se quiser pular direto para a nova página, descomente:
              // .focus() 
              .run();
          }
        }
      });

      // 4. Começa a vigiar a última página
      resizeObserver.observe(lastPage);
    };

    // Roda o setup sempre que o conteúdo mudar (digitando)
    editor.on("update", setupObserver);

    // Inicialização
    setupObserver();

    return () => {
      editor.off("update", setupObserver);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className="flex justify-center w-full bg-zinc-950 py-12 pt-20 overflow-y-auto h-screen cursor-default"
      onClick={(e) => {
        if (e.target == e.currentTarget) {
          editor?.commands.blur();
        }
      }}
    >
      <EditorToolbar editor={editor} />
      <div className="w-full">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
