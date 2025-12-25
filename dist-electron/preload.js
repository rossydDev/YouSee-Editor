"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electron", {
    isDesktop: true,
    // --- SISTEMA DE ARQUIVOS ---
    saveFile: function (content) { return electron_1.ipcRenderer.invoke("dialog:saveFile", content); },
    openFile: function () { return electron_1.ipcRenderer.invoke("dialog:openFile"); },
    selectFolder: function () { return electron_1.ipcRenderer.invoke("dialog:selectFolder"); },
    readWorkspace: function (path) { return electron_1.ipcRenderer.invoke("fs:readWorkspace", path); },
    // Compatibilidade
    saveToWorkspace: function (path, content) {
        return electron_1.ipcRenderer.invoke("fs:saveToPath", { filePath: path, content: content });
    },
    saveToPath: function (path, content) {
        return electron_1.ipcRenderer.invoke("fs:saveToPath", { filePath: path, content: content });
    },
    deleteFile: function (path) { return electron_1.ipcRenderer.invoke("fs:deleteFile", path); },
    readFile: function (path) { return electron_1.ipcRenderer.invoke("fs:readFile", path); },
    // --- CONTROLES DE JANELA ---
    minimize: function () { return electron_1.ipcRenderer.send("window-minimize"); },
    maximize: function () { return electron_1.ipcRenderer.send("window-maximize"); },
    close: function () { return electron_1.ipcRenderer.send("window-close"); },
    // --- MENU DE CONTEXTO (CORRETOR) ---
    // Escuta o evento que vem do Main
    onShowContextMenu: function (callback) {
        return electron_1.ipcRenderer.on("show-context-menu", function (_, data) { return callback(data); });
    },
    // Manda a palavra corrigida de volta pro Main
    replaceMisspelling: function (word) {
        return electron_1.ipcRenderer.send("replace-misspelling", word);
    },
});
