export {};

declare global {
  interface Window {
    electron?: {
      isDesktop: boolean;

      // Sistema de Arquivos
      saveFile: (
        content: string
      ) => Promise<{ success: boolean; filePath?: string; error?: string }>;
      openFile: () => Promise<{ content: string; filePath: string } | null>;
      selectFolder: () => Promise<string | null>;
      readWorkspace: (path: string) => Promise<any[]>;
      saveToWorkspace: (path: string, content: string) => Promise<boolean>;
      saveToPath: (path: string, content: string) => Promise<boolean>;
      deleteFile: (path: string) => Promise<boolean>;
      readFile: (path: string) => Promise<string | null>;

      // Janela
      minimize: () => void;
      maximize: () => void;
      close: () => void;

      // --- NOVAS FUNÇÕES DO MENU DE CONTEXTO ---
      // Adicione estas duas linhas abaixo:
      onShowContextMenu: (callback: (data: any) => void) => void;
      replaceMisspelling: (word: string) => void;
    };
  }
}
