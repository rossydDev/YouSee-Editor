"use client";

import Focus from "@tiptap/extension-focus";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { AutocompleteExtension } from "./extensions/AutocompleteExtension";
import { Character } from "./extensions/Character";
import { Dialogue } from "./extensions/Dialogue";
import { ScreenplayDocument } from "./extensions/Document";
import { Page } from "./extensions/Page";
import { PaginationExtension } from "./extensions/PaginationExtension";
import { Panel } from "./extensions/Panel";
import { Sfx } from "./extensions/Sfx";
import { ScreenplayShortcuts } from "./extensions/Shortcuts";
import { StoryPageHeader } from "./extensions/StoryPageHeader";

// COMPONENTS & HOOKS
import { EditorLayout } from "@/components/layout/EditorLayout";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useEffect, useState } from "react";
import { EditorToolbar } from "./EditorToolbar";
import { AutoNumberingExtension } from "./extensions/AutoNumberingExtension";
import { Sidebar } from "./Sidebar";

// --- CORREÇÃO 3: Estrutura Inicial (Page 1, Panel 1, Parágrafo) ---
const DEFAULT_CONTENT = `
   <div data-type="page">
       <story-page-header></story-page-header>
       <panel-block></panel-block>
       <p></p>
   </div>
`;

interface TipTapEditorProps {
  scriptId: string;
}

export function TipTapEditor({ scriptId }: TipTapEditorProps) {
  // --- CORREÇÃO 2: Sidebar fechada por padrão ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      AutoNumberingExtension,
      Focus.configure({ className: "has-focus", mode: "all" }),
    ],
    content: DEFAULT_CONTENT,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "outline-none" },

      // --- CORREÇÃO 1: Bug de Colagem (Pasting Issue) ---
      transformPastedText(text) {
        // 1. Preserva quebras de parágrafo reais (\n\n)
        let cleaned = text.replace(/(\r?\n\r?\n)/g, "[PARAGRAPH_BREAK]");

        // 2. Remove todas as quebras de linha simples (PDF) e hífens, substituindo por espaço
        cleaned = cleaned.replace(/[\r\n-]/g, " ");

        // 3. Restaura as quebras de parágrafo reais para formar novos blocos
        return cleaned.replace(/\[PARAGRAPH_BREAK]/g, "\n\n");
      },
    },
  });

  // 2. HOOKS
  const {
    isLoaded,
    saveContent,
    saveStatus,
    title,
    setTitle,
    seriesTitle,
    setSeriesTitle,
    chapterNumber,
    setChapterNumber,
    existingSeries,
  } = useAutoSave(editor, scriptId);

  // 3. LISTENERS
  useEffect(() => {
    if (!editor) return;

    // Auto-save manual trigger
    editor.on("update", saveContent);

    // Scroll Cinematográfico
    const handleScroll = () => {
      requestAnimationFrame(() => {
        const { from } = editor.state.selection;
        const dom = editor.view.domAtPos(from).node as HTMLElement;
        if (dom && dom.scrollIntoView) {
          dom.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      });
    };
    editor.on("transaction", handleScroll);

    return () => {
      editor.off("update", saveContent);
      editor.off("transaction", handleScroll);
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
          isSidebarOpen={isSidebarOpen}
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
          px-4 md:px-0
          ${isLoaded ? "opacity-100" : "opacity-0"}
        `}
      >
        <EditorContent editor={editor} />
      </div>
    </EditorLayout>
  );
}
