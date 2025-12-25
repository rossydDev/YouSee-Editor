"use client";

import { Script } from "@/lib/storage";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  FolderPlus,
  Library,
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
  onCreateFile: (seriesName?: string) => void;
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

  const { grouped, loose } = useMemo(() => {
    const groups: Record<string, Script[]> = {};
    const looseFiles: Script[] = [];

    files.forEach((file) => {
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

    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => {
        const numA = parseFloat(a.chapterNumber || "0");
        const numB = parseFloat(b.chapterNumber || "0");
        return numA - numB;
      });
    });

    return { grouped: groups, loose: looseFiles };
  }, [files, searchTerm]);

  const toggleSeries = (series: string) => {
    setExpandedSeries((prev) => ({ ...prev, [series]: !prev[series] }));
  };

  return (
    <div className="flex flex-col h-full text-zinc-400 select-none bg-zinc-900/30">
      {/* BARRA DE BUSCA E NOVA SÉRIE */}
      <div className="flex items-center gap-2 p-3 mb-2 border-b border-zinc-800/50">
        <div className="relative flex-1 group">
          <Search
            size={12}
            className="absolute left-2 top-2 text-zinc-600 group-focus-within:text-orange-500 transition-colors"
          />
          <input
            type="text"
            placeholder="Buscar roteiro..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-7 pr-2 py-1.5 text-xs text-zinc-300 focus:border-orange-500/50 focus:outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => onCreateFile()}
          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-md text-zinc-500 transition-colors border border-transparent hover:border-zinc-700"
          title="Novo Roteiro Avulso / Nova Série"
        >
          <FolderPlus size={16} />
        </button>
      </div>

      {/* LISTA DE ARQUIVOS */}
      <div className="flex-1 overflow-y-auto pr-1 px-2 pb-10">
        {/* 1. SÉRIES AGRUPADAS */}
        {Object.entries(grouped).map(([seriesName, seriesFiles]) => (
          <div key={seriesName} className="mb-2">
            {/* CABEÇALHO DA SÉRIE (ESTILIZADO) */}
            <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-800/50 rounded-lg group/series transition-colors">
              <div
                className="flex items-center gap-2 flex-1 cursor-pointer overflow-hidden"
                onClick={() => toggleSeries(seriesName)}
              >
                {/* Ícone de Pasta/Série Laranja */}
                <div className="text-orange-500/80 group-hover/series:text-orange-500 transition-colors">
                  {expandedSeries[seriesName] ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </div>

                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-sm font-bold text-orange-500 truncate leading-tight tracking-wide group-hover/series:text-orange-400 transition-colors">
                    {seriesName}
                  </span>
                </div>

                {/* BADGE DE CONTAGEM */}
                <span className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700/50">
                  {seriesFiles.length} caps
                </span>
              </div>

              {/* Botão + (Adicionar Capítulo) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateFile(seriesName);
                }}
                className="opacity-0 group-hover/series:opacity-100 p-1 hover:bg-orange-500 hover:text-white text-zinc-500 rounded transition-all"
                title={`Novo Capítulo em ${seriesName}`}
              >
                <Plus size={14} />
              </button>
            </div>

            {/* ARQUIVOS DA SÉRIE */}
            {expandedSeries[seriesName] && (
              <div className="relative mt-1 ml-2 pl-3 border-l-2 border-zinc-800/50 space-y-0.5">
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

        {/* 2. ARQUIVOS SOLTOS */}
        {loose.length > 0 && (
          <div className="mt-6 pt-4 border-t border-zinc-800/50">
            {Object.keys(grouped).length > 0 && (
              <div className="px-2 flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase mb-2">
                <Library size={10} />
                Avulsos
              </div>
            )}
            <div className="space-y-0.5">
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
          </div>
        )}

        {files.length === 0 && (
          <div className="text-center py-12 px-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-3 text-zinc-700">
              <Library size={20} />
            </div>
            <p className="text-xs text-zinc-500 mb-2">
              Seu estúdio está vazio.
            </p>
            <button
              onClick={() => onCreateFile()}
              className="px-3 py-1.5 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white rounded text-xs font-bold transition-all border border-orange-500/20"
            >
              Criar Roteiro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente do Item (Card do Arquivo)
function FileItem({ file, isActive, onClick, onDelete }: any) {
  return (
    <div
      className={`
                group flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-xs transition-all relative overflow-hidden
                ${
                  isActive
                    ? "bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-sm"
                    : "hover:bg-zinc-800/70 text-zinc-400 hover:text-zinc-200 border border-transparent"
                }
            `}
      onClick={onClick}
    >
      {/* Indicador de Seleção (Barra lateral) */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-orange-500" />
      )}

      {/* Ícone ou Número do Capítulo */}
      <div
        className={`
                shrink-0 w-5 h-5 flex items-center justify-center rounded font-mono text-[10px] font-bold
                ${
                  isActive
                    ? "bg-orange-500 text-white"
                    : "bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700"
                }
            `}
      >
        {file.chapterNumber ? file.chapterNumber : <FileText size={10} />}
      </div>

      <div className="flex-1 truncate flex flex-col">
        <span
          className={`truncate font-medium ${
            isActive ? "text-orange-400" : "text-zinc-300"
          }`}
        >
          {file.title || "Sem Título"}
        </span>
        {file.chapterNumber && (
          <span
            className={`text-[9px] ${
              isActive ? "text-orange-500/60" : "text-zinc-600"
            }`}
          >
            Capítulo {file.chapterNumber}
          </span>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded transition-all"
        title="Apagar"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
