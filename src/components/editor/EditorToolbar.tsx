import { Editor } from "@tiptap/react";
import Link from "next/link";
import { useScriptExport } from "@/hooks/useScriptFormat";
import {
  Bold,
  Italic,
  Undo,
  Redo,
  Clapperboard,
  User,
  MessageSquare,
  Music,
  Bookmark,
  Printer,
  ChevronLeft,
  Type,
  CheckCircle2,
  RefreshCw,
  Loader,
  Moon,
  FileText,
  ChevronDown
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

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

  // Estados do MENU de Exportação
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const { exportPdf, isExporting } = useScriptExport();

  // Fecha o menu se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setIsExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const isActive = (type: string) =>
    editor.isActive(type)
      ? "bg-orange-500/20 text-orange-500 border-orange-500"
      : "text-gray-400 hover:bg-zinc-800 hover:text-gray-200 border-transparent";

  const btnClass =
    "p-2 rounded border transition-colors flex items-center gap-2 text-sm font-medium";

  const filteredSeries = existingSeries.filter(
    (s) =>
      s.toLowerCase().includes(seriesTitle.toLowerCase()) && s !== seriesTitle
  );

  const handleExport = (theme: "standard" | "dark") => {
    if (!editor) return;
    exportPdf({
      title,
      seriesTitle,
      editorContent: editor.getJSON(),
      theme,
    });
    setIsExportMenuOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 justify-between shadow-md gap-4">
      {/* ESQUERDA: Navegação e Metadados */}
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
        <Link
          href="/dashboard"
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors shrink-0"
          title="Voltar ao Dashboard"
        >
          <ChevronLeft size={20} />
        </Link>

        {/* Grupo de Inputs */}
        <div className="flex items-center gap-2 overflow-visible relative">
          {/* Série */}
          <div className="relative">
            <input
              type="text"
              value={seriesTitle}
              onChange={(e) => {
                setSeriesTitle(e.target.value);
                setShowSeriesSuggestions(true);
              }}
              onFocus={() => setShowSeriesSuggestions(true)}
              onBlur={() =>
                setTimeout(() => setShowSeriesSuggestions(false), 200)
              }
              className="bg-transparent text-zinc-400 text-xs sm:text-sm focus:outline-none focus:bg-zinc-900 rounded px-2 py-1 w-24 sm:w-32 transition-colors border border-transparent focus:border-zinc-700 placeholder-zinc-600 text-right truncate"
              placeholder="Série..."
            />
            {showSeriesSuggestions && filteredSeries.length > 0 && (
              <ul className="absolute top-full left-0 w-48 bg-zinc-900 border border-zinc-700 rounded-md shadow-xl mt-1 z-[60] overflow-hidden">
                {filteredSeries.map((serie) => (
                  <li
                    key={serie}
                    onMouseDown={() => {
                      setSeriesTitle(serie);
                      setShowSeriesSuggestions(false);
                    }}
                    className="px-3 py-2 text-sm text-zinc-300 hover:bg-orange-600 hover:text-white cursor-pointer transition-colors"
                  >
                    {serie}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <span className="text-zinc-600 font-mono">#</span>

          {/* Capítulo */}
          <input
            type="number"
            value={chapterNumber}
            onChange={(e) => setChapterNumber(e.target.value)}
            className="bg-transparent text-orange-500 font-mono font-bold text-xs sm:text-sm focus:outline-none focus:bg-zinc-900 rounded px-1 py-1 w-12 sm:w-14 transition-colors border border-transparent focus:border-zinc-700 placeholder-zinc-700 text-center"
            placeholder="#"
          />

          <span className="text-zinc-600 hidden sm:inline">|</span>

          {/* Título */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-gray-200 font-bold text-sm focus:outline-none focus:bg-zinc-900 rounded px-2 py-1 flex-1 min-w-[100px] transition-colors border border-transparent focus:border-zinc-700 placeholder-zinc-600 truncate"
            placeholder="Título do Episódio"
          />
        </div>
      </div>

      {/* CENTRO: Ferramentas */}
      <div className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar px-2 shrink-0">
        <button
          onClick={() => {
            const { doc } = editor.state;
            const lastNode = doc.lastChild;
            const endPos = doc.content.size;
            const isLastPageEmpty =
              lastNode &&
              lastNode.type.name === "page" &&
              lastNode.textContent.trim() === "";

            const newPageContent = [
              { type: "storyPageHeader" },
              { type: "panel", content: [{ type: "text", text: " " }] },
              { type: "paragraph" },
            ];

            if (isLastPageEmpty) {
              const lastPagePos = endPos - lastNode.nodeSize;
              editor
                .chain()
                .focus()
                .deleteRange({ from: lastPagePos + 1, to: endPos - 1 })
                .insertContentAt(lastPagePos + 1, newPageContent)
                .run();
            } else {
              editor
                .chain()
                .focus()
                .insertContentAt(endPos, {
                  type: "page",
                  content: newPageContent,
                })
                .scrollIntoView()
                .run();
            }
          }}
          className={`${btnClass} ${isActive("storyPageHeader")}`}
          title="Nova Página"
        >
          <Bookmark size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().setNode("panel").run()}
          className={`${btnClass} ${isActive("panel")}`}
          title="Cena"
        >
          <Clapperboard size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().setNode("paragraph").run()}
          className={`${btnClass} ${isActive("paragraph")}`}
          title="Ação"
        >
          <Type size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().setNode("character").run()}
          className={`${btnClass} ${isActive("character")}`}
          title="Personagem"
        >
          <User size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().setNode("dialogue").run()}
          className={`${btnClass} ${isActive("dialogue")}`}
          title="Diálogo"
        >
          <MessageSquare size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().setNode("sfx").run()}
          className={`${btnClass} ${isActive("sfx")}`}
          title="Som"
        >
          <Music size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            disabled={isExporting}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-medium transition-all
              ${
                isExportMenuOpen
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
              }
              ${isExporting ? "opacity-50 cursor-wait" : ""}
            `}
          >
            {isExporting ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Printer size={16} />
            )}
            <span className="hidden sm:inline">Exportar</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${
                isExportMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* O MENU FLUTUANTE */}
          {isExportMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-900/50">
                Formato do Arquivo
              </div>

              <button
                onClick={() => handleExport("standard")}
                className="w-full text-left px-4 py-3 hover:bg-zinc-900 flex items-center gap-3 transition-colors group border-b border-zinc-900"
              >
                <div className="p-2 bg-white text-black rounded border border-zinc-300 group-hover:scale-105 transition-transform">
                  <FileText size={16} />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-200">
                    Padrão Indústria
                  </div>
                  <div className="text-xs text-zinc-500">Fundo branco, A4</div>
                </div>
              </button>

              <button
                onClick={() => handleExport("dark")}
                className="w-full text-left px-4 py-3 hover:bg-zinc-900 flex items-center gap-3 transition-colors group"
              >
                <div className="p-2 bg-zinc-950 text-orange-500 rounded border border-zinc-800 group-hover:scale-105 transition-transform">
                  <Moon size={16} />
                </div>
                <div>
                  <div className="text-sm font-medium text-orange-500">
                    YouSee Dark
                  </div>
                  <div className="text-xs text-zinc-500">
                    Estilo digital, Alto contraste
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* STATUS DINÂMICO */}
        <div
          className={`
          flex items-center justify-center gap-2 px-3 py-1.5 rounded border text-xs font-medium cursor-default select-none transition-all duration-300
          min-w-[100px] /* <--- Largura mínima fixa evita o "pulo" */
          ${
            saveStatus === "saving"
              ? "bg-orange-500/10 border-orange-500/20 text-orange-500"
              : "bg-zinc-900/50 border-zinc-800 text-zinc-500"
          }
        `}
        >
          {saveStatus === "saving" ? (
            <>
              {/* shrink-0 impede o ícone de ser esmagado */}
              <RefreshCw size={12} className="animate-spin shrink-0" />
              <span className="hidden sm:inline">Salvando...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={12} className="text-green-600 shrink-0" />
              <span className="hidden sm:inline">Salvo</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
