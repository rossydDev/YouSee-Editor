import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  // Salvar/Abrir Arquivo Único (Mantemos por compatibilidade)
  saveFile: (content: string) => ipcRenderer.invoke("dialog:saveFile", content),
  openFile: () => ipcRenderer.invoke("dialog:openFile"),

  // --- NOVOS COMANDOS DE WORKSPACE ---
  // 1. Abre janela para escolher a pasta
  selectFolder: () => ipcRenderer.invoke("dialog:selectFolder"),

  // 2. Lê todos os arquivos .yousee da pasta
  readWorkspace: (folderPath: string) =>
    ipcRenderer.invoke("fs:readWorkspace", folderPath),

  // 3. Salva direto no arquivo (sem abrir janela de diálogo)
  saveToWorkspace: (filePath: string, content: string) =>
    ipcRenderer.invoke("fs:saveToPath", { filePath, content }),

  saveToPath: (filePath: string, content: string) =>
    ipcRenderer.invoke("fs:saveToPath", { filePath, content }),

  readFile: (filePath: string) => ipcRenderer.invoke("fs:readFile", filePath),

  deleteFile: (filePath: string) =>
    ipcRenderer.invoke("fs:deleteFile", filePath),

  isDesktop: true,
});
