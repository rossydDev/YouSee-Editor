"use client";

import { Check, Clipboard, Type } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MenuData {
  x: number;
  y: number;
  suggestions: string[];
  hasSelection: boolean;
}

export function CustomContextMenu() {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Só funciona no ambiente Desktop/Electron
    if (typeof window === "undefined" || !window.electron) return;

    // Ouve o evento vindo do Electron
    window.electron.onShowContextMenu((data: MenuData) => {
      setMenu(data);
    });

    // Fecha ao clicar fora
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenu(null);
      }
    };

    // Fecha ao rolar
    const handleScroll = () => setMenu(null);

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  if (!menu) return null;

  const handleReplace = (word: string) => {
    window.electron?.replaceMisspelling(word);
    setMenu(null);
  };

  const handleCopy = () => {
    const selection = window.getSelection()?.toString();
    if (selection) {
      navigator.clipboard.writeText(selection);
      setMenu(null);
    }
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[160px] bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-100 flex flex-col overflow-hidden text-sm"
      style={{ top: menu.y, left: menu.x }}
    >
      {/* SEÇÃO DE SUGESTÕES DE CORREÇÃO */}
      {menu.suggestions.length > 0 ? (
        <>
          <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Type size={10} />
            <span>Correções</span>
          </div>
          {menu.suggestions.map((word) => (
            <button
              key={word}
              onClick={() => handleReplace(word)}
              className="w-full text-left px-4 py-2 text-zinc-200 hover:bg-orange-500 hover:text-white transition-colors font-medium flex items-center gap-2"
            >
              <Check size={14} className="opacity-50" />
              {word}
            </button>
          ))}
          <div className="h-px bg-zinc-800 my-1 mx-2" />
        </>
      ) : (
        <div className="px-4 py-2 text-xs text-zinc-500 italic text-center">
          Nenhuma sugestão
        </div>
      )}

      {/* SEÇÃO DE AÇÕES (COPIAR) */}
      <button
        onClick={handleCopy}
        disabled={!menu.hasSelection}
        className={`
            w-full text-left px-4 py-2 flex items-center gap-2 transition-colors
            ${
              menu.hasSelection
                ? "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                : "text-zinc-600 cursor-not-allowed"
            }
        `}
      >
        <Clipboard size={14} />
        Copiar
      </button>
    </div>
  );
}
