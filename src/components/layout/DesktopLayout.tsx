"use client";

import {
  FileText,
  Minus,
  PanelLeft,
  PanelRight,
  Settings, // <--- Ícone de Minimizar
  Square,
  Users,
  X,
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

interface DesktopLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  sidebarLeft: ReactNode;
  sidebarRight: ReactNode;
}

export function DesktopLayout({
  children,
  header,
  sidebarLeft,
  sidebarRight,
}: DesktopLayoutProps) {
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(false);

  const openLeft = () => {
    setShowLeft(true);
    setShowRight(false);
  };
  const openRight = () => {
    setShowRight(true);
    setShowLeft(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setShowLeft(false);
        setShowRight(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-gray-200 overflow-hidden font-sans relative">
      {/* --- SIDEBAR ESQUERDA (ARQUIVOS) --- */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-zinc-900 border-r border-zinc-800
          lg:static lg:bg-zinc-900/50
          transition-all duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none
          ${
            showLeft
              ? "w-64 translate-x-0"
              : "-translate-x-full lg:translate-x-0 lg:w-0 lg:border-none lg:opacity-0 overflow-hidden"
          }
        `}
      >
        <div className="h-10 flex items-center px-4 border-b border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-wider justify-between shrink-0 select-none">
          <span>Explorador</span>
          <button
            onClick={() => setShowLeft(false)}
            className="hover:text-white"
          >
            <X size={14} className="lg:hidden" />
            <PanelLeft size={14} className="hidden lg:block" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">{sidebarLeft}</div>

        <div className="p-3 border-t border-zinc-800 shrink-0">
          <button className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors w-full p-2 rounded hover:bg-zinc-800">
            <Settings size={14} />
            <span>Configurações</span>
          </button>
        </div>
      </aside>

      {/* BACKDROP (Para mobile/tela pequena) */}
      {(showLeft || showRight) && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => {
            setShowLeft(false);
            setShowRight(false);
          }}
        />
      )}

      {/* --- ÁREA CENTRAL (PRINCIPAL) --- */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full transition-all duration-300">
        {/* ========================================================= */}
        {/* BARRA DE TÍTULO CUSTOMIZADA (Drag Region + Botões)        */}
        {/* ========================================================= */}
        <header className="h-9 bg-zinc-950 flex items-center justify-between px-3 border-b border-zinc-900 select-none app-region-drag shrink-0">
          {/* Lado Esquerdo: Título e Botão Sidebar */}
          <div className="flex items-center gap-2 app-region-no-drag">
            {!showLeft && (
              <button
                onClick={openLeft}
                className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800 transition-colors"
                title="Abrir Arquivos"
              >
                <PanelLeft size={16} />
              </button>
            )}
            {/* Título do App (Visível apenas se a sidebar estiver fechada para não duplicar) */}
            <span
              className={`text-xs font-medium ml-2 transition-colors ${
                !showLeft ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              YouSee Studio
            </span>
          </div>

          {/* Lado Direito: Botões de Janela (Windows Controls) */}
          <div className="flex items-center gap-1 app-region-no-drag">
            {/* Botão Sidebar Direita (Wiki) */}
            {!showRight && (
              <button
                onClick={openRight}
                className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800 mr-3"
                title="Abrir Detalhes"
              >
                <PanelRight size={16} />
              </button>
            )}

            {/* --- BOTÕES DO SISTEMA --- */}
            <button
              onClick={() => window.electron?.minimize()}
              className="w-8 h-6 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white rounded transition-colors"
              title="Minimizar"
            >
              <Minus size={14} />
            </button>

            <button
              onClick={() => window.electron?.maximize()}
              className="w-8 h-6 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white rounded transition-colors"
              title="Maximizar"
            >
              <Square size={12} />
            </button>

            <button
              onClick={() => window.electron?.close()}
              className="w-8 h-6 flex items-center justify-center text-zinc-400 hover:bg-red-600 hover:text-white rounded transition-colors"
              title="Fechar"
            >
              <X size={14} />
            </button>
          </div>
        </header>

        {/* Toolbar do Editor */}
        <div className="z-10 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800 shrink-0">
          {header}
        </div>

        {/* Área do Texto */}
        <div className="flex-1 overflow-y-auto relative bg-zinc-950">
          {children}
        </div>
      </main>

      {/* --- SIDEBAR DIREITA (WIKI/CONTEXTO) --- */}
      <aside
        className={`
          fixed inset-y-0 right-0 z-50 bg-zinc-900 border-l border-zinc-800
          lg:static lg:bg-zinc-900/30
          transition-all duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none
          ${
            showRight
              ? "w-72 translate-x-0"
              : "translate-x-full lg:translate-x-0 lg:w-0 lg:border-none lg:opacity-0 overflow-hidden"
          }
        `}
      >
        <div className="h-10 flex items-center border-b border-zinc-800 shrink-0 select-none">
          <button className="flex-1 h-full flex items-center justify-center text-zinc-400 hover:text-orange-500 hover:bg-zinc-800/50 border-b-2 border-transparent hover:border-orange-500 transition-all">
            <FileText size={16} />
          </button>
          <button className="flex-1 h-full flex items-center justify-center text-zinc-600 hover:text-orange-500 hover:bg-zinc-800/50 border-b-2 border-transparent hover:border-orange-500 transition-all">
            <Users size={16} />
          </button>

          <button
            onClick={() => setShowRight(false)}
            className="px-3 text-zinc-500 hover:text-white h-full border-l border-zinc-800"
          >
            <X size={14} className="lg:hidden" />
            <PanelRight size={14} className="hidden lg:block" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">{sidebarRight}</div>
      </aside>
    </div>
  );
}
