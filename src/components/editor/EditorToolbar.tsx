import { Editor } from "@tiptap/react";
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
} from "lucide-react";
import { useEffect, useState } from "react";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  // Estado "falso" apenas para forçar o React a renderizar a barra quando o editor mudar
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!editor) return;

    // Função que força a atualização visual
    const handleUpdate = () => forceUpdate((prev) => prev + 1);

    // Escuta: transações (digitar), mudanças de seleção (clicar) e atualizações gerais
    editor.on("transaction", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);
    editor.on("update", handleUpdate);

    // Limpeza quando o componente desmontar
    return () => {
      editor.off("transaction", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  // Função auxiliar para verificar se o botão está ativo
  const isActive = (type: string) =>
    editor.isActive(type)
      ? "bg-orange-500/20 text-orange-500 border-orange-500"
      : "text-gray-400 hover:bg-zinc-800 hover:text-gray-200 border-transparent";

  // Estilo base dos botões
  const btnClass =
    "p-2 rounded border transition-colors flex items-center gap-2 text-sm font-medium";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 justify-between shadow-md">
      {/* Grupo 1: Histórico e Formatação Básica */}
      <div className="flex items-center gap-1 border-r border-zinc-800 pr-4 mr-4">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className={btnClass}
          title="Desfazer"
        >
          <Undo size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className={btnClass}
          title="Refazer"
        >
          <Redo size={18} />
        </button>
        <div className="w-px h-6 bg-zinc-800 mx-2" />
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${btnClass} ${isActive("bold")}`}
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${btnClass} ${isActive("italic")}`}
        >
          <Italic size={18} />
        </button>
      </div>

      {/* Grupo 2: Elementos de Roteiro (O Coração do YouSee) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            const { doc } = editor.state;
            const lastNode = doc.lastChild;
            const endPos = doc.content.size;

            // Lógica de Detecção de Página Vazia
            // Verificamos se o último nó é uma página e se não tem texto escrito
            const isLastPageEmpty = 
              lastNode && 
              lastNode.type.name === 'page' && 
              lastNode.textContent.trim() === '';

            // A estrutura padrão de uma Nova Página de História
            const newPageContent = [
              { type: "storyPageHeader" },
              { type: "panel", content: [{ type: "text", text: " " }] },
              { type: "paragraph" },
            ];

            if (isLastPageEmpty) {
              // CENÁRIO A: A última página está vazia (aproveitar ela!)
              
              // 1. Calculamos onde essa página começa
              const lastPagePos = endPos - lastNode.nodeSize;
              
              // 2. Substituímos o conteúdo dela
              editor.chain()
                .focus()
                // Apaga o conteúdo atual da página vazia (para limpar parágrafos soltos)
                .deleteRange({ from: lastPagePos + 1, to: endPos - 1 })
                // Insere a estrutura correta (Header + Painel)
                .insertContentAt(lastPagePos + 1, newPageContent)
                .run();
                
            } else {
              // CENÁRIO B: A página anterior tem conteúdo (criar nova!)
              
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
        <button
          onClick={() => editor.chain().focus().setNode("panel").run()}
          className={`${btnClass} ${isActive("panel")}`}
        >
          <Clapperboard size={18} />
          <span>Cena</span>
        </button>

        <button
          onClick={() => editor.chain().focus().setNode("paragraph").run()}
          className={`${btnClass} ${isActive("paragraph")}`}
          title="Ação (Texto Normal)"
        >
          <Type size={18} />
          <span>Ação</span>
        </button>

        <button
          onClick={() => editor.chain().focus().setNode("character").run()}
          className={`${btnClass} ${isActive("character")}`}
        >
          <User size={18} />
          <span>Personagem</span>
        </button>

        <button
          onClick={() => editor.chain().focus().setNode("dialogue").run()}
          className={`${btnClass} ${isActive("dialogue")}`}
        >
          <MessageSquare size={18} />
          <span>Diálogo</span>
        </button>

        <button
          onClick={() => editor.chain().focus().setNode("sfx").run()}
          className={`${btnClass} ${isActive("sfx")}`}
        >
          <Music size={18} />
          <span>Som</span>
        </button>
      </div>

      {/* Grupo 3: Ações de Página */}
      <div className="flex items-center gap-2 border-l border-zinc-800 pl-4 ml-4">
        {/* Botão para testar nossa futura Paginação Manual/Auto */}
        <button 
          onClick={() => window.print()} 
          className="bg-zinc-800 hover:bg-zinc-700 text-gray-200 px-4 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition-colors border border-zinc-700"
          title="Exportar como PDF"
        >
          <Printer size={16} />
          <span className="hidden sm:inline">PDF</span>
        </button>

        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition-colors">
          <Save size={16} />
          Salvar
        </button>
      </div>
    </div>
  );
}
