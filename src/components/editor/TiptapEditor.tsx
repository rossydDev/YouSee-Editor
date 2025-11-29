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
import { useEffect, useState } from "react"; // <--- CORREÇÃO 1: useState importado aqui!
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";

// IMPORTS DOS HOOKS
import { usePagination } from "@/hooks/usePagination";
import { useAutoSave } from "@/hooks/useAutoSave";
import { AutocompleteExtension } from "./extensions/AutocompleteExtension";

const DEFAULT_CONTENT = `
   <div data-type="page">
       <story-page-header></story-page-header>
   </div>
`;

export function TipTapEditor() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. Configuração do Editor
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
      AutocompleteExtension,
      Focus.configure({ className: "has-focus", mode: "all" }),
    ],
    content: DEFAULT_CONTENT,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "outline-none" },
    },
    // Nota: Removi o onSelectionUpdate daqui para usar o Hook abaixo (mais rápido)
  });

  // 2. Hooks de Funcionalidade
  const { isLoaded, saveContent } = useAutoSave(editor);
  usePagination(editor);

  // 3. Salvamento Manual
  useEffect(() => {
    if (!editor) return;
    editor.on('update', saveContent);
    return () => { editor.off('update', saveContent) };
  }, [editor, saveContent]);

  // 4. CORREÇÃO 2: Scroll Cinematográfico (Instantâneo e Centralizado)
  useEffect(() => {
    if (!editor) return;

    const handleScroll = () => {
      // requestAnimationFrame garante que o scroll rode no próximo frame de pintura (sem lag)
      requestAnimationFrame(() => {
        const { from } = editor.state.selection;
        const dom = editor.view.domAtPos(from).node as HTMLElement;
        
        if (dom && dom.scrollIntoView) {
          dom.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center', // Garante que o texto fique no MEIO da tela
            inline: 'nearest'
          });
        }
      });
    };

    // Ouve qualquer mudança de cursor (digitar ou clicar)
    editor.on('transaction', handleScroll);
    return () => { editor.off('transaction', handleScroll) };
  }, [editor]);


  if (!editor) return null;

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-gray-300 font-mono overflow-hidden">
      
      {/* Header Fixo Mobile */}
      <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 justify-between xl:hidden">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded"
        >
          <Menu size={20} />
        </button>
      </div>

      <EditorToolbar editor={editor} /> 

      <div className="flex flex-1 pt-14 overflow-hidden relative">
        <Sidebar editor={editor} isOpen={isSidebarOpen} />

        <div 
          className={`
            flex-1 h-full overflow-y-auto overflow-x-hidden cursor-default bg-zinc-950
            transition-all duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            xl:pl-64
          `}
          onClick={(e) => {
            if (e.target === e.currentTarget) editor?.commands.blur();
            setIsSidebarOpen(false);
          }}
        >
          {/* Padding gigante embaixo (pb-[50vh]) permite rolar o fim do texto até o topo */}
          <div className="flex justify-center w-full py-12 pt-20 pb-[50vh]">
             <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}