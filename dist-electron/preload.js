"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electron", {
    // Salvar/Abrir Arquivo Único (Mantemos por compatibilidade)
    saveFile: function (content) { return electron_1.ipcRenderer.invoke("dialog:saveFile", content); },
    openFile: function () { return electron_1.ipcRenderer.invoke("dialog:openFile"); },
    // --- NOVOS COMANDOS DE WORKSPACE ---
    // 1. Abre janela para escolher a pasta
    selectFolder: function () { return electron_1.ipcRenderer.invoke("dialog:selectFolder"); },
    // 2. Lê todos os arquivos .yousee da pasta
    readWorkspace: function (folderPath) {
        return electron_1.ipcRenderer.invoke("fs:readWorkspace", folderPath);
    },
    // 3. Salva direto no arquivo (sem abrir janela de diálogo)
    saveToWorkspace: function (filePath, content) {
        return electron_1.ipcRenderer.invoke("fs:saveToPath", { filePath: filePath, content: content });
    },
    saveToPath: function (filePath, content) {
        return electron_1.ipcRenderer.invoke("fs:saveToPath", { filePath: filePath, content: content });
    },
    readFile: function (filePath) { return electron_1.ipcRenderer.invoke("fs:readFile", filePath); },
    deleteFile: function (filePath) {
        return electron_1.ipcRenderer.invoke("fs:deleteFile", filePath);
    },
    isDesktop: true,
});
