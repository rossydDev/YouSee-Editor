import {
  getAllScripts,
  getScriptById,
  saveScript,
  Script,
} from "@/lib/storage";
import { Editor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";

// Conteúdo padrão para injetar no Editor
const DEFAULT_INITIAL_CONTENT = {
  type: "doc",
  content: [
    {
      type: "page",
      content: [
        { type: "storyPageHeader" },
        { type: "panel", attrs: { number: 1 } },
        { type: "paragraph" },
      ],
    },
  ],
};

// Versão String para comparação (Detectar se o roteiro está virgem)
const DEFAULT_INITIAL_JSON = JSON.stringify(DEFAULT_INITIAL_CONTENT);

export function useAutoSave(editor: Editor | null, scriptId: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  const [title, setTitle] = useState("Carregando...");
  const [seriesTitle, setSeriesTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState<string>("");
  const [existingSeries, setExistingSeries] = useState<string[]>([]);

  const valuesRef = useRef({ title, seriesTitle, chapterNumber });

  // Mantém as refs atualizadas para o callback de save
  useEffect(() => {
    valuesRef.current = { title, seriesTitle, chapterNumber };
  }, [title, seriesTitle, chapterNumber]);

  const initialLoadDone = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  // Monitorar Mount/Unmount para evitar updates em componente desmontado
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // 1. CARREGAMENTO DO ROTEIRO
  useEffect(() => {
    if (!editor || !scriptId || scriptId === "undefined") return;
    if (initialLoadDone.current) return;

    const loadData = async () => {
      let script: Script | null = null;
      let loadedContent: any = null;

      try {
        // A. DESKTOP (Leitura de Arquivo Físico)
        if (
          typeof window !== "undefined" &&
          window.electron?.isDesktop &&
          (scriptId.includes("/") || scriptId.includes("\\"))
        ) {
          try {
            const fileContent = await window.electron.readFile(scriptId);
            if (fileContent) {
              script = JSON.parse(fileContent);
            }
          } catch (e) {
            // Se der erro ao ler (arquivo não existe ainda), tratamos como novo
            console.log("Arquivo novo ou não encontrado, iniciando vazio.");
          }
        }
        // B. WEB (LocalStorage)
        else {
          script = getScriptById(scriptId);
        }

        // Se encontrou dados salvos
        if (script) {
          setTitle(script.title || "Sem Título");
          setSeriesTitle(script.seriesTitle || "");
          setChapterNumber(script.chapterNumber?.toString() || "");

          // Verificação de segurança para o conteúdo
          const contentAny = script.content as any;
          if (
            contentAny &&
            contentAny.content &&
            Array.isArray(contentAny.content) &&
            contentAny.content.length > 0
          ) {
            loadedContent = script.content;
          } else {
            loadedContent = DEFAULT_INITIAL_CONTENT;
          }

          valuesRef.current = {
            title: script.title || "Sem Título",
            seriesTitle: script.seriesTitle || "",
            chapterNumber: script.chapterNumber?.toString() || "",
          };
        } else {
          // Arquivo Novo
          setTitle("Novo Roteiro");
          loadedContent = DEFAULT_INITIAL_CONTENT;
        }

        // Injeta no Tiptap
        if (loadedContent) {
          queueMicrotask(() => {
            if (!editor.isDestroyed) {
              editor.commands.setContent(loadedContent);
              editor.commands.focus("end");
            }
          });
        }
      } catch (error) {
        console.error("Erro ao carregar roteiro:", error);
      } finally {
        setIsLoaded(true);
        initialLoadDone.current = true;
      }
    };

    loadData();
  }, [editor, scriptId]);

  // 2. CARREGAR SUGESTÕES DE SÉRIE (Correção: Roda apenas uma vez ao carregar)
  useEffect(() => {
    const fetchSeriesSuggestions = async () => {
      let allSeries: string[] = [];

      if (typeof window !== "undefined" && window.electron?.isDesktop) {
        const workspacePath = localStorage.getItem("yousee_workspace_path");
        if (workspacePath) {
          try {
            const files = await window.electron.readWorkspace(workspacePath);
            allSeries = files
              .map((f: any) => f.seriesTitle)
              .filter(
                (s: any) => s && typeof s === "string" && s.trim() !== ""
              );
          } catch (e) {
            console.error("Erro ao ler sugestões:", e);
          }
        }
      } else {
        const scripts = getAllScripts();
        allSeries = scripts
          .map((s) => s.seriesTitle)
          .filter((s): s is string => !!s && s.trim() !== "");
      }

      const uniqueSeries = Array.from(new Set(allSeries)).sort();
      setExistingSeries(uniqueSeries);
    };

    if (isLoaded) {
      fetchSeriesSuggestions();
    }
    // IMPORTANTE: Removemos 'saveStatus' daqui para evitar loop infinito
  }, [isLoaded]);

  // 3. FUNÇÃO DE SALVAR (COM LÓGICA GHOST FILE)
  const executeSave = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    if (!initialLoadDone.current) return;

    try {
      const json = editor.getJSON();
      const currentValues = valuesRef.current;
      const chapNum = currentValues.chapterNumber
        ? parseInt(currentValues.chapterNumber)
        : null;

      // --- LÓGICA DE ARQUIVO FANTASMA ---
      // Verifica se o usuário alterou algo do padrão
      const isDefaultTitle =
        currentValues.title === "Novo Roteiro" ||
        currentValues.title === "Sem Título" ||
        currentValues.title.trim() === "";

      const isDefaultSeries =
        !currentValues.seriesTitle || currentValues.seriesTitle.trim() === "";
      const isDefaultChapter = !currentValues.chapterNumber;

      // Compara conteúdo atual com o padrão (ignorando formatação de espaços do JSON)
      const currentContentString = JSON.stringify(json);
      const isDefaultContent = currentContentString === DEFAULT_INITIAL_JSON;

      // Se tudo for padrão, NÃO cria o arquivo no disco ainda.
      if (
        isDefaultTitle &&
        isDefaultSeries &&
        isDefaultChapter &&
        isDefaultContent
      ) {
        // console.log("👻 Fantasma: Ignorando salvamento de arquivo vazio.");
        setSaveStatus("saved");
        return;
      }
      // -----------------------------------

      saveScript(
        scriptId,
        json,
        currentValues.title,
        currentValues.seriesTitle,
        chapNum
      );

      if (isMounted.current) {
        setLastSaved(new Date());
        setSaveStatus("saved");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  }, [editor, scriptId]);

  // 4. TRIGGER (Debounce de 2 segundos)
  const triggerSave = useCallback(() => {
    if (!initialLoadDone.current) return;
    if (isMounted.current) setSaveStatus("saving");

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      executeSave();
    }, 2000);
  }, [executeSave]);

  // Listeners do Editor
  useEffect(() => {
    if (!editor) return;
    editor.on("update", triggerSave);
    return () => {
      editor.off("update", triggerSave);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        // Opcional: Salvar ao desmontar se não for fantasma (mas o executeSave já trata isso)
        if (!editor.isDestroyed && initialLoadDone.current) {
          executeSave();
        }
      }
    };
  }, [editor, triggerSave, executeSave]);

  // Listeners de Metadados (Título, Série, etc)
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
