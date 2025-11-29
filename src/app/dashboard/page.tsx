"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { getAllScripts, deleteScript, generateId, Script } from "@/lib/storage";
import { exportBackup, importBackup } from "@/lib/backup"; // <--- Importe a lógica nova
import {
  Plus,
  Trash2,
  FileText,
  Clock,
  Clapperboard,
  Layers,
  Download,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null); // Referência para o input invisível
  const router = useRouter();

  const loadScripts = () => {
    setScripts(getAllScripts());
  };

  useEffect(() => {
    loadScripts();
  }, []);

  const handleCreateNew = () => {
    const newId = generateId();
    router.push(`/editor/${newId}`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("Tem certeza que deseja excluir este roteiro?")) {
      deleteScript(id);
      loadScripts();
    }
  };

  // --- FUNÇÕES DE BACKUP ---
  const handleExport = () => {
    exportBackup();
  };

  const handleImportClick = () => {
    // Clica no input invisível
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const count = await importBackup(file);
      alert(`${count} roteiros importados com sucesso!`);
      loadScripts(); // Atualiza a tela
    } catch (error) {
      alert("Erro ao importar: Arquivo inválido.");
      console.error(error);
    }

    // Limpa o input para permitir selecionar o mesmo arquivo de novo se precisar
    e.target.value = "";
  };
  // -------------------------

  // Lógica de Agrupamento (Mantida igual)
  const seriesGroups = scripts.reduce((groups, script) => {
    const seriesName = script.seriesTitle?.trim();
    if (seriesName) {
      if (!groups[seriesName]) groups[seriesName] = [];
      groups[seriesName].push(script);
    }
    return groups;
  }, {} as Record<string, Script[]>);

  const looseScripts = scripts.filter((s) => !s.seriesTitle?.trim());

  Object.keys(seriesGroups).forEach((series) => {
    seriesGroups[series].sort(
      (a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0)
    );
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-gray-200 p-8 pb-32">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-16 gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-orange-500 font-bold text-2xl tracking-tighter hover:opacity-80 transition-opacity"
        >
          <Clapperboard className="w-8 h-8" />
          <span>YouSee</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* BOTÕES DE BACKUP */}
          <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800 mr-2">
            <button
              onClick={handleImportClick}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
              title="Importar Backup (.json)"
            >
              <Upload size={20} />
            </button>
            <div className="w-px h-4 bg-zinc-800 mx-1"></div>
            <button
              onClick={handleExport}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
              title="Exportar Backup"
            >
              <Download size={20} />
            </button>
          </div>

          {/* INPUT INVISÍVEL PARA UPLOAD */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={handleCreateNew}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20 hover:-translate-y-1"
          >
            <Plus size={20} />
            Novo Roteiro
          </button>
        </div>
      </header>

      {/* ... (O resto do Main e dos Cards continua idêntico ao seu código anterior) ... */}
      <main className="max-w-6xl mx-auto space-y-16">
        {scripts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/30">
            <div className="bg-zinc-900 p-4 rounded-full mb-6">
              <FileText size={48} className="text-zinc-700" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Sua estante está vazia
            </h2>
            <p className="text-zinc-500 text-lg mb-8 max-w-md text-center">
              Comece a escrever sua próxima obra-prima agora mesmo. O editor
              salva tudo automaticamente.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleImportClick}
                className="text-zinc-400 hover:text-white font-bold underline underline-offset-4 flex items-center gap-2"
              >
                <Upload size={16} />
                Importar Backup
              </button>
              <button
                onClick={handleCreateNew}
                className="text-orange-500 hover:text-orange-400 font-bold underline underline-offset-4 flex items-center gap-2"
              >
                <Plus size={16} />
                Criar primeiro roteiro
              </button>
            </div>
          </div>
        )}

        {/* SEÇÃO 1: SÉRIES (Agrupadas) */}
        {Object.entries(seriesGroups).map(([seriesName, seriesScripts]) => (
          <section key={seriesName} className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
              <Layers className="text-orange-500" size={24} />
              <h2 className="text-2xl font-bold text-white">{seriesName}</h2>
              <span className="text-sm text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full">
                {seriesScripts.length}{" "}
                {seriesScripts.length === 1 ? "capítulo" : "capítulos"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {seriesScripts.map((script) => (
                <ScriptCard
                  key={script.id}
                  script={script}
                  onDelete={handleDelete}
                  isSeriesItem
                />
              ))}
            </div>
          </section>
        ))}

        {/* SEÇÃO 2: ROTEIROS SOLTOS */}
        {looseScripts.length > 0 && (
          <section>
            {Object.keys(seriesGroups).length > 0 && (
              <h2 className="text-xl font-bold text-zinc-400 mb-6 flex items-center gap-2">
                <FileText size={20} />
                Outros Projetos
              </h2>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {looseScripts.map((script) => (
                <ScriptCard
                  key={script.id}
                  script={script}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ... ScriptCard Component (Mantenha o que já existia) ...
function ScriptCard({
  script,
  onDelete,
  isSeriesItem,
}: {
  script: Script;
  onDelete: any;
  isSeriesItem?: boolean;
}) {
  return (
    <Link
      href={`/editor/${script.id}`}
      className="group relative bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 rounded-xl p-5 transition-all hover:shadow-xl hover:shadow-orange-900/10 hover:-translate-y-1 flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        {isSeriesItem ? (
          // Badge de Capítulo para Séries
          <div className="flex flex-col">
            <span className="text-xs text-orange-500 font-bold uppercase tracking-wider mb-1">
              Capítulo
            </span>
            <span className="text-3xl font-mono font-bold text-white leading-none">
              #{script.chapterNumber || "?"}
            </span>
          </div>
        ) : (
          // Ícone padrão para soltos
          <div className="p-3 bg-zinc-950 rounded-lg text-zinc-600 group-hover:text-orange-500 transition-colors">
            <FileText size={24} />
          </div>
        )}

        <button
          onClick={(e) => onDelete(script.id, e)}
          className="p-2 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title="Excluir"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <h3 className="text-lg font-bold text-gray-200 mb-1 leading-tight line-clamp-2">
        {script.title || "Sem Título"}
      </h3>

      {!isSeriesItem && script.seriesTitle && (
        <p className="text-xs text-orange-500 mb-4">{script.seriesTitle}</p>
      )}

      <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-zinc-500 border-t border-zinc-800/50">
        <Clock size={12} />
        <span>{new Date(script.lastModified).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}
