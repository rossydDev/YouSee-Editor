import { Editor } from "@tiptap/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { getScriptById, getAllScripts, saveScript } from "@/lib/storage";

export function useAutoSave(editor: Editor | null, scriptId: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  
  const [title, setTitle] = useState("Sem Título");
  const [seriesTitle, setSeriesTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState<string>("");
  const [existingSeries, setExistingSeries] = useState<string[]>([]);

  const initialLoadDone = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null); // O Cronômetro

  // 1. CARREGAR (Mantido igual)
  useEffect(() => {
    if (!editor || !scriptId || scriptId === "undefined") return;
    if (initialLoadDone.current) return;

    const script = getScriptById(scriptId);
    if (script) {
      setTitle(script.title || "Sem Título");
      setSeriesTitle(script.seriesTitle || "");
      setChapterNumber(script.chapterNumber?.toString() || "");

      if (script.content) {
        queueMicrotask(() => {
          try {
            if (!editor.isDestroyed) {
                editor.commands.setContent(script.content);
                editor.commands.focus('end');
            }
          } catch (e) {
            console.error("Erro render:", e);
          }
        });
      }
    }

    const allScripts = getAllScripts();
    const uniqueSeries = Array.from(new Set(
      allScripts.map(s => s.seriesTitle).filter((s): s is string => !!s && s.trim() !== "")
    )).sort();
    
    setExistingSeries(uniqueSeries);
    setIsLoaded(true);
    initialLoadDone.current = true;
  }, [editor, scriptId]);

  // 2. A FUNÇÃO QUE SALVA DE VERDADE (Disparada pelo timer)
  const executeSave = useCallback(() => {
    if (!editor) return;
    
    const json = editor.getJSON();
    const chapNum = chapterNumber ? parseInt(chapterNumber) : null;

    console.log("💾 Debounce finalizado. Salvando...");
    saveScript(scriptId, json, title, seriesTitle, chapNum);
    
    setLastSaved(new Date());
    setSaveStatus('saved'); // Volta para verde
  }, [editor, scriptId, title, seriesTitle, chapterNumber]);

  // 3. O GATILHO (Debounce)
  const triggerSave = useCallback(() => {
    if (!initialLoadDone.current) return;

    // Imediatamente mostra que tem alterações pendentes
    setSaveStatus('saving');

    // Cancela o salvamento anterior se o usuário ainda estiver digitando
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Agenda o novo salvamento para daqui a 2 segundos (2000ms)
    // Se o usuário digitar de novo antes disso, este timer será cancelado e recomeçará
    debounceTimer.current = setTimeout(() => {
      executeSave();
    }, 2000); 

  }, [executeSave]);

  // 4. CONECTAR AO EDITOR
  useEffect(() => {
    if (!editor) return;
    
    // Qualquer alteração no texto reseta o timer
    editor.on('update', triggerSave);
    
    return () => { 
      editor.off('update', triggerSave);
      // Salva imediatamente se o componente desmontar (sair da página)
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        executeSave(); // Salva o que sobrou pendente
      }
    };
  }, [editor, triggerSave, executeSave]);

  // 5. GATILHO DE METADADOS (Título/Série)
  // Mudanças aqui também devem disparar o debounce
  useEffect(() => {
    if (!isLoaded) return;
    triggerSave();
  }, [title, seriesTitle, chapterNumber, isLoaded, triggerSave]);

  return { 
    isLoaded, 
    saveContent: triggerSave, // Exportamos o gatilho, não a execução direta
    lastSaved, 
    saveStatus,
    title, setTitle,
    seriesTitle, setSeriesTitle,
    chapterNumber, setChapterNumber,
    existingSeries
  };
}