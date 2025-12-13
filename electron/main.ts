import { app, BrowserWindow, dialog, ipcMain } from "electron";
import fs from "fs/promises";
import path from "path";

let mainWindow: BrowserWindow | null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,

    frame: false, // 1. Remove a barra nativa do Windows
    backgroundColor: "#09090b", // Cor do zinc-950 para evitar o "flash" branco ao abrir
    titleBarStyle: "hidden", // Esconde título no Mac também

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = !app.isPackaged;
  const startUrl = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "../out/index.html")}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    // Abre o DevTools apenas se estiver em modo de desenvolvimento
    // mainWindow.webContents.openDevTools();
  }
};

// ==========================================
// 1. CONTROLE DE JANELA (MINIMIZAR/FECHAR)
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
// 2. SISTEMA DE ARQUIVOS (IMPORTAR/EXPORTAR)
// ==========================================

// Salvar Arquivo Único (Exportar Backup ou PDF)
ipcMain.handle("dialog:saveFile", async (_, content: string) => {
  if (!mainWindow) return { success: false };

  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: "Salvar Arquivo",
    defaultPath: "roteiro.yousee",
    filters: [
      { name: "YouSee Script", extensions: ["yousee", "json"] },
      { name: "Todos os Arquivos", extensions: ["*"] },
    ],
  });

  if (canceled || !filePath) {
    return { success: false };
  }

  try {
    await fs.writeFile(filePath, content, "utf-8");
    return { success: true, filePath };
  } catch (err) {
    console.error("Erro ao salvar:", err);
    return { success: false, error: "Falha ao gravar arquivo." };
  }
});

// Abrir Arquivo Único (Importar Backup da Vercel)
ipcMain.handle("dialog:openFile", async () => {
  if (!mainWindow) return null;

  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: "Importar Roteiro ou Backup",
    properties: ["openFile"],
    filters: [{ name: "YouSee Script", extensions: ["yousee", "json"] }],
  });

  if (canceled || filePaths.length === 0) {
    return null;
  }

  try {
    const filePath = filePaths[0];
    const content = await fs.readFile(filePath, "utf-8");
    return { content, filePath };
  } catch (err) {
    console.error("Erro ao ler arquivo:", err);
    return null;
  }
});

// ==========================================
// 3. SISTEMA DE WORKSPACE (PASTA GERENCIADA)
// ==========================================

// Selecionar a Pasta de Trabalho
ipcMain.handle("dialog:selectFolder", async () => {
  if (!mainWindow) return null;

  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: "Selecione a pasta onde seus roteiros serão salvos",
    properties: ["openDirectory"],
  });

  if (canceled || filePaths.length === 0) return null;
  return filePaths[0];
});

// Ler todo o conteúdo da Pasta (Listagem da Sidebar)
ipcMain.handle("fs:readWorkspace", async (_, folderPath: string) => {
  try {
    const files = await fs.readdir(folderPath);

    // Filtra apenas arquivos .yousee ou .json
    const scriptFiles = files.filter(
      (file) => file.endsWith(".yousee") || file.endsWith(".json")
    );

    // Lê cada arquivo para extrair o Título e a SÉRIE
    const scriptsData = await Promise.all(
      scriptFiles.map(async (fileName) => {
        try {
          const fullPath = path.join(folderPath, fileName);
          const stats = await fs.stat(fullPath);
          const content = await fs.readFile(fullPath, "utf-8");
          const json = JSON.parse(content);

          return {
            id: fullPath, // ID é o caminho completo no Desktop
            title: json.title || fileName.replace(".yousee", ""),
            seriesTitle: json.seriesTitle || "",
            chapterNumber: json.chapterNumber || "",
            lastModified: stats.mtimeMs,
          };
        } catch (e) {
          return null; // Ignora arquivos corrompidos
        }
      })
    );

    return scriptsData.filter((s) => s !== null);
  } catch (err) {
    console.error("Erro ao ler workspace:", err);
    return [];
  }
});

// Salvar Silencioso (Ctrl+S / Autosave)
ipcMain.handle("fs:saveToPath", async (_, { filePath, content }) => {
  try {
    await fs.writeFile(filePath, content, "utf-8");
    return true;
  } catch (err) {
    console.error(`Erro ao salvar em ${filePath}:`, err);
    return false;
  }
});

// Deletar Arquivo
ipcMain.handle("fs:deleteFile", async (_, filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (err) {
    console.error(`Erro ao deletar arquivo ${filePath}:`, err);
    return false;
  }
});

// Ler Conteúdo de um Arquivo Específico
ipcMain.handle("fs:readFile", async (_, filePath) => {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content;
  } catch (err) {
    console.error(`Erro ao ler arquivo ${filePath}:`, err);
    return null;
  }
});

// ==========================================
// CICLO DE VIDA DO APP
// ==========================================

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
