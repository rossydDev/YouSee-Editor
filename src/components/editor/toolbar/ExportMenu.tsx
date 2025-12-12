import { pdf } from "@react-pdf/renderer";
import { Editor } from "@tiptap/react";
import { saveAs } from "file-saver";
import { ChevronDown, Download, FileJson, Printer } from "lucide-react";
import { useState } from "react";
import { ScriptPdfDocument } from "../../pdf/ScriptPdfDocument";

interface ExportMenuProps {
  editor: Editor;
  title: string;
  seriesTitle?: string;
  chapterNumber?: string;
  saveStatus: "saved" | "saving";
}

export function ExportMenu({
  editor,
  title,
  seriesTitle,
  chapterNumber,
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Verifica se é Desktop (apenas para esconder o botão de backup JSON se quiser)
  const isDesktop = typeof window !== "undefined" && window.electron?.isDesktop;

  // --- GERAR NOME DO ARQUIVO PADRONIZADO ---
  // Padrão: "B&C - 04 - Toca.pdf"
  const getFilename = (extension: string) => {
    const parts = [];

    // 1. Série (Ex: "B&C")
    if (seriesTitle && seriesTitle.trim()) {
      parts.push(seriesTitle.trim());
    }

    // 2. Capítulo (Ex: "04") - Adiciona zero à esquerda se for número
    if (chapterNumber && chapterNumber.trim()) {
      const num = chapterNumber.trim();
      // Se for número (ex: "4"), vira "04". Se for texto (ex: "Extra"), mantém.
      const paddedNum = !isNaN(Number(num)) ? num.padStart(2, "0") : num;
      parts.push(paddedNum);
    }

    // 3. Título (Ex: "Toca")
    const cleanTitle = (title || "Sem Título").trim();
    parts.push(cleanTitle);

    return `${parts.join(" - ")}.${extension}`;
  };

  // --- EXPORTAR JSON (Backup Web) ---
  const handleExportJson = () => {
    const json = editor.getJSON();
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, getFilename("json")); // Usa o mesmo padrão de nome
    setIsOpen(false);
  };

  // --- EXPORTAR PDF ---
  const handleExportPdf = async (theme: "standard" | "dark") => {
    setIsExporting(true);
    try {
      const blob = await pdf(
        <ScriptPdfDocument
          title={title}
          seriesTitle={seriesTitle}
          chapterNumber={chapterNumber}
          editorContent={editor.getJSON()}
          theme={theme}
        />
      ).toBlob();

      saveAs(blob, getFilename("pdf"));
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar PDF");
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-xs font-medium text-zinc-200 transition-colors"
      >
        {isExporting ? "Gerando..." : "Exportar"}
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
            <div className="px-3 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Formatos
            </div>

            <button
              onClick={() => handleExportPdf("standard")}
              className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors"
            >
              <Printer size={16} />
              PDF Padrão (Claro)
            </button>

            <button
              onClick={() => handleExportPdf("dark")}
              className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors"
            >
              <FileJson size={16} />
              PDF Dark (Escuro)
            </button>

            {/* No Desktop, o backup JSON é menos útil pois já temos os arquivos,
                mas deixamos como opção secundária se quiser mandar pra alguém */}
            <div className="h-px bg-zinc-800 my-1"></div>

            <button
              onClick={handleExportJson}
              className="w-full text-left px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-colors"
            >
              <Download size={16} />
              Backup JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
}
