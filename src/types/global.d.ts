export {};

declare global {
  interface Window {
    electron?: {
      isDesktop: boolean;
      saveFile: (
        content: string
      ) => Promise<{ success: boolean; filePath?: string }>;
      openFile: () => Promise<{ content: string; filePath: string } | null>;
      selectFolder: () => Promise<string | null>;
      readWorkspace: (folderPath: string) => Promise<any[]>;
      saveToWorkspace: (filePath: string, content: string) => Promise<boolean>;
      saveToPath: (filePath: string, content: string) => Promise<boolean>;
      readFile: (filePath: string) => Promise<string | null>;
      deleteFile: (filePath: string) => Promise<boolean>;
    };
  }
}
