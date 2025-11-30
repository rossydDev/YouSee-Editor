import { Editor } from "@tiptap/react";
import Link from "next/link";
import {
  Clapperboard, User, MessageSquare, Music, Bookmark, ChevronLeft, Type, Menu, X
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
  isSidebarOpen
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

  const isActive = (type: string) =>
    editor.isActive(type)
      ? "bg-orange-500/20 text-orange-500 border-orange-500"
      : "text-gray-400 hover:bg-zinc-800 hover:text-gray-200 border-transparent";

  const btnClass = "p-2 rounded border transition-colors flex items-center gap-2 text-sm font-medium shrink-0";

  const filteredSeries = existingSeries.filter(
    (s) => s.toLowerCase().includes(seriesTitle.toLowerCase()) && s !== seriesTitle
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-2 sm:px-4 shadow-md gap-2 select-none">
      
      {/* 1. ESQUERDA: Menu & Metadados */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
         <Link
          href="/dashboard"
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors shrink-0 hidden md:block"
          title="Voltar ao Dashboard"
        >
          <ChevronLeft size={20} />
        </Link>
        
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded transition-colors ${isSidebarOpen ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
          title={isSidebarOpen ? "Fechar Menu" : "Abrir Menu"}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Inputs Group */}
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="relative hidden sm:block">
            <input
              type="text"
              value={seriesTitle}
              onChange={(e) => { setSeriesTitle(e.target.value); setShowSeriesSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSeriesSuggestions(false), 200)}
              className="bg-transparent text-zinc-400 text-xs sm:text-sm focus:outline-none focus:bg-zinc-900 rounded px-2 py-1 w-20 sm:w-28 transition-colors border border-transparent focus:border-zinc-700 placeholder-zinc-600 text-right truncate"
              placeholder="Série"
            />
            {showSeriesSuggestions && filteredSeries.length > 0 && (
              <ul className="absolute top-full left-0 w-48 bg-zinc-900 border border-zinc-700 rounded-md shadow-xl mt-1 z-[60] overflow-hidden">
                {filteredSeries.map((serie) => (
                  <li key={serie} onMouseDown={() => { setSeriesTitle(serie); setShowSeriesSuggestions(false); }} className="px-3 py-2 text-sm text-zinc-300 hover:bg-orange-600 hover:text-white cursor-pointer transition-colors">
                    {serie}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <span className="text-zinc-600 font-mono hidden sm:inline">#</span>
          <input type="number" value={chapterNumber} onChange={(e) => setChapterNumber(e.target.value)} className="hidden sm:block bg-transparent text-orange-500 font-mono font-bold text-xs sm:text-sm focus:outline-none focus:bg-zinc-900 rounded px-1 py-1 w-10 sm:w-14 transition-colors border border-transparent focus:border-zinc-700 placeholder-zinc-700 text-center" placeholder="#" />
          <span className="text-zinc-600 hidden sm:inline">|</span>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-transparent text-gray-200 font-bold text-sm focus:outline-none focus:bg-zinc-900 rounded px-2 py-1 w-full min-w-[100px] transition-colors border border-transparent focus:border-zinc-700 placeholder-zinc-600 truncate" placeholder="Título do Episódio" />
        </div>
      </div>

      {/* 2. CENTRO: Ferramentas (Agora com Nova Página de volta!) */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-2 shrink-0 max-w-[35vw] md:max-w-none mask-linear-fade">
        
        {/* BOTÃO NOVA PÁGINA (Restaurado) */}
        <button
          onClick={() => {
            const { doc } = editor.state;
            const lastNode = doc.lastChild;
            const endPos = doc.content.size;
            
            // Verifica se a última página já está vazia para não criar duplicatas desnecessárias
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
              // Se já está vazia, apenas limpa e foca nela
              const lastPagePos = endPos - lastNode.nodeSize;
              editor.chain().focus().deleteRange({ from: lastPagePos + 1, to: endPos - 1 }).insertContentAt(lastPagePos + 1, newPageContent).run();
            } else {
              // Cria nova página no final
              editor.chain().focus().insertContentAt(endPos, { type: "page", content: newPageContent }).scrollIntoView().run();
            }
          }}
          className={`${btnClass} ${isActive("storyPageHeader")}`}
          title="Nova Página"
        >
          <Bookmark size={18} />
        </button>

        <div className="w-px h-6 bg-zinc-800 mx-1" /> {/* Divisor visual */}

        <button onClick={() => editor.chain().focus().setNode("panel").run()} className={`${btnClass} ${isActive("panel")}`} title="Cena (Tab)">
          <Clapperboard size={18} />
        </button>
        <button onClick={() => editor.chain().focus().setNode("paragraph").run()} className={`${btnClass} ${isActive("paragraph")}`} title="Ação">
          <Type size={18} />
        </button>
        <button onClick={() => editor.chain().focus().setNode("character").run()} className={`${btnClass} ${isActive("character")}`} title="Personagem">
          <User size={18} />
        </button>
        <button onClick={() => editor.chain().focus().setNode("dialogue").run()} className={`${btnClass} ${isActive("dialogue")}`} title="Diálogo">
          <MessageSquare size={18} />
        </button>
        <button onClick={() => editor.chain().focus().setNode("sfx").run()} className={`${btnClass} ${isActive("sfx")}`} title="Som">
          <Music size={18} />
        </button>
      </div>

      {/* 3. DIREITA: Exportação */}
      <ExportMenu editor={editor} title={title} seriesTitle={seriesTitle} chapterNumber={chapterNumber} saveStatus={saveStatus} />
    </div>
  );
}