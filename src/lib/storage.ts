import { Content } from "@tiptap/react";

export interface Script {
  id: string;
  title: string;
  content: Content;
  lastModified: number;
  seriesTitle?: string; // Adicionado
  chapterNumber?: string; // Adicionado
}

// Helper para gerar ID
export const generateId = () => Math.random().toString(36).substr(2, 9);

// Função Principal de Salvar
export const saveScript = async (
  id: string,
  content: Content,
  title: string,
  seriesTitle?: string,
  chapterNumber?: number | null
) => {
  const scriptData = {
    id,
    title,
    content,
    seriesTitle: seriesTitle || "", // Garante que salva a série
    chapterNumber: chapterNumber || "",
    lastModified: Date.now(),
  };

  const jsonString = JSON.stringify(scriptData);

  // 1. MODO DESKTOP (Electron)
  if (typeof window !== "undefined" && window.electron?.isDesktop) {
    // Se o ID for um caminho de arquivo (C:\...), salva lá.
    // Se for um ID aleatório, precisaria pedir pra salvar (mas o autosave lida com arquivos já criados)
    if (id.includes("/") || id.includes("\\")) {
      await window.electron.saveToPath(id, jsonString);
    } else {
      // Fallback: Se for desktop mas ID não for caminho, salva no localStorage provisoriamente
      localStorage.setItem(`yousee_script_${id}`, jsonString);
    }
  }
  // 2. MODO WEB (LocalStorage)
  else {
    localStorage.setItem(`yousee_script_${id}`, jsonString);
  }
};

export const getScriptById = (id: string): Script | null => {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(`yousee_script_${id}`);
  return saved ? JSON.parse(saved) : null;
};

export const getAllScripts = (): Script[] => {
  if (typeof window === "undefined") return [];
  const scripts: Script[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("yousee_script_")) {
      const script = JSON.parse(localStorage.getItem(key)!);
      scripts.push(script);
    }
  }
  return scripts.sort((a, b) => b.lastModified - a.lastModified);
};

export const deleteScript = async (id: string) => {
  // 1. Sempre tenta remover do LocalStorage (limpeza de cache/web)
  if (typeof window !== "undefined") {
    localStorage.removeItem(`yousee_script_${id}`);
  }

  // 2. Se for Desktop e o ID for um caminho de arquivo, apaga do HD
  if (
    typeof window !== "undefined" &&
    window.electron?.isDesktop &&
    (id.includes("/") || id.includes("\\"))
  ) {
    try {
      await window.electron.deleteFile(id);
      console.log(`Arquivo deletado: ${id}`);
    } catch (error) {
      console.error("Falha ao deletar arquivo físico:", error);
    }
  }
};
