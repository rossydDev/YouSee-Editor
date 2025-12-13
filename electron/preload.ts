import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  isDesktop: true,

  // --- SISTEMA DE ARQUIVOS ---
  saveFile: (content: string) => ipcRenderer.invoke("dialog:saveFile", content),
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  selectFolder: () => ipcRenderer.invoke("dialog:selectFolder"),

  readWorkspace: (path: string) => ipcRenderer.invoke("fs:readWorkspace", path),

  // MANTENHA AMBOS PARA COMPATIBILIDADE
  saveToWorkspace: (path: string, content: string) =>
    ipcRenderer.invoke("fs:saveToPath", { filePath: path, content }),
  saveToPath: (path: string, content: string) =>
    ipcRenderer.invoke("fs:saveToPath", { filePath: path, content }), // <--- LINHA NOVA (Alias)

  deleteFile: (path: string) => ipcRenderer.invoke("fs:deleteFile", path),
  readFile: (path: string) => ipcRenderer.invoke("fs:readFile", path),

  // --- CONTROLES DE JANELA ---
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
});
