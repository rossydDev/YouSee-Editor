import { Editor } from "@tiptap/react";
import { Hash, ChevronRight, ChevronDown, FileText } from "lucide-react";
import { useSceneDetection } from "@/hooks/useSceneDetection";
import { useState } from "react";

interface SidebarProps {
  editor: Editor | null;
  isOpen: boolean;
}

export function Sidebar({ editor, isOpen }: SidebarProps) {
  const pages = useSceneDetection(editor);
  
  // Estado para controlar quais páginas estão expandidas
  // Inicializamos com a Página 1 aberta por padrão
  const [expandedPages, setExpandedPages] = useState<number[]>([1]);

  if (!editor) return null;

  const togglePage = (pageNumber: number) => {
    setExpandedPages((prev) => 
      prev.includes(pageNumber)
        ? prev.filter((p) => p !== pageNumber) // Fecha se estiver aberto
        : [...prev, pageNumber] // Abre se estiver fechado
    );
  };

  const scrollToPos = (pos: number) => {
    const dom = editor.view.domAtPos(pos + 1).node as HTMLElement;
    if (dom && dom.scrollIntoView) {
       dom.scrollIntoView({ behavior: 'smooth', block: 'center' });
       editor.commands.focus();
       editor.commands.setTextSelection(pos + 1);
    }
  };

  return (
    <aside
      className={`
        fixed left-0 top-14 bottom-0 z-40
        w-64 bg-zinc-950 border-r border-zinc-800
        transition-transform duration-300 ease-in-out
        overflow-y-auto custom-scrollbar select-none
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        xl:translate-x-0 xl:border-r xl:border-zinc-800
      `}
    >
      <div className="p-4 pb-20">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-2 sticky top-0 bg-zinc-950 py-2 z-10 border-b border-zinc-900">
          <Hash size={14} />
          Navegação
        </h3>

        {pages.length === 0 && (
          <p className="text-sm text-zinc-600 italic">Nenhuma cena detectada.</p>
        )}

        <div className="space-y-2">
          {pages.map((page) => {
            const isExpanded = expandedPages.includes(page.pageNumber);
            const hasScenes = page.scenes.length > 0;

            return (
              <div key={page.pageNumber} className="border-b border-zinc-900/50 pb-2 last:border-0">
                
                {/* CABEÇALHO DA PÁGINA (BOTÃO ACORDION) */}
                <button 
                  onClick={() => togglePage(page.pageNumber)}
                  className={`
                    w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all group
                    ${isExpanded ? 'bg-zinc-900' : 'hover:bg-zinc-900/50'}
                  `}
                >
                  {/* Ícone de Seta (Gira quando abre) */}
                  <div className={`text-zinc-600 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                    {hasScenes ? <ChevronRight size={14} /> : <div className="w-[14px]" />} 
                  </div>

                  {/* Ícone de Página */}
                  <FileText size={14} className={isExpanded ? "text-orange-500" : "text-zinc-500"} />

                  <span className={`text-xs font-bold uppercase tracking-wider ${isExpanded ? "text-zinc-200" : "text-zinc-500"}`}>
                    Page {page.pageNumber}
                  </span>
                  
                  {/* Badge com contagem de cenas */}
                  {hasScenes && (
                    <span className="ml-auto text-[10px] bg-zinc-800 text-zinc-500 px-1.5 rounded-full min-w-[18px] text-center">
                      {page.scenes.length}
                    </span>
                  )}
                </button>

                {/* LISTA DE CENAS (CONTEÚDO DO ACORDION) */}
                {isExpanded && hasScenes && (
                  <div className="mt-1 ml-4 border-l border-zinc-800 pl-2 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                    {page.scenes.map((scene, idx) => (
                      <button
                        key={`${page.pageNumber}-${idx}`}
                        onClick={(e) => {
                          e.stopPropagation(); // Evita fechar a página ao clicar na cena
                          scrollToPos(scene.pos);
                        }}
                        className="w-full text-left text-sm text-zinc-500 hover:text-orange-500 hover:bg-zinc-900/30 py-1.5 px-2 rounded-md transition-all truncate flex items-center gap-2 group relative"
                        title={scene.label}
                      >
                        <span className="text-[10px] font-mono text-zinc-700 group-hover:text-orange-500/40 min-w-[15px]">
                          {scene.panelNumber}.
                        </span>
                        
                        <span className="truncate text-xs group-hover:translate-x-0.5 transition-transform">
                          {scene.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}