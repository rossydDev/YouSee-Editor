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
import { useEffect } from "react";

// IMPORTS NOVOS (Nossos Hooks)
import { usePagination } from "@/hooks/usePagination";
import { useAutoSave } from "@/hooks/useAutoSave";

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
  // 1. Configuração Básica do Editor
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
    // Conectamos o save aqui embaixo depois de inicializar o hook
  });

  // 2. Injetando os Superpoderes (Hooks)
  const { isLoaded, saveContent } = useAutoSave(editor);
  usePagination(editor);

  // 3. Conectando o evento de salvar manualmente
  // (Precisamos fazer isso via useEffect pois o saveContent vem do hook)
  useEffect(() => {
    if (!editor) return;
    editor.on('update', saveContent);
    return () => { editor.off('update', saveContent) };
  }, [editor, saveContent]);


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
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}