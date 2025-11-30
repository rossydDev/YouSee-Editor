import { Editor } from "@tiptap/react";
import { useState, useEffect } from "react";

export interface SceneItem {
  pos: number;
  label: string;
  panelNumber: number; // Útil para mostrar "Panel 1", "Panel 2"
}

export interface PageItem {
  pageNumber: number;
  pos: number; // Posição do cabeçalho da página
  scenes: SceneItem[];
}

export function useSceneDetection(editor: Editor | null) {
  const [pages, setPages] = useState<PageItem[]>([]);

  useEffect(() => {
    if (!editor) return;

    const updateScenes = () => {
      const newPages: PageItem[] = [];
      
      // Estado temporário para construir a página atual durante o loop
      let currentPage: PageItem | null = null;
      let pageCounter = 0;
      let panelCounter = 0;

      editor.state.doc.descendants((node, pos) => {
        // 1. Detectou Cabeçalho de Página? Cria novo grupo.
        if (node.type.name === "storyPageHeader") {
          pageCounter++;
          panelCounter = 0;

          // Salva a página anterior se existir
          if (currentPage) {
            newPages.push(currentPage);
          }

          // Inicia nova página
          currentPage = {
            pageNumber: pageCounter,
            pos: pos,
            scenes: []
          };
        }

        // 2. Detectou Painel (Cena)? Adiciona à página atual.
        if (node.type.name === "panel") {
          panelCounter++;
          const text = node.textContent.trim();
          
          // Se não tiver página criada ainda (ex: painel antes do primeiro header), cria uma "Página 1" implícita
          if (!currentPage) {
             pageCounter = 1;
             currentPage = { pageNumber: 1, pos: 0, scenes: [] };
          }

          const label = text || `PANEL ${panelCounter}`; // Texto limpo

          currentPage.scenes.push({
            pos: pos,
            label: label,
            panelNumber: panelCounter
          });
        }
      });

      // Push na última página processada ao terminar o loop
      if (currentPage) {
        newPages.push(currentPage);
      }

      setPages(newPages);
    };

    editor.on("update", updateScenes);
    editor.on("create", updateScenes);
    // Executa uma vez para garantir (embora o 'create' deva pegar)
    setTimeout(updateScenes, 100); 

    return () => {
      editor.off("update", updateScenes);
      editor.off("create", updateScenes);
    };
  }, [editor]);

  return pages;
}