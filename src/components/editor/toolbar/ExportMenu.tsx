import { Editor } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";
import { useScriptExport } from "@/hooks/useScriptFormat";
import { 
  Printer, 
  RefreshCw, 
  ChevronDown, 
  FileText, 
  Moon, 
  CheckCircle2 
} from "lucide-react";

interface ExportMenuProps {
  editor: Editor | null;
  title: string;
  seriesTitle: string;
  chapterNumber: string;
  saveStatus: "saved" | "saving";
}

export function ExportMenu({ editor, title, seriesTitle, chapterNumber, saveStatus }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { exportPdf, isExporting } = useScriptExport();

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = (theme: "standard" | "dark") => {
    if (!editor) return;
    exportPdf({
      title,
      seriesTitle,
      chapterNumber,
      editorContent: editor.getJSON(),
      theme,
    });
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isExporting}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-medium transition-all
            ${isOpen 
              ? "bg-zinc-800 border-zinc-700 text-white" 
              : "bg-transparent border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"}
            ${isExporting ? "opacity-50 cursor-wait" : ""}
          `}
        >
          {isExporting ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Printer size={16} />
          )}
          <span className="hidden sm:inline">Exportar</span>
          <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
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
                <div className="text-sm font-medium text-zinc-200">Padrão Indústria</div>
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
                <div className="text-sm font-medium text-orange-500">YouSee Dark</div>
                <div className="text-xs text-zinc-500">Estilo digital, Alto contraste</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* STATUS DE SALVAMENTO */}
      <div className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded border text-xs font-medium cursor-default select-none min-w-[100px] ${saveStatus === "saving" ? "bg-orange-500/10 border-orange-500/20 text-orange-500" : "bg-zinc-900/50 border-zinc-800 text-zinc-500"}`}>
        {saveStatus === "saving" ? (
          <>
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
  );
}