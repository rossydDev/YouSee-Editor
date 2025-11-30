import { ReactNode } from "react";

interface EditorLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  header: ReactNode;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export function EditorLayout({
  children,
  sidebar,
  header,
  isSidebarOpen,
  setIsSidebarOpen,
}: EditorLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-gray-300 font-mono overflow-hidden">
      
      {header}

      <div className="flex flex-1 pt-14 relative h-[calc(100vh-3.5rem)]">
        
        {/* Sidebar (Gaveta) */}
        <div
          className={`
            fixed top-14 left-0 bottom-0 z-50 w-72 
            bg-zinc-950/95 backdrop-blur-md border-r border-zinc-800 shadow-2xl
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {sidebar}
        </div>

        {/* Backdrop Mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px] xl:bg-transparent xl:pointer-events-none"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* ÁREA PRINCIPAL */}
        <main 
          className="flex-1 h-full w-full overflow-y-auto custom-scrollbar flex justify-center"
          onClick={() => {
            if (isSidebarOpen) setIsSidebarOpen(false);
          }}
        >
          {/* Adicionei 'pr-2' aqui para dar um respiro extra da barra de rolagem se ela sobrepor */}
          <div className="w-full max-w-5xl px-4 md:px-8 py-8 pb-32 pr-2 md:pr-8">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}