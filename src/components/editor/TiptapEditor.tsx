"use client";

import Focus from "@tiptap/extension-focus";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// EXTENSIONS
import { AutocompleteExtension } from "./extensions/AutocompleteExtension";
import { AutoNumberingExtension } from "./extensions/AutoNumberingExtension";
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
import { FileExplorer } from "@/components/desktop/FileExplorer";
import { DesktopLayout } from "@/components/layout/DesktopLayout";
import { useAutoSave } from "@/hooks/useAutoSave";
import { Script, deleteScript, generateId } from "@/lib/storage";
import { EditorToolbar } from "./EditorToolbar";
import { Sidebar } from "./Sidebar";

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
  const router = useRouter();
  const [workspaceFiles, setWorkspaceFiles] = useState<Script[]>([]);

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
      transformPastedText(text) {
        let cleaned = text.replace(/(\r?\n\r?\n)/g, "[PARAGRAPH_BREAK]");
        cleaned = cleaned.replace(/[\r\n-]/g, " ");
        return cleaned.replace(/\[PARAGRAPH_BREAK]/g, "\n\n");
      },
    },
  });

  // 2. HOOKS (AutoSave)
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

  // 3. GERENCIAMENTO DE ARQUIVOS (File System)
  const loadWorkspaceFiles = async () => {
    // Se não tiver electron (ex: abriu no navegador sem querer), não faz nada ou carrega vazio
    if (typeof window === "undefined" || !window.electron) return;

    const path = localStorage.getItem("yousee_workspace_path");
    if (!path) return;

    try {
      const files = await window.electron.readWorkspace(path);
      setWorkspaceFiles(files);
    } catch (error) {
      console.error("Erro ao ler arquivos:", error);
    }
  };

  // Carrega lista inicial
  useEffect(() => {
    loadWorkspaceFiles();
  }, []);

  // Recarrega lista ao salvar (para atualizar títulos/capítulos na sidebar)
  useEffect(() => {
    if (saveStatus === "saved") {
      setTimeout(() => loadWorkspaceFiles(), 500);
    }
  }, [saveStatus]);

  // --- AÇÕES DO EXPLORER ---
  const handleFileSelect = (fileId: string) => {
    saveContent();
    router.push(`/editor/${encodeURIComponent(fileId)}`);
  };

  const handleCreateNew = async () => {
    const path = localStorage.getItem("yousee_workspace_path");
    if (path) {
      const newId = generateId();
      const filename = `Roteiro-${newId.slice(0, 6)}.yousee`;
      const separator = path.includes("\\") ? "\\" : "/";
      const fullPath = `${path}${separator}${filename}`;
      router.push(`/editor/${encodeURIComponent(fullPath)}`);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (confirm("Tem certeza que deseja apagar este roteiro?")) {
      await deleteScript(fileId);
      await loadWorkspaceFiles();
      if (fileId === scriptId) {
        handleCreateNew(); // Se apagou o atual, vai para um novo
      }
    }
  };

  // 4. SCROLL CINEMATOGRÁFICO & LISTENERS
  useEffect(() => {
    if (!editor) return;

    // Auto-save manual trigger
    editor.on("update", saveContent);

    // Scroll Suave ao digitar
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

  // 5. RENDERIZAÇÃO: LAYOUT DE ESTÚDIO (ÚNICO)
  return (
    <DesktopLayout
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
        />
      }
      sidebarLeft={
        <FileExplorer
          files={workspaceFiles}
          currentFileId={scriptId}
          onFileSelect={handleFileSelect}
          onCreateFile={handleCreateNew}
          onDeleteFile={handleDeleteFile}
        />
      }
      sidebarRight={<Sidebar editor={editor} onCloseMobile={() => {}} />}
    >
      <div
        className={`
            flex justify-center w-full py-12 pt-10 pb-[50vh] px-8
            transition-opacity duration-500
            ${isLoaded ? "opacity-100" : "opacity-0"}
        `}
      >
        <EditorContent editor={editor} />
      </div>
    </DesktopLayout>
  );
}
