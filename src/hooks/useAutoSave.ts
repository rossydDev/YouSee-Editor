import { Editor } from "@tiptap/react";
import { useEffect, useState, useCallback } from "react";
import { getScriptById, saveScript } from "@/lib/storage";

export function useAutoSave(editor: Editor | null, scriptId: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Novo estado para o Título
  const [title, setTitle] = useState("Sem Título");

  // 1. CARREGAR (Load)
  useEffect(() => {
    // Carrega apenas uma vez quando o editor estiver pronto (ou nulo na primeira render)
    if (isLoaded) return; 

    const script = getScriptById(scriptId);

    if (script) {
      // Carrega o Título
      setTitle(script.title || "Sem Título");

      // Carrega o Conteúdo
      if (script.content && editor) {
        queueMicrotask(() => {
          try {
            editor.commands.setContent(script.content);
            editor.commands.focus('end');
          } catch (e) {
            console.error("Erro ao renderizar roteiro:", e);
          }
        });
      }
    }
    
    // Marca como carregado mesmo se não tiver script (novo)
    setIsLoaded(true);
  }, [editor, scriptId, isLoaded]);

  // 2. SALVAR (Save Function)
  const saveContent = useCallback(() => {
    if (!editor || !isLoaded) return;
    
    const json = editor.getJSON();
    
    // Agora salvamos o Título também!
    saveScript(scriptId, json, title);
    
    setLastSaved(new Date());
  }, [editor, isLoaded, scriptId, title]); // title é dependência agora

  return { isLoaded, saveContent, lastSaved, title, setTitle };
}