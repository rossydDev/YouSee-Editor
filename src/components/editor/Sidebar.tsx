import { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { Hash } from "lucide-react";

interface SidebarProps {
  editor: Editor | null;
  isOpen: boolean;
}

interface SceneItem {
  pos: number;
  label: string;
}

export function Sidebar({ editor, isOpen }: SidebarProps) {
  const [scenes, setScenes] = useState<SceneItem[]>([]);

  useEffect(() => {
    if (!editor) return;

    const updateScenes = () => {
      const newScenes: SceneItem[] = [];
      let pageCount = 0;   // Tracks the current Story Page
      let panelCount = 0;  // Tracks the Panel number relative to the page

      editor.state.doc.descendants((node, pos) => {
        // 1. Detect Page Header (Increments Page Count)
        if (node.type.name === "storyPageHeader") {
          pageCount++;
          panelCount = 0; // Reset panel count for the new page
        }

        // 2. Detect Panel (Increments Panel Count)
        if (node.type.name === "panel") {
          panelCount++;
          
          const text = node.textContent.trim();
          
          // SMART LABEL LOGIC:
          // If user typed something, use it.
          // If empty, generate "PAGE X - PANEL Y"
          let label = text;
          if (!label) {
            // If pageCount is 0 (before first header), treat as Page 1
            const displayPage = pageCount === 0 ? 1 : pageCount;
            label = `PAGE ${displayPage} - PANEL ${panelCount}`;
          }

          newScenes.push({ pos, label });
        }
      });

      setScenes(newScenes);
    };

    editor.on("update", updateScenes);
    editor.on("create", updateScenes);
    updateScenes();

    return () => {
      editor.off("update", updateScenes);
      editor.off("create", updateScenes);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <aside
      className={`
        fixed left-0 top-14 bottom-0 z-40
        w-64 bg-zinc-950 border-r border-zinc-800
        transition-transform duration-300 ease-in-out
        overflow-y-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        xl:translate-x-0 xl:border-r xl:border-zinc-800
      `}
    >
      <div className="p-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Hash size={14} />
          Scene Navigation
        </h3>

        <div className="space-y-1">
          {scenes.length === 0 && (
            <p className="text-sm text-zinc-600 italic">No scenes created.</p>
          )}

          {scenes.map((scene, index) => (
            <button
              key={index}
              onClick={() => {
                const dom = editor.view.domAtPos(scene.pos + 1).node as HTMLElement;
                if (dom && dom.scrollIntoView) {
                   dom.scrollIntoView({ behavior: 'smooth', block: 'center' });
                   // Focus the editor so keyboard works immediately
                   editor.commands.focus();
                   editor.commands.setTextSelection(scene.pos + 1);
                }
              }}
              className="w-full text-left text-sm text-zinc-400 hover:text-orange-500 hover:bg-zinc-900/50 py-2 px-3 rounded transition-colors truncate flex items-center gap-2 group"
              title={scene.label} // Tooltip for long names
            >
              <span className="text-zinc-700 group-hover:text-orange-500/50 text-xs font-mono min-w-[20px]">
                {index + 1}.
              </span>
              <span className="truncate">
                {scene.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}