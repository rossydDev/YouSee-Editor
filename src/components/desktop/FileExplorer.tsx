"use client";

import { Script } from "@/lib/storage";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

interface FileExplorerProps {
  files: Script[];
  currentFileId?: string;
  onFileSelect: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
  onCreateFile: () => void;
}

export function FileExplorer({
  files,
  currentFileId,
  onFileSelect,
  onDeleteFile,
  onCreateFile,
}: FileExplorerProps) {
  const [expandedSeries, setExpandedSeries] = useState<Record<string, boolean>>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Agrupar Arquivos por Série
  const { grouped, loose } = useMemo(() => {
    const groups: Record<string, Script[]> = {};
    const looseFiles: Script[] = [];

    files.forEach((file) => {
      // Filtro de busca simples
      if (
        searchTerm &&
        !file.title.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return;
      }

      const series = file.seriesTitle?.trim();
      if (series) {
        if (!groups[series]) groups[series] = [];
        groups[series].push(file);
      } else {
        looseFiles.push(file);
      }
    });

    // Ordenar capítulos dentro das séries
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => {
        const numA = parseInt(a.chapterNumber || "0");
        const numB = parseInt(b.chapterNumber || "0");
        return numA - numB;
      });
    });

    return { grouped: groups, loose: looseFiles };
  }, [files, searchTerm]);

  // Toggle para abrir/fechar pastinha da série
  const toggleSeries = (series: string) => {
    setExpandedSeries((prev) => ({ ...prev, [series]: !prev[series] }));
  };

  return (
    <div className="flex flex-col h-full text-zinc-400 select-none">
      {/* Ações do Topo */}
      <div className="flex items-center gap-2 p-2 mb-2">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2 top-1.5 text-zinc-600" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded pl-7 pr-2 py-1 text-xs text-zinc-300 focus:border-orange-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={onCreateFile}
          className="p-1 hover:bg-orange-500 hover:text-white rounded text-zinc-500 transition-colors"
          title="Novo Roteiro"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Lista de Arquivos */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* GRUPOS DE SÉRIES */}
        {Object.entries(grouped).map(([seriesName, seriesFiles]) => (
          <div key={seriesName} className="mb-1">
            <div
              className="flex items-center gap-1 px-2 py-1 hover:bg-zinc-800/50 cursor-pointer rounded group"
              onClick={() => toggleSeries(seriesName)}
            >
              {expandedSeries[seriesName] ? (
                <ChevronDown size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
              <Folder size={14} className="text-orange-500/80" />
              <span className="text-sm font-medium text-zinc-300 truncate flex-1">
                {seriesName}
              </span>
              <span className="text-[10px] text-zinc-600">
                {seriesFiles.length}
              </span>
            </div>

            {/* Arquivos da Série (Expansível) */}
            {expandedSeries[seriesName] && (
              <div className="pl-4 mt-1 border-l border-zinc-800 ml-3">
                {seriesFiles.map((file) => (
                  <FileItem
                    key={file.id}
                    file={file}
                    isActive={file.id === currentFileId}
                    onClick={() => onFileSelect(file.id)}
                    onDelete={() => onDeleteFile(file.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* ARQUIVOS SOLTOS (SEM SÉRIE) */}
        {loose.length > 0 && (
          <div className="mt-2">
            {Object.keys(grouped).length > 0 && (
              <div className="px-2 text-[10px] font-bold text-zinc-600 uppercase mb-1 mt-4">
                Soltos
              </div>
            )}
            {loose.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                isActive={file.id === currentFileId}
                onClick={() => onFileSelect(file.id)}
                onDelete={() => onDeleteFile(file.id)}
              />
            ))}
          </div>
        )}

        {files.length === 0 && (
          <div className="text-center py-10 px-4">
            <p className="text-xs text-zinc-600">Nenhum roteiro encontrado.</p>
            <button
              onClick={onCreateFile}
              className="mt-2 text-xs text-orange-500 hover:underline"
            >
              Criar Novo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente individual de arquivo
function FileItem({ file, isActive, onClick, onDelete }: any) {
  return (
    <div
      className={`
                group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer mb-0.5 text-xs transition-colors
                ${
                  isActive
                    ? "bg-orange-500/10 text-orange-500"
                    : "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }
            `}
      onClick={onClick}
    >
      <FileText
        size={13}
        className={isActive ? "text-orange-500" : "text-zinc-600"}
      />

      <div className="flex-1 truncate flex flex-col">
        <span className="truncate font-medium">
          {file.title || "Sem Título"}
        </span>
        {file.chapterNumber && (
          <span className="text-[9px] opacity-60">
            Capítulo {file.chapterNumber}
          </span>
        )}
      </div>

      {/* Botão de Deletar (Só aparece no Hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 hover:bg-zinc-900 rounded"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
