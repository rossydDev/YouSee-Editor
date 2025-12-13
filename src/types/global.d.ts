export {};

declare global {
  interface Window {
    electron?: {
      isDesktop: boolean;
      // ... suas outras funções ...
      saveFile: (content: string) => Promise<any>;
      openFile: () => Promise<any>;
      selectFolder: () => Promise<any>;
      readWorkspace: (path: string) => Promise<any>;
      saveToWorkspace: (path: string, content: string) => Promise<boolean>;
      deleteFile: (path: string) => Promise<boolean>;
      readFile: (path: string) => Promise<string | null>;

      // Adicione estas 3 linhas:
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
  }
}
