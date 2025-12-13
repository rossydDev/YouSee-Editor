import { FolderOpen, Plus } from "lucide-react";
import Image from "next/image";

interface StartScreenProps {
  onCreate: () => void;
  onSelectFolder?: () => void;
  hasWorkspace: boolean;
}

export function StartScreen({
  onCreate,
  onSelectFolder,
  hasWorkspace,
}: StartScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-zinc-500 select-none animate-in fade-in duration-500">
      {/* Logo e Branding */}
      <div className="mb-8 relative w-24 h-24 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
        <Image
          src="/logo.png"
          alt="YouSee"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <h1 className="text-2xl font-bold text-zinc-700 mb-2">YouSee Studio</h1>
      <p className="text-sm mb-8 text-zinc-600">
        Editor de Roteiros Profissional
      </p>

      {/* Ações */}
      <div className="flex flex-col gap-3 w-64">
        {hasWorkspace ? (
          <button
            onClick={onCreate}
            className="flex items-center gap-3 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-zinc-800 hover:border-orange-500/50 transition-all group"
          >
            <Plus
              size={18}
              className="text-orange-500 group-hover:scale-110 transition-transform"
            />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">Novo Roteiro</span>
              <span className="text-[10px] text-zinc-600">
                Criar um novo capítulo
              </span>
            </div>
          </button>
        ) : (
          <button
            onClick={onSelectFolder}
            className="flex items-center gap-3 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-zinc-800 hover:border-orange-500/50 transition-all group"
          >
            <FolderOpen
              size={18}
              className="text-orange-500 group-hover:scale-110 transition-transform"
            />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">Abrir Pasta</span>
              <span className="text-[10px] text-zinc-600">
                Selecione onde salvar seus arquivos
              </span>
            </div>
          </button>
        )}

        <div className="h-px bg-zinc-800/50 my-2"></div>

        <div className="px-4 py-2 text-xs text-zinc-600 flex justify-between">
          <span>Novo Roteiro</span>
          <span className="font-mono bg-zinc-900 px-1 rounded border border-zinc-800">
            Ctrl+N
          </span>
        </div>
      </div>
    </div>
  );
}
