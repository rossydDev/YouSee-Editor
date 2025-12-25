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
import { StartScreen } from "@/components/desktop/StartScreen";
import { DesktopLayout } from "@/components/layout/DesktopLayout";
import { ConfirmModal } from "@/components/ui/ConfirmModal"; // <--- 1. IMPORTAÇÃO DO MODAL
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

  // 2. ESTADO PARA CONTROLAR O MODAL DE DELETE
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const hasOpenScript = !!scriptId && scriptId !== "undefined";

  // --- EDITOR CONFIG ---
  const editor = useEditor(
    {
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
      editable: hasOpenScript,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: "outline-none",
          spellcheck: "true", // Habilita corretor
        },
        transformPastedText(text) {
          let cleaned = text.replace(/(\r?\n\r?\n)/g, "[PARAGRAPH_BREAK]");
          cleaned = cleaned.replace(/[\r\n-]/g, " ");
          return cleaned.replace(/\[PARAGRAPH_BREAK]/g, "\n\n");
        },
      },
    },
    [scriptId]
  );

  // --- HOOKS ---
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
  } = useAutoSave(editor, hasOpenScript ? scriptId : "");

  // --- FILE SYSTEM ---
  const loadWorkspaceFiles = async () => {
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

  useEffect(() => {
    loadWorkspaceFiles();
  }, []);

  useEffect(() => {
    if (saveStatus === "saved") setTimeout(() => loadWorkspaceFiles(), 500);
  }, [saveStatus]);

  // --- ACTIONS ---
  const handleFileSelect = (fileId: string) => {
    if (hasOpenScript) saveContent();
    router.push(`/editor/${encodeURIComponent(fileId)}`);
  };

  const handleCreateNew = async (predefinedSeries?: string) => {
    const path = localStorage.getItem("yousee_workspace_path");

    if (path) {
      const newId = generateId();

      const prefix = predefinedSeries
        ? predefinedSeries.replace(/[^a-z0-9]/gi, "_").toLowerCase()
        : "roteiro";

      const filename = `${prefix}-${newId.slice(0, 6)}.yousee`;
      const separator = path.includes("\\") ? "\\" : "/";
      const fullPath = `${path}${separator}${filename}`;

      if (predefinedSeries && window.electron) {
        const initialContent = {
          id: fullPath,
          title: "",
          seriesTitle: predefinedSeries,
          chapterNumber: "",
          content: null,
          lastModified: Date.now(),
        };
        await window.electron.saveToWorkspace(
          fullPath,
          JSON.stringify(initialContent)
        );
        setTimeout(() => loadWorkspaceFiles(), 200);
      }

      router.push(`/editor/${encodeURIComponent(fullPath)}`);
    } else {
      const newPath = await window.electron?.selectFolder();
      if (newPath) {
        localStorage.setItem("yousee_workspace_path", newPath);
        loadWorkspaceFiles();
      }
    }
  };

  // 3. LÓGICA DE DELETE COM MODAL
  const requestDeleteFile = (fileId: string) => {
    setFileToDelete(fileId); // Abre o modal
  };

  const executeDelete = async () => {
    if (fileToDelete) {
      await deleteScript(fileToDelete);
      await loadWorkspaceFiles();
      // Se apagou o arquivo que estava aberto, volta pra home
      if (fileToDelete === scriptId) {
        router.push("/editor");
      }
      setFileToDelete(null); // Fecha modal
    }
  };

  // --- IMPORTAÇÃO ---
  const handleImportBackup = async () => {
    if (!window.electron) return;

    const workspacePath = localStorage.getItem("yousee_workspace_path");
    if (!workspacePath) {
      alert("Selecione uma pasta de trabalho primeiro!");
      return;
    }

    const result = await window.electron.openFile();
    if (!result || !result.content) return;

    try {
      const data = JSON.parse(result.content);
      const scriptsToImport = Array.isArray(data) ? data : [data];
      let importedCount = 0;

      for (const script of scriptsToImport) {
        if (!script.content) continue;

        const safeTitle = (script.title || "Sem Titulo")
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        const fileId =
          script.id && script.id.length < 10
            ? generateId()
            : script.id || generateId();

        const separator = workspacePath.includes("\\") ? "\\" : "/";
        const filename = `${safeTitle}-${fileId.slice(0, 6)}.yousee`;
        const fullPath = `${workspacePath}${separator}${filename}`;

        const fileContent = {
          ...script,
          id: fullPath,
          lastModified: Date.now(),
        };

        await window.electron.saveToWorkspace(
          fullPath,
          JSON.stringify(fileContent)
        );
        importedCount++;
      }

      alert(`${importedCount} roteiros importados com sucesso!`);
      loadWorkspaceFiles();
    } catch (error) {
      console.error("Erro ao importar:", error);
      alert("Erro ao ler arquivo. Verifique se é um backup válido.");
    }
  };

  // --- LISTENERS ---
  useEffect(() => {
    if (!editor || !hasOpenScript) return;
    editor.on("update", saveContent);
    return () => {
      editor.off("update", saveContent);
    };
  }, [editor, saveContent, hasOpenScript]);

  useEffect(() => {
    if (!hasOpenScript) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveContent();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasOpenScript, saveContent]);

  return (
    <DesktopLayout
      header={
        hasOpenScript && editor ? (
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
        ) : null
      }
      sidebarLeft={
        <FileExplorer
          files={workspaceFiles}
          currentFileId={scriptId}
          onFileSelect={handleFileSelect}
          onCreateFile={handleCreateNew}
          onDeleteFile={requestDeleteFile} // <--- Passando a função que abre o modal
        />
      }
      sidebarRight={
        hasOpenScript && editor ? (
          <Sidebar editor={editor} onCloseMobile={() => {}} />
        ) : null
      }
    >
      {hasOpenScript && editor ? (
        <div
          className={`flex justify-center w-full py-12 pt-10 pb-[50vh] px-8 transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <EditorContent editor={editor} />
        </div>
      ) : (
        <StartScreen
          onCreate={() => handleCreateNew()}
          onImport={handleImportBackup}
          hasWorkspace={
            workspaceFiles.length > 0 ||
            (typeof window !== "undefined" &&
              !!localStorage.getItem("yousee_workspace_path"))
          }
        />
      )}

      {/* 4. RENDERIZA O MODAL FORA DO EDITOR, MAS DENTRO DO LAYOUT */}
      <ConfirmModal
        isOpen={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
        onConfirm={executeDelete}
        title="Excluir Roteiro"
        message="Tem certeza que deseja mover este roteiro para o lixo? Essa ação não pode ser desfeita e você perderá todo o conteúdo escrito."
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        isDestructive={true}
      />
    </DesktopLayout>
  );
}
