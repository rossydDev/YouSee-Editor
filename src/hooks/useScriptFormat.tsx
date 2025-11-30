import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { ScriptPdfDocument } from '@/components/pdf/ScriptPdfDocument';
import { saveAs } from 'file-saver'; 

interface UseScriptExportProps {
  title: string;
  seriesTitle?: string;
  chapterNumber?: string; // <--- NOVO
  editorContent: any;
  theme: 'standard' | 'dark';
}

export function useScriptExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportPdf = useCallback(async ({ 
    title, 
    seriesTitle, 
    chapterNumber, 
    editorContent, 
    theme 
  }: UseScriptExportProps) => {
    try {
      setIsExporting(true);
      
      if (!editorContent || !editorContent.content) {
        throw new Error("Conteúdo vazio.");
      }

      // Renderiza o documento com os novos metadados
      const doc = (
        <ScriptPdfDocument 
          title={title} 
          seriesTitle={seriesTitle} 
          chapterNumber={chapterNumber}
          editorContent={editorContent}
          theme={theme} 
        />
      );

      const blob = await pdf(doc).toBlob();
      
      // --- Lógica de Nomenclatura de Arquivo ---
      // Sanitiza strings para evitar caracteres inválidos em nomes de arquivo
      const safeSeries = seriesTitle ? seriesTitle.replace(/[^a-z0-9]/gi, '') + '-' : '';
      const safeChapter = chapterNumber ? chapterNumber.padStart(2, '0') + '-' : ''; // Adiciona zero à esquerda (01, 02...)
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const suffix = theme === 'dark' ? '-dark' : '';
      
      // Ex: Series-01-titulo.pdf
      const filename = `${safeSeries}${safeChapter}${safeTitle}${suffix}.pdf`;

      saveAs(blob, filename);

    } catch (error) {
      console.error('Erro export:', error);
      alert('Erro ao gerar PDF.');
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportPdf, isExporting };
}