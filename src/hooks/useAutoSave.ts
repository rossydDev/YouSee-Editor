import { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "yousee-content-v1";

export function useAutoSave(editor: Editor | null) {
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. CARREGAR (Load)
  useEffect(() => {
    if (!editor) return;
    if (isLoaded) return;

    queueMicrotask(() => {
      const savedContent = localStorage.getItem(STORAGE_KEY);
      
      if (savedContent) {
        try {
          const json = JSON.parse(savedContent);
          editor.commands.setContent(json);
          editor.commands.focus('end');
        } catch (e) {
          console.error("Erro ao carregar roteiro:", e);
        }
      }
      
      setIsLoaded(true);
    });
  }, [editor, isLoaded]);

  // 2. SALVAR (Save Function)
  // Retornamos essa função para ser usada no onUpdate do editor
  const saveContent = () => {
    if (!editor || !isLoaded) return;
    const json = editor.getJSON();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
  };

  return { isLoaded, saveContent };
}