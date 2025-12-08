import { getAllScripts, getScriptById, saveScript } from "@/lib/storage";
import { Editor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";

export function useAutoSave(editor: Editor | null, scriptId: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  // Estados visuais
  const [title, setTitle] = useState("Sem Título");
  const [seriesTitle, setSeriesTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState<string>("");
  const [existingSeries, setExistingSeries] = useState<string[]>([]);

  // Refs para manter os valores mais recentes acessíveis dentro do timer
  // sem precisar recriar as funções (Performance 🚀)
  const valuesRef = useRef({ title, seriesTitle, chapterNumber });

  // Atualiza as refs sempre que o estado muda
  useEffect(() => {
    valuesRef.current = { title, seriesTitle, chapterNumber };
  }, [title, seriesTitle, chapterNumber]);

  const initialLoadDone = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true); // Proteção contra memory leak

  // 0. Monitorar Mount/Unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // 1. CARREGAR DADOS (Load)
  useEffect(() => {
    if (!editor || !scriptId || scriptId === "undefined") return;
    if (initialLoadDone.current) return;

    const script = getScriptById(scriptId);
    if (script) {
      setTitle(script.title || "Sem Título");
      setSeriesTitle(script.seriesTitle || "");
      setChapterNumber(script.chapterNumber?.toString() || "");

      // Sincroniza refs imediatamente após carregar
      valuesRef.current = {
        title: script.title || "Sem Título",
        seriesTitle: script.seriesTitle || "",
        chapterNumber: script.chapterNumber?.toString() || "",
      };

      if (script.content) {
        // QueueMicrotask evita conflitos de renderização do Tiptap
        queueMicrotask(() => {
          try {
            if (!editor.isDestroyed) {
              editor.commands.setContent(script.content);
              // Move cursor para o final para evitar sustos
              editor.commands.focus("end");
            }
          } catch (e) {
            console.error("Erro ao renderizar conteúdo:", e);
          }
        });
      }
    }

    // Carregar lista de séries para o autocomplete
    const allScripts = getAllScripts();
    const uniqueSeries = Array.from(
      new Set(
        allScripts
          .map((s) => s.seriesTitle)
          .filter((s): s is string => !!s && s.trim() !== "")
      )
    ).sort();

    setExistingSeries(uniqueSeries);
    setIsLoaded(true);
    initialLoadDone.current = true;
  }, [editor, scriptId]);

  // 2. FUNÇÃO DE SALVAR (Estável)
  // Não depende mais de 'title' ou 'seriesTitle' no array de dependências
  const executeSave = useCallback(() => {
    if (!editor || editor.isDestroyed) return;

    try {
      const json = editor.getJSON();
      const currentValues = valuesRef.current; // Pega valores da Ref (sempre atuais)

      const chapNum = currentValues.chapterNumber
        ? parseInt(currentValues.chapterNumber)
        : null;

      console.log("💾 AutoSave: Salvando...");
      saveScript(
        scriptId,
        json,
        currentValues.title,
        currentValues.seriesTitle,
        chapNum
      );

      // Só atualiza estado se o componente ainda estiver na tela
      if (isMounted.current) {
        setLastSaved(new Date());
        setSaveStatus("saved");
      }
    } catch (error) {
      console.error("Erro crítico ao salvar:", error);
    }
  }, [editor, scriptId]);

  // 3. O GATILHO (Debounce)
  const triggerSave = useCallback(() => {
    if (!initialLoadDone.current) return;

    if (isMounted.current) setSaveStatus("saving");

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Espera 2 segundos de inatividade para salvar
    debounceTimer.current = setTimeout(() => {
      executeSave();
    }, 2000);
  }, [executeSave]);

  // 4. CONECTAR AO EDITOR (Listener)
  useEffect(() => {
    if (!editor) return;

    editor.on("update", triggerSave);

    return () => {
      editor.off("update", triggerSave);

      // Salva imediatamente ao sair (Cleanup seguro)
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        // Chama o save direto, mas verifica se o editor ainda existe
        if (!editor.isDestroyed) {
          console.log("💾 Salvamento de emergência (Unmount)");
          executeSave();
        }
      }
    };
  }, [editor, triggerSave, executeSave]);

  // 5. GATILHO DE METADADOS
  // Dispara o timer quando muda título, série ou capítulo
  useEffect(() => {
    if (!isLoaded) return;
    triggerSave();
  }, [title, seriesTitle, chapterNumber, isLoaded, triggerSave]);

  return {
    isLoaded,
    saveContent: triggerSave,
    lastSaved,
    saveStatus,
    title,
    setTitle,
    seriesTitle,
    setSeriesTitle,
    chapterNumber,
    setChapterNumber,
    existingSeries,
  };
}
