import { app, BrowserWindow, dialog, ipcMain } from "electron";
import fs from "fs/promises";
import path from "path";

// NOTA: Removemos o 'electron-context-menu' pois faremos um customizado no React

let mainWindow: BrowserWindow | null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,

    frame: false,
    backgroundColor: "#09090b",
    titleBarStyle: "hidden",

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: true, // Garante que a verificação ortográfica está ativa
    },
  });

  const isDev = !app.isPackaged;
  const startUrl = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "../out/index.html")}`;

  mainWindow.loadURL(startUrl);

  // Define o idioma para Português
  mainWindow.webContents.session.setSpellCheckerLanguages(["pt-BR"]);

  // ========================================================
  // LÓGICA DO MENU DE CONTEXTO CUSTOMIZADO
  // ========================================================

  // 1. Ouve quando o usuário clica com o botão direito
  mainWindow.webContents.on("context-menu", (_, params) => {
    // Envia evento para o React SE houver sugestões de erro ou texto selecionado
    if (params.dictionarySuggestions.length > 0 || params.selectionText) {
      mainWindow?.webContents.send("show-context-menu", {
        x: params.x,
        y: params.y,
        suggestions: params.dictionarySuggestions,
        hasSelection: !!params.selectionText,
      });
    }
  });
};

// 2. Recebe o comando do React para aplicar a correção
ipcMain.on("replace-misspelling", (_, word) => {
  if (mainWindow) {
    mainWindow.webContents.replaceMisspelling(word);
  }
});

// ==========================================
// CONTROLES DE JANELA
// ==========================================

ipcMain.on("window-minimize", (event) => {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  if (win) win.minimize();
});

ipcMain.on("window-maximize", (event) => {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
});

ipcMain.on("window-close", (event) => {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  if (win) win.close();
});

// ==========================================
// SISTEMA DE ARQUIVOS
// ==========================================

ipcMain.handle("dialog:saveFile", async (_, content: string) => {
  if (!mainWindow) return { success: false };
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: "Salvar Arquivo",
    defaultPath: "roteiro.yousee",
    filters: [
      { name: "YouSee Script", extensions: ["yousee", "json"] },
      { name: "Todos", extensions: ["*"] },
    ],
  });
  if (canceled || !filePath) return { success: false };
  try {
    await fs.writeFile(filePath, content, "utf-8");
    return { success: true, filePath };
  } catch (err) {
    return { success: false, error: "Falha ao gravar arquivo." };
  }
});

ipcMain.handle("dialog:openFile", async () => {
  if (!mainWindow) return null;
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: "Importar Roteiro",
    properties: ["openFile"],
    filters: [{ name: "YouSee Script", extensions: ["yousee", "json"] }],
  });
  if (canceled || filePaths.length === 0) return null;
  try {
    const filePath = filePaths[0];
    const content = await fs.readFile(filePath, "utf-8");
    return { content, filePath };
  } catch (err) {
    return null;
  }
});

ipcMain.handle("dialog:selectFolder", async () => {
  if (!mainWindow) return null;
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: "Selecione a pasta de trabalho",
    properties: ["openDirectory"],
  });
  if (canceled || filePaths.length === 0) return null;
  return filePaths[0];
});

ipcMain.handle("fs:readWorkspace", async (_, folderPath: string) => {
  try {
    const files = await fs.readdir(folderPath);
    const scriptFiles = files.filter(
      (file) => file.endsWith(".yousee") || file.endsWith(".json")
    );
    const scriptsData = await Promise.all(
      scriptFiles.map(async (fileName) => {
        try {
          const fullPath = path.join(folderPath, fileName);
          const stats = await fs.stat(fullPath);
          const content = await fs.readFile(fullPath, "utf-8");
          const json = JSON.parse(content);
          return {
            id: fullPath,
            title: json.title || fileName.replace(".yousee", ""),
            seriesTitle: json.seriesTitle || "",
            chapterNumber: json.chapterNumber || "",
            lastModified: stats.mtimeMs,
          };
        } catch (e) {
          return null;
        }
      })
    );
    return scriptsData.filter((s) => s !== null);
  } catch (err) {
    return [];
  }
});

ipcMain.handle("fs:saveToPath", async (_, { filePath, content }) => {
  try {
    await fs.writeFile(filePath, content, "utf-8");
    return true;
  } catch (err) {
    return false;
  }
});

ipcMain.handle("fs:deleteFile", async (_, filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (err) {
    return false;
  }
});

ipcMain.handle("fs:readFile", async (_, filePath) => {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (err) {
    return null;
  }
});

// ==========================================
// LIFECYCLE
// ==========================================

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
