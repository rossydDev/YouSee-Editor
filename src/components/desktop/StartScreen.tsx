import { Plus, UploadCloud } from "lucide-react";
import Image from "next/image";

interface StartScreenProps {
  onCreate: () => void;
  onImport: () => void; // <--- NOVA PROP
  hasWorkspace: boolean;
}

export function StartScreen({
  onCreate,
  onImport,
  hasWorkspace,
}: StartScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-zinc-500 select-none animate-in fade-in duration-500 pb-10">
      {/* LOGO MAIOR E CHAMATIVO */}
      <div className="mb-8 relative w-48 h-48 hover:scale-105 transition-transform duration-500">
        <Image
          src="/logo.png"
          alt="YouSee"
          fill
          className="object-contain drop-shadow-2xl"
          priority
        />
      </div>

      <h1 className="text-3xl font-bold text-zinc-200 mb-2 tracking-tight bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
        YouSee Studio
      </h1>
      <p className="text-zinc-500 mb-10">
        O seu ambiente de escrita profissional.
      </p>

      {!hasWorkspace ? (
        <p className="text-sm text-zinc-600 max-w-xs text-center mb-8 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
          Nenhuma pasta selecionada. Use o ícone de pasta na barra lateral
          esquerda para abrir seu workspace.
        </p>
      ) : (
        <div className="flex flex-col gap-3 w-72">
          {/* BOTÃO NOVO ROTEIRO */}
          <button
            onClick={onCreate}
            className="flex items-center gap-4 px-5 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 hover:border-orange-500 transition-all group shadow-lg hover:shadow-orange-900/20"
          >
            <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500 group-hover:text-white transition-colors text-orange-500">
              <Plus size={24} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-base font-bold">Novo Roteiro</span>
              <span className="text-xs text-zinc-500 group-hover:text-zinc-400">
                Criar um capítulo em branco
              </span>
            </div>
          </button>

          {/* BOTÃO IMPORTAR BACKUP (AQUI!) */}
          <button
            onClick={onImport}
            className="flex items-center gap-4 px-5 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 hover:border-blue-500 transition-all group shadow-lg"
          >
            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors text-blue-500">
              <UploadCloud size={24} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-base font-bold">Importar Backup</span>
              <span className="text-xs text-zinc-500 group-hover:text-zinc-400">
                Trazer seus roteiros da Web (.json)
              </span>
            </div>
          </button>

          {/* Rodapé de Atalhos */}
          <div className="flex justify-between text-xs text-zinc-600 px-2 mt-6">
            <span>Atalhos:</span>
            <div className="flex gap-3">
              <span className="flex items-center gap-1">
                <span className="font-mono bg-zinc-900 px-1.5 rounded border border-zinc-800">
                  Ctrl+N
                </span>{" "}
                Novo
              </span>
              <span className="flex items-center gap-1">
                <span className="font-mono bg-zinc-900 px-1.5 rounded border border-zinc-800">
                  Ctrl+S
                </span>{" "}
                Salvar
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
