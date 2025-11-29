import { Editor } from "@tiptap/react";
import Link from "next/link";
import {
  Bold,
  Italic,
  Undo,
  Redo,
  Clapperboard,
  User,
  MessageSquare,
  Music,
  FilePlus,
  Save,
  Type,
  Bookmark,
  Printer,
  ChevronLeft, // Seta para voltar
} from "lucide-react";
import { useEffect, useState } from "react";

interface EditorToolbarProps {
  editor: Editor | null;
  title: string;
  setTitle: (newTitle: string) => void;
}

export function EditorToolbar({ editor, title, setTitle }: EditorToolbarProps) {
  const [, forceUpdate] = useState(0);

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

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 justify-between shadow-md">
      
      {/* LADO ESQUERDO: Navegação e Título */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard" 
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
          title="Voltar ao Dashboard"
        >
          <ChevronLeft size={20} />
        </Link>

        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-transparent text-gray-200 font-bold text-sm focus:outline-none focus:bg-zinc-900 rounded px-2 py-1 w-32 sm:w-48 transition-colors border border-transparent focus:border-zinc-700 placeholder-zinc-600 truncate"
          placeholder="Nome do Roteiro"
        />

        <div className="w-px h-6 bg-zinc-800 mx-2 hidden lg:block" />

        {/* Histórico (Escondido em mobile se necessário) */}
        <div className="hidden lg:flex items-center gap-1">
          <button onClick={() => editor.chain().focus().undo().run()} className={btnClass} title="Desfazer">
            <Undo size={18} />
          </button>
          <button onClick={() => editor.chain().focus().redo().run()} className={btnClass} title="Refazer">
            <Redo size={18} />
          </button>
        </div>
      </div>

      {/* CENTRO: Elementos de Roteiro */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar px-2">
        <button
          onClick={() => {
            // Lógica Inteligente de Nova Página
            const { doc } = editor.state;
            const lastNode = doc.lastChild;
            const endPos = doc.content.size;

            const isLastPageEmpty = 
              lastNode && 
              lastNode.type.name === 'page' && 
              lastNode.textContent.trim() === '';

            const newPageContent = [
              { type: "storyPageHeader" },
              { type: "panel", content: [{ type: "text", text: " " }] },
              { type: "paragraph" },
            ];

            if (isLastPageEmpty) {
              // Aproveita a página vazia
              const lastPagePos = endPos - lastNode.nodeSize;
              editor.chain()
                .focus()
                .deleteRange({ from: lastPagePos + 1, to: endPos - 1 })
                .insertContentAt(lastPagePos + 1, newPageContent)
                .run();
            } else {
              // Cria nova página
              editor.chain()
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
          title="Nova Página da História"
        >
          <Bookmark size={18} />
          <span className="hidden xl:inline">Página</span>
        </button>

        <button onClick={() => editor.chain().focus().setNode("panel").run()} className={`${btnClass} ${isActive("panel")}`} title="Cena">
          <Clapperboard size={18} />
          <span className="hidden sm:inline">Cena</span>
        </button>

        <button onClick={() => editor.chain().focus().setNode("paragraph").run()} className={`${btnClass} ${isActive("paragraph")}`} title="Ação">
          <Type size={18} />
          <span className="hidden sm:inline">Ação</span>
        </button>

        <button onClick={() => editor.chain().focus().setNode("character").run()} className={`${btnClass} ${isActive("character")}`} title="Personagem">
          <User size={18} />
          <span className="hidden sm:inline">Person.</span>
        </button>

        <button onClick={() => editor.chain().focus().setNode("dialogue").run()} className={`${btnClass} ${isActive("dialogue")}`} title="Diálogo">
          <MessageSquare size={18} />
          <span className="hidden xl:inline">Diálogo</span>
        </button>

        <button onClick={() => editor.chain().focus().setNode("sfx").run()} className={`${btnClass} ${isActive("sfx")}`} title="Som">
          <Music size={18} />
          <span className="hidden xl:inline">Som</span>
        </button>
      </div>

      {/* DIREITA: Sistema */}
      <div className="flex items-center gap-2 border-l border-zinc-800 pl-4 ml-4">
        {/* Nova Folha Física (Opcional, escondido em telas pequenas) */}
        <button
          onClick={() => {
            const endPos = editor.state.doc.content.size;
            editor.chain().focus().insertContentAt(endPos, {
                type: "page",
                content: [
                  { type: "panel", content: [{ type: "text", text: " " }] },
                  { type: "paragraph" },
                ],
              }).scrollIntoView().run();
          }}
          className={`${btnClass} hidden 2xl:flex`}
          title="Nova Folha Física"
        >
          <FilePlus size={18} />
        </button>

        <button 
          onClick={() => window.print()} 
          className="bg-zinc-800 hover:bg-zinc-700 text-gray-200 px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition-colors border border-zinc-700"
          title="Exportar PDF"
        >
          <Printer size={16} />
          <span className="hidden sm:inline">PDF</span>
        </button>

        {/* Indicador de Salvamento */}
        <button className="text-gray-500 px-2 py-1.5 text-xs flex items-center gap-1 cursor-default opacity-70">
          <Save size={14} />
          <span className="hidden sm:inline">Salvo</span>
        </button>
      </div>
    </div>
  );
}