import { Editor } from "@tiptap/react";
import {
  Bold,
  Bookmark,
  ChevronLeft,
  Clapperboard,
  Italic,
  Menu,
  MessageSquare,
  Music,
  Type,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ExportMenu } from "./toolbar/ExportMenu";

interface EditorToolbarProps {
  editor: Editor | null;
  title: string;
  setTitle: (val: string) => void;
  seriesTitle: string;
  setSeriesTitle: (val: string) => void;
  chapterNumber: string;
  setChapterNumber: (val: string) => void;
  existingSeries: string[];
  saveStatus: "saved" | "saving";
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function EditorToolbar({
  editor,
  title,
  setTitle,
  seriesTitle,
  setSeriesTitle,
  chapterNumber,
  setChapterNumber,
  existingSeries,
  saveStatus,
  toggleSidebar,
  isSidebarOpen,
}: EditorToolbarProps) {
  const [, forceUpdate] = useState(0);
  const [showSeriesSuggestions, setShowSeriesSuggestions] = useState(false);

  // DEBUG: Monitorando o estado em tempo real
  console.log("🔍 TOOLBAR DEBUG:", {
    inputAtual: seriesTitle,
    seriesDisponiveis: existingSeries,
    sugestoesVisiveis: showSeriesSuggestions,
    filtradas: existingSeries.filter((s) =>
      s.toLowerCase().includes((seriesTitle || "").toLowerCase())
    ),
  });

  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => forceUpdate((prev) => prev + 1);
    editor.on("transaction", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);
    editor.on("update", handleUpdate);
    return () => {
      editor.off("transaction", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  const isActive = (type: string, attr?: any) =>
    editor.isActive(type, attr)
      ? "bg-orange-500/20 text-orange-500 border-orange-500"
      : "text-gray-400 hover:bg-zinc-800 hover:text-gray-200 border-transparent";

  const btnClass =
    "p-1.5 sm:p-2 rounded border transition-colors flex items-center gap-2 text-sm font-medium shrink-0";

  const filteredSeries = existingSeries.filter((s) =>
    s.toLowerCase().includes((seriesTitle || "").toLowerCase())
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-2 sm:px-4 shadow-md gap-2 select-none">
      {/* FIX CSS: Removi o 'overflow-hidden' daqui.
         Troquei por apenas 'flex-1 min-w-0' para permitir que o Dropdown "vaze" para fora.
      */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded transition-colors shrink-0 ${
            isSidebarOpen
              ? "text-white bg-zinc-800"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
          title={isSidebarOpen ? "Fechar Menu" : "Abrir Menu"}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link
          href="/dashboard"
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors shrink-0 hidden md:block"
          title="Voltar ao Dashboard"
        >
          <ChevronLeft size={20} />
        </Link>

        {/* Inputs Group */}
        <div className="flex items-center gap-2 relative min-w-0 flex-1">
          {/* Série - Container relativo para ancorar o menu absoluto */}
          <div className="relative hidden lg:block group">
            <input
              type="text"
              value={seriesTitle}
              onChange={(e) => {
                setSeriesTitle(e.target.value);
                if (!showSeriesSuggestions) setShowSeriesSuggestions(true);
              }}
              onFocus={() => setShowSeriesSuggestions(true)}
              onBlur={() =>
                setTimeout(() => setShowSeriesSuggestions(false), 200)
              }
              className="bg-transparent text-zinc-400 text-xs sm:text-sm focus:outline-none focus:bg-zinc-900 rounded px-2 py-1 w-20 sm:w-28 transition-colors border border-transparent focus:border-zinc-700 placeholder-zinc-600 text-right truncate"
              placeholder="Série"
            />

            {/* MENU SUSPENSO */}
            {showSeriesSuggestions && filteredSeries.length > 0 && (
              <ul className="absolute top-full left-0 w-48 bg-zinc-900 border border-zinc-700 rounded-md shadow-xl mt-1 z-[9999] overflow-hidden max-h-60 overflow-y-auto">
                {filteredSeries.map((serie) => (
                  <li
                    key={serie}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      console.log("Clicou na série:", serie); // Log do clique
                      setSeriesTitle(serie);
                      setShowSeriesSuggestions(false);
                    }}
                    className="px-3 py-2 text-sm text-zinc-300 hover:bg-orange-600 hover:text-white cursor-pointer transition-colors text-left"
                  >
                    {serie}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <span className="text-zinc-600 font-mono hidden lg:inline">#</span>

          {/* Capítulo */}
          <input
            type="number"
            value={chapterNumber}
            onChange={(e) => setChapterNumber(e.target.value)}
            className="hidden lg:block bg-transparent text-orange-500 font-mono font-bold text-xs sm:text-sm focus:outline-none focus:bg-zinc-900 rounded px-1 py-1 w-10 sm:w-14 transition-colors border border-transparent focus:border-zinc-700 placeholder-zinc-700 text-center"
            placeholder="#"
          />

          <span className="text-zinc-600 hidden lg:inline">|</span>

          {/* Título - Continua com truncate para não quebrar layout se for longo */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-gray-200 font-bold text-sm focus:outline-none focus:bg-zinc-900 rounded px-2 py-1 w-full min-w-[50px] transition-colors border border-transparent focus:border-zinc-700 placeholder-zinc-600 truncate"
            placeholder="Título do Episódio"
          />
        </div>
      </div>

      {/* 2. CENTRO: Ferramentas */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-2 shrink-0 max-w-[45vw] md:max-w-none mask-linear-fade">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${btnClass} ${isActive("bold")}`}
          title="Negrito (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${btnClass} ${isActive("italic")}`}
          title="Itálico (Ctrl+I)"
        >
          <Italic size={16} />
        </button>

        <div className="w-px h-5 bg-zinc-800 mx-1 shrink-0" />

        <button
          onClick={() => {
            const { doc } = editor.state;
            const endPos = doc.content.size;
            const newPageContent = [
              { type: "storyPageHeader" },
              { type: "panel", content: [{ type: "text", text: " " }] },
              { type: "paragraph" },
            ];
            editor
              .chain()
              .focus()
              .insertContentAt(endPos, {
                type: "page",
                content: newPageContent,
              })
              .scrollIntoView()
              .run();
          }}
          className={`${btnClass} ${isActive("storyPageHeader")}`}
          title="Nova Página (Ctrl+Shift+Enter)"
        >
          <Bookmark size={18} />
        </button>

        <div className="w-px h-5 bg-zinc-800 mx-1 shrink-0" />

        <button
          onClick={() => editor.chain().focus().setNode("panel").run()}
          className={`${btnClass} ${isActive("panel")}`}
          title="Novo Painel (Ctrl+Enter)"
        >
          <Clapperboard size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setNode("paragraph").run()}
          className={`${btnClass} ${isActive("paragraph")}`}
          title="Ação / Parágrafo"
        >
          <Type size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setNode("character").run()}
          className={`${btnClass} ${isActive("character")}`}
          title="Personagem (Tab no início)"
        >
          <User size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setNode("dialogue").run()}
          className={`${btnClass} ${isActive("dialogue")}`}
          title="Diálogo (Tab no personagem)"
        >
          <MessageSquare size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setNode("sfx").run()}
          className={`${btnClass} ${isActive("sfx")}`}
          title="Efeito Sonoro (Ctrl+Shift+S)"
        >
          <Music size={18} />
        </button>
      </div>

      {/* 3. DIREITA: Exportação */}
      <ExportMenu
        editor={editor}
        title={title}
        seriesTitle={seriesTitle}
        chapterNumber={chapterNumber}
        saveStatus={saveStatus}
      />
    </div>
  );
}
