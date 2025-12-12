import { app, BrowserWindow, dialog, ipcMain } from "electron";
import fs from "fs/promises";
import path from "path";

let mainWindow: BrowserWindow | null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: "#09090b", // Fundo Dark (Zinc-950) para não piscar branco ao abrir
    webPreferences: {
      nodeIntegration: false, // Segurança: Render não acessa Node direto
      contextIsolation: true, // Segurança: Isola contextos
      preload: path.join(__dirname, "preload.js"), // Nossa ponte segura
    },
    autoHideMenuBar: true, // Esconde a barra de menu padrão do Windows (File, Edit...)
    title: "YouSee Editor",
  });

  const isDev = !app.isPackaged;
  const startUrl = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "../out/index.html")}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
};

// ==========================================
// 1. SISTEMA DE ARQUIVOS (IMPORTAR/EXPORTAR)
// Usado para trazer seus backups da Vercel
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
// 2. SISTEMA DE WORKSPACE (PASTA GERENCIADA)
// Usado para o novo Dashboard "Modo Desktop"
// ==========================================

// Selecionar a Pasta de Trabalho
ipcMain.handle("dialog:selectFolder", async () => {
  if (!mainWindow) return null;

  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: "Selecione a pasta onde seus roteiros serão salvos",
    properties: ["openDirectory"], // Apenas pastas
  });

  if (canceled || filePaths.length === 0) return null;
  return filePaths[0]; // Retorna o caminho da pasta (ex: C:\Docs\Roteiros)
});

// Ler todo o conteúdo da Pasta (Listagem do Dashboard)
// No arquivo electron/main.ts

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
            id: fullPath,
            title: json.title || fileName.replace(".yousee", ""),
            // IMPORTANTE: Esta linha abaixo é a que permite o agrupamento
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
    console.error("Erro ao ler workspace:", err);
    return [];
  }
});

// Salvar Silencioso (Ctrl+S / Autosave)
// Grava diretamente no caminho sem abrir janela de diálogo
ipcMain.handle("fs:saveToPath", async (_, { filePath, content }) => {
  try {
    await fs.writeFile(filePath, content, "utf-8");
    return true;
  } catch (err) {
    console.error(`Erro ao salvar em ${filePath}:`, err);
    return false;
  }
});

ipcMain.handle("fs:deleteFile", async (_, filePath) => {
  try {
    // Apaga o arquivo permanentemente
    await fs.unlink(filePath);
    return true;
  } catch (err) {
    console.error(`Erro ao deletar arquivo ${filePath}:`, err);
    return false;
  }
});

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
