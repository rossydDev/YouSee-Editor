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
import { AutocompleteExtension } from "./extensions/AutocompleteExtension";
import { PaginationExtension } from "./extensions/PaginationExtension";

// COMPONENTS & HOOKS
import { EditorToolbar } from "./EditorToolbar";
import { Sidebar } from "./Sidebar";
import { EditorLayout } from "@/components/layout/EditorLayout";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useEffect, useState } from "react";

const DEFAULT_CONTENT = `
   <div data-type="page">
       <story-page-header></story-page-header>
   </div>
`;

interface TipTapEditorProps {
  scriptId: string;
}

export function TipTapEditor({ scriptId }: TipTapEditorProps) {
  // Estado UI
  // Começa fechado no mobile (padrão) e aberto no desktop (se quiser)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 

  // 1. EDITOR CONFIG
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
      PaginationExtension,
      Focus.configure({ className: "has-focus", mode: "all" }),
    ],
    content: DEFAULT_CONTENT,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "outline-none" },
    },
  });

  // 2. HOOKS
  const { 
    isLoaded, 
    saveContent, 
    saveStatus, 
    title, setTitle,
    seriesTitle, setSeriesTitle,
    chapterNumber, setChapterNumber,
    existingSeries
  } = useAutoSave(editor, scriptId);
  
  // 3. LISTENERS
  useEffect(() => {
    if (!editor) return;
    
    // Auto-save manual trigger
    editor.on('update', saveContent);

    // Scroll Cinematográfico
    const handleScroll = () => {
      requestAnimationFrame(() => {
        const { from } = editor.state.selection;
        const dom = editor.view.domAtPos(from).node as HTMLElement;
        if (dom && dom.scrollIntoView) {
          dom.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }
      });
    };
    editor.on('transaction', handleScroll);

    return () => { 
      editor.off('update', saveContent);
      editor.off('transaction', handleScroll);
    };
  }, [editor, saveContent]);

  if (!editor) return null;

  // 4. RENDERIZAÇÃO LIMPA VIA LAYOUT
  return (
    <EditorLayout
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      header={
        <EditorToolbar 
          editor={editor} 
          title={title}
          setTitle={setTitle}
          seriesTitle={seriesTitle}
          setSeriesTitle={setSeriesTitle}
          chapterNumber={chapterNumber}
          setChapterNumber={setChapterNumber}
          existingSeries={existingSeries}
          saveStatus={saveStatus}
          isSidebarOpen = {isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      }
      sidebar={
        <Sidebar 
          editor={editor} 
          onCloseMobile={() => setIsSidebarOpen(false)} 
        />
      }
    >
      <div 
        className={`
          flex justify-center w-full py-12 pt-10 pb-[50vh]
          transition-opacity duration-500
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
      >
         <EditorContent editor={editor} />
      </div>
    </EditorLayout>
  );
}