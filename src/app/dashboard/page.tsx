"use client";

import { exportBackup, importBackup } from "@/lib/backup";
import { deleteScript, generateId, getAllScripts, Script } from "@/lib/storage";
import {
  Clock,
  Download,
  FileJson,
  FileText,
  FolderOpen,
  Layers,
  Plus,
  Settings,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Dashboard() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [workspacePath, setWorkspacePath] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isDesktop = typeof window !== "undefined" && window.electron?.isDesktop;

  // --- CARREGAMENTO ---

  const loadWebScripts = () => {
    setScripts(getAllScripts());
  };

  const loadWorkspaceFiles = async (path: string) => {
    if (!window.electron) return;
    setIsLoading(true);
    try {
      const files = await window.electron.readWorkspace(path);
      const sorted = files.sort(
        (a: Script, b: Script) => b.lastModified - a.lastModified
      );
      setScripts(sorted);
    } catch (error) {
      console.error("Erro ao ler workspace:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    if (isDesktop) {
      const savedPath = localStorage.getItem("yousee_workspace_path");
      if (savedPath) {
        setWorkspacePath(savedPath);
        loadWorkspaceFiles(savedPath);
      }
    } else {
      loadWebScripts();
    }
  }, [isDesktop]);

  // --- AÇÕES ---

  const handleSelectFolder = async () => {
    if (!window.electron) return;
    const path = await window.electron.selectFolder();
    if (path) {
      setWorkspacePath(path);
      localStorage.setItem("yousee_workspace_path", path);
      loadWorkspaceFiles(path);
    }
  };

  // --- NOVA FUNÇÃO: IMPORTAR BACKUP JSON (WEB -> DESKTOP) ---
  const handleImportLegacyBackup = async () => {
    if (!window.electron || !workspacePath) return;

    // 1. Pede para selecionar o arquivo JSON
    const result = await window.electron.openFile();
    if (!result || !result.content) return;

    setIsLoading(true);
    try {
      const data = JSON.parse(result.content);

      // 2. Verifica se é um Array (Vários roteiros) ou Objeto (Um roteiro)
      const scriptsToImport = Array.isArray(data) ? data : [data];
      let importedCount = 0;

      // 3. Loop para salvar cada roteiro como um arquivo individual
      for (const script of scriptsToImport) {
        // Validação básica
        if (!script.id || !script.content) continue;

        // Gera um nome de arquivo seguro (sem caracteres especiais)
        const safeTitle = (script.title || "Sem Titulo")
          .replace(/[^a-z0-9]/gi, "_") // Troca símbolos por _
          .toLowerCase();

        // Garante um ID único se vier duplicado, ou usa o do backup
        const fileId = script.id.length < 10 ? generateId() : script.id;

        // Define o separador correto do sistema (Windows usa \, Mac/Linux usa /)
        const separator = workspacePath.includes("\\") ? "\\" : "/";
        const filename = `${safeTitle}-${fileId.slice(0, 6)}.yousee`;
        const fullPath = `${workspacePath}${separator}${filename}`;

        // Prepara o objeto para salvar
        const fileContent = {
          ...script,
          id: fullPath, // Atualiza o ID para ser o caminho (padrão Desktop)
          lastModified: Date.now(), // Atualiza a data para aparecer no topo
        };

        // Salva no disco
        await window.electron.saveToWorkspace(
          fullPath,
          JSON.stringify(fileContent)
        );
        importedCount++;
      }

      alert(`${importedCount} roteiros importados com sucesso!`);

      // 4. Recarrega a lista para mostrar os novos arquivos
      await loadWorkspaceFiles(workspacePath);
    } catch (error) {
      console.error("Erro ao importar:", error);
      alert("Falha ao ler o arquivo de backup. Verifique se é um JSON válido.");
    } finally {
      setIsLoading(false);
    }
  };
  // -----------------------------------------------------------

  const handleCreateNew = async () => {
    if (isDesktop && workspacePath && window.electron) {
      const newId = generateId();
      const filename = `Roteiro-${newId.slice(0, 6)}.yousee`;
      const separator = workspacePath.includes("\\") ? "\\" : "/";
      const fullPath = `${workspacePath}${separator}${filename}`;

      // GHOST FILE: Não salva nada agora. Só navega.
      // O arquivo será criado pelo AutoSave quando o usuário digitar algo.

      router.push(`/editor/${encodeURIComponent(fullPath)}`);
    } else {
      const newId = generateId();
      router.push(`/editor/${newId}`);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir este roteiro?")) {
      await deleteScript(id);
      if (isDesktop && workspacePath) {
        loadWorkspaceFiles(workspacePath);
      } else {
        loadWebScripts();
      }
    }
  };

  // --- FUNÇÕES DE BACKUP (WEB) ---
  const handleExport = () => exportBackup();
  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await importBackup(file);
      alert(`${count} roteiros importados com sucesso!`);
      loadWebScripts();
    } catch (error) {
      alert("Erro ao importar.");
    }
    e.target.value = "";
  };

  if (!isMounted) return null;

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
      (a, b) =>
        (Number(a.chapterNumber) || 999) - (Number(b.chapterNumber) || 999)
    );
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-gray-200 p-8 pb-32">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-16 gap-4">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative w-8 h-8 shrink-0 transition-transform group-hover:scale-110 duration-300">
            <Image
              src="/logo.png"
              alt="YouSee Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent tracking-tight">
            YouSee
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isDesktop ? (
            <>
              {/* Informação da Pasta */}
              <div className="flex items-center bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800 mr-2 gap-2">
                <FolderOpen size={16} className="text-orange-500" />
                <div className="flex flex-col max-w-[150px]">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">
                    Pasta Atual
                  </span>
                  <span
                    className="text-xs text-zinc-300 truncate"
                    title={workspacePath || ""}
                  >
                    {workspacePath
                      ? workspacePath.split(/[\\/]/).pop()
                      : "Selecione..."}
                  </span>
                </div>
                <button
                  onClick={handleSelectFolder}
                  className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white ml-1"
                >
                  <Settings size={14} />
                </button>
              </div>

              {/* BOTÃO DE IMPORTAR (WEB -> DESKTOP) */}
              {workspacePath && (
                <button
                  onClick={handleImportLegacyBackup}
                  className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2"
                  title="Importar Backup da Vercel (.json)"
                >
                  <FileJson size={20} />
                  <span className="text-xs font-bold hidden sm:inline">
                    Importar JSON
                  </span>
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800 mr-2">
              <button
                onClick={handleImportClick}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                title="Importar"
              >
                <Upload size={20} />
              </button>
              <div className="w-px h-4 bg-zinc-800 mx-1"></div>
              <button
                onClick={handleExport}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                title="Exportar"
              >
                <Download size={20} />
              </button>
            </div>
          )}

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

      <main className="max-w-6xl mx-auto space-y-16">
        {isLoading && (
          <div className="text-center py-10 text-zinc-500 animate-pulse">
            Carregando seus roteiros...
          </div>
        )}

        {!isLoading && scripts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/30">
            <div className="bg-zinc-900 p-4 rounded-full mb-6">
              <FileText size={48} className="text-zinc-700" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isDesktop && !workspacePath
                ? "Selecione uma pasta"
                : "Sua estante está vazia"}
            </h2>
            <p className="text-zinc-500 text-lg mb-8 max-w-md text-center">
              {isDesktop && !workspacePath
                ? "Escolha onde salvar seus arquivos no computador."
                : "Comece a escrever ou importe um backup da versão Web."}
            </p>
            <div className="flex gap-4">
              {isDesktop && !workspacePath ? (
                <button
                  onClick={handleSelectFolder}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                  <FolderOpen size={16} /> Selecionar Pasta
                </button>
              ) : (
                <div className="flex gap-4">
                  {isDesktop && (
                    <button
                      onClick={handleImportLegacyBackup}
                      className="text-zinc-400 hover:text-white font-bold underline underline-offset-4 flex items-center gap-2"
                    >
                      <FileJson size={16} /> Importar Backup
                    </button>
                  )}
                  <button
                    onClick={handleCreateNew}
                    className="text-orange-500 hover:text-orange-400 font-bold underline underline-offset-4 flex items-center gap-2"
                  >
                    <Plus size={16} /> Criar primeiro roteiro
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LISTAGEM AGRUPADA */}
        {!isLoading &&
          Object.entries(seriesGroups).map(([seriesName, seriesScripts]) => (
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
                    isDesktop={isDesktop}
                  />
                ))}
              </div>
            </section>
          ))}

        {/* LISTAGEM SOLTA */}
        {!isLoading && looseScripts.length > 0 && (
          <section>
            {Object.keys(seriesGroups).length > 0 && (
              <h2 className="text-xl font-bold text-zinc-400 mb-6 flex items-center gap-2">
                <FileText size={20} /> Outros Projetos
              </h2>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {looseScripts.map((script) => (
                <ScriptCard
                  key={script.id}
                  script={script}
                  onDelete={handleDelete}
                  isDesktop={isDesktop}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function ScriptCard({
  script,
  onDelete,
  isSeriesItem,
  isDesktop,
}: {
  script: Script;
  onDelete: any;
  isSeriesItem?: boolean;
  isDesktop?: boolean;
}) {
  const linkHref = isDesktop
    ? `/editor/${encodeURIComponent(script.id)}`
    : `/editor/${script.id}`;

  return (
    <Link
      href={linkHref}
      className="group relative bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 rounded-xl p-5 transition-all hover:shadow-xl hover:shadow-orange-900/10 hover:-translate-y-1 flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        {isSeriesItem ? (
          <div className="flex flex-col">
            <span className="text-xs text-orange-500 font-bold uppercase tracking-wider mb-1">
              Capítulo
            </span>
            <span className="text-3xl font-mono font-bold text-white leading-none">
              #{script.chapterNumber || "?"}
            </span>
          </div>
        ) : (
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
