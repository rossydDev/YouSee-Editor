import { Editor } from "@tiptap/react";
import { Hash, ChevronRight, FileText, X } from "lucide-react";
import { useSceneDetection } from "@/hooks/useSceneDetection";
import { useState } from "react";

interface SidebarProps {
  editor: Editor | null;
  // isOpen removido pois o pai controla a visibilidade do container
  onCloseMobile?: () => void; // Para fechar ao clicar num item (UX mobile)
}

export function Sidebar({ editor, onCloseMobile }: SidebarProps) {
  const pages = useSceneDetection(editor);
  const [expandedPages, setExpandedPages] = useState<number[]>([1]);

  if (!editor) return null;

  const togglePage = (pageNumber: number) => {
    setExpandedPages((prev) => 
      prev.includes(pageNumber)
        ? prev.filter((p) => p !== pageNumber)
        : [...prev, pageNumber]
    );
  };

  const scrollToPos = (pos: number) => {
    const dom = editor.view.domAtPos(pos + 1).node as HTMLElement;
    if (dom && dom.scrollIntoView) {
       dom.scrollIntoView({ behavior: 'smooth', block: 'center' });
       editor.commands.focus();
       editor.commands.setTextSelection(pos + 1);
       
       // UX: Fecha menu no mobile após navegar
       if (window.innerWidth < 1280 && onCloseMobile) {
         onCloseMobile();
       }
    }
  };

  return (
    // Removemos 'fixed', 'w-64', 'border-r' etc. O Layout cuida disso.
    // Aqui cuidamos apenas do conteúdo interno (height full)
    <div className="h-full flex flex-col">
      
      {/* Header da Sidebar */}
      <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-950 sticky top-0 z-10">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <Hash size={14} />
          Navegação
        </h3>
        
        {/* Botão fechar (Apenas Mobile) */}
        <button 
          onClick={onCloseMobile}
          className="xl:hidden text-zinc-500 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Lista Scrollável */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-20">
        {pages.length === 0 && (
          <p className="text-sm text-zinc-600 italic">Nenhuma cena detectada.</p>
        )}

        <div className="space-y-2">
          {pages.map((page) => {
            const isExpanded = expandedPages.includes(page.pageNumber);
            const hasScenes = page.scenes.length > 0;

            return (
              <div key={page.pageNumber} className="border-b border-zinc-900/50 pb-2 last:border-0">
                <button 
                  onClick={() => togglePage(page.pageNumber)}
                  className={`
                    w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all group
                    ${isExpanded ? 'bg-zinc-900' : 'hover:bg-zinc-900/50'}
                  `}
                >
                  <div className={`text-zinc-600 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                    {hasScenes ? <ChevronRight size={14} /> : <div className="w-[14px]" />} 
                  </div>
                  <FileText size={14} className={isExpanded ? "text-orange-500" : "text-zinc-500"} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${isExpanded ? "text-zinc-200" : "text-zinc-500"}`}>
                    Page {page.pageNumber}
                  </span>
                  {hasScenes && (
                    <span className="ml-auto text-[10px] bg-zinc-800 text-zinc-500 px-1.5 rounded-full min-w-[18px] text-center">
                      {page.scenes.length}
                    </span>
                  )}
                </button>

                {isExpanded && hasScenes && (
                  <div className="mt-1 ml-4 border-l border-zinc-800 pl-2 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                    {page.scenes.map((scene, idx) => (
                      <button
                        key={`${page.pageNumber}-${idx}`}
                        onClick={(e) => {
                          e.stopPropagation();
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
    </div>
  );
}