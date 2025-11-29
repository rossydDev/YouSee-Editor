import { Editor } from "@tiptap/react";
import { useEffect, useState, useCallback } from "react";
import { getScriptById, getAllScripts, saveScript } from "@/lib/storage"; // Importe getAllScripts

export function useAutoSave(editor: Editor | null, scriptId: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [title, setTitle] = useState("Sem Título");
  const [seriesTitle, setSeriesTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState<string>("");
  
  // NOVO: Lista de séries existentes para o autocomplete
  const [existingSeries, setExistingSeries] = useState<string[]>([]);

  // 1. CARREGAR
  useEffect(() => {
    if (isLoaded) return; 

    // A. Carrega o roteiro atual
    const script = getScriptById(scriptId);
    if (script) {
      setTitle(script.title || "Sem Título");
      setSeriesTitle(script.seriesTitle || "");
      setChapterNumber(script.chapterNumber?.toString() || "");

      if (script.content && editor) {
        queueMicrotask(() => {
          try {
            editor.commands.setContent(script.content);
            editor.commands.focus('end');
          } catch (e) {
            console.error("Erro ao renderizar:", e);
          }
        });
      }
    }

    // B. Carrega a lista de séries para sugestão
    const allScripts = getAllScripts();
    // Filtra nomes únicos e não vazios
    const uniqueSeries = Array.from(new Set(
      allScripts
        .map(s => s.seriesTitle)
        .filter((s): s is string => !!s && s.trim() !== "")
    )).sort();
    
    setExistingSeries(uniqueSeries);
    
    setIsLoaded(true);
  }, [editor, scriptId, isLoaded]);

  // 2. SALVAR
  const saveContent = useCallback(() => {
    if (!editor || !isLoaded) return;
    
    const json = editor.getJSON();
    const chapNum = chapterNumber ? parseInt(chapterNumber) : null;

    saveScript(scriptId, json, title, seriesTitle, chapNum);
    
    setLastSaved(new Date());
  }, [editor, isLoaded, scriptId, title, seriesTitle, chapterNumber]);

  return { 
    isLoaded, 
    saveContent, 
    lastSaved, 
    title, setTitle,
    seriesTitle, setSeriesTitle,
    chapterNumber, setChapterNumber,
    existingSeries // <--- Retorna a lista
  };
}