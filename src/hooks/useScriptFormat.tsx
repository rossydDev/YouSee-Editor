import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { ScriptPdfDocument } from '@/components/pdf/ScriptPdfDocument';
import { saveAs } from 'file-saver'; 

interface UseScriptExportProps {
  title: string;
  seriesTitle?: string;
  editorContent: any;
  theme: 'standard' | 'dark'; // Obrigatório agora
}

export function useScriptExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportPdf = useCallback(async ({ title, seriesTitle, editorContent, theme }: UseScriptExportProps) => {
    try {
      setIsExporting(true);
      
      if (!editorContent || !editorContent.content) {
        throw new Error("Conteúdo vazio.");
      }

      // Passamos o theme para o Documento
      const doc = (
        <ScriptPdfDocument 
          title={title} 
          seriesTitle={seriesTitle} 
          editorContent={editorContent}
          theme={theme} 
        />
      );

      const blob = await pdf(doc).toBlob();
      
      // Sufixo no nome do arquivo se for Dark
      const suffix = theme === 'dark' ? '-dark' : '';
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${seriesTitle ? seriesTitle + '-' : ''}${safeTitle}${suffix}.pdf`;

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