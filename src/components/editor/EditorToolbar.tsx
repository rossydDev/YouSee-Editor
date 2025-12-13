import { Editor } from "@tiptap/react";
import {
  Bold,
  Bookmark,
  CheckCircle2,
  Clapperboard,
  Italic,
  Loader2,
  MessageSquare,
  Music,
  Type,
  User,
} from "lucide-react";
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
}: EditorToolbarProps) {
  const [, forceUpdate] = useState(0);
  const [showSeriesSuggestions, setShowSeriesSuggestions] = useState(false);

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
    <div className="h-12 flex items-center justify-between px-2 sm:px-4 gap-4 select-none w-full">
      {/* 1. ESQUERDA: Inputs de Metadados */}
      <div className="flex items-center gap-2 min-w-0 shrink-1">
        {/* Inputs Group */}
        <div className="flex items-center gap-2 relative min-w-0">
          {/* Série (Esconde em telas muito pequenas mobile) */}
          <div className="relative hidden sm:block group">
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

            {showSeriesSuggestions && filteredSeries.length > 0 && (
              <ul className="absolute top-full left-0 w-48 bg-zinc-900 border border-zinc-700 rounded-md shadow-xl mt-1 z-[9999] overflow-hidden max-h-60 overflow-y-auto">
                {filteredSeries.map((serie) => (
                  <li
                    key={serie}
                    onMouseDown={(e) => {
                      e.preventDefault();
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
            className="hidden sm:block bg-transparent text-orange-500 font-mono font-bold text-xs sm:text-sm focus:outline-none focus:bg-zinc-900 rounded px-1 py-1 w-10 sm:w-14 transition-colors border border-transparent focus:border-zinc-700 placeholder-zinc-700 text-center"
            placeholder="#"
          />

          <span className="text-zinc-600 hidden lg:inline">|</span>

          {/* Título Principal */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-gray-200 font-bold text-sm focus:outline-none focus:bg-zinc-900 rounded px-2 py-1 w-32 sm:w-64 transition-colors border border-transparent focus:border-zinc-700 placeholder-zinc-600 truncate"
            placeholder="Título do Episódio"
          />
        </div>
      </div>

      {/* 2. CENTRO: Ferramentas (Toolbar) - CORRIGIDO */}
      {/* Removi o 'hidden xl:flex' e coloquei flex com overflow para não quebrar nunca */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-2 shrink-0 mask-linear-fade max-w-[40vw] justify-center">
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

      {/* 3. DIREITA: Status e Exportação */}
      <div className="flex items-center gap-3 shrink-0">
        {/* INDICADOR DE SAVE */}
        <div className="flex items-center gap-1.5 px-2">
          {saveStatus === "saving" ? (
            <>
              <Loader2 size={12} className="animate-spin text-orange-500" />
              <span className="text-xs text-zinc-500 hidden sm:inline">
                Salvando...
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 size={14} className="text-orange-500" />
              <span className="text-xs text-zinc-500 hidden sm:inline">
                Salvo
              </span>
            </>
          )}
        </div>

        <div className="w-px h-6 bg-zinc-800 hidden sm:block"></div>

        <ExportMenu
          editor={editor}
          title={title}
          seriesTitle={seriesTitle}
          chapterNumber={chapterNumber}
          saveStatus={saveStatus}
        />
      </div>
    </div>
  );
}
