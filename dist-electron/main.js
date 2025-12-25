"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var promises_1 = __importDefault(require("fs/promises"));
var path_1 = __importDefault(require("path"));
// NOTA: Removemos o 'electron-context-menu' pois faremos um customizado no React
var mainWindow;
var createWindow = function () {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        frame: false,
        backgroundColor: "#09090b",
        titleBarStyle: "hidden",
        webPreferences: {
            preload: path_1.default.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
            spellcheck: true, // Garante que a verificação ortográfica está ativa
        },
    });
    var isDev = !electron_1.app.isPackaged;
    var startUrl = isDev
        ? "http://localhost:3000"
        : "file://".concat(path_1.default.join(__dirname, "../out/index.html"));
    mainWindow.loadURL(startUrl);
    // Define o idioma para Português
    mainWindow.webContents.session.setSpellCheckerLanguages(["pt-BR"]);
    // ========================================================
    // LÓGICA DO MENU DE CONTEXTO CUSTOMIZADO
    // ========================================================
    // 1. Ouve quando o usuário clica com o botão direito
    mainWindow.webContents.on("context-menu", function (_, params) {
        // Envia evento para o React SE houver sugestões de erro ou texto selecionado
        if (params.dictionarySuggestions.length > 0 || params.selectionText) {
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send("show-context-menu", {
                x: params.x,
                y: params.y,
                suggestions: params.dictionarySuggestions,
                hasSelection: !!params.selectionText,
            });
        }
    });
};
// 2. Recebe o comando do React para aplicar a correção
electron_1.ipcMain.on("replace-misspelling", function (_, word) {
    if (mainWindow) {
        mainWindow.webContents.replaceMisspelling(word);
    }
});
// ==========================================
// CONTROLES DE JANELA
// ==========================================
electron_1.ipcMain.on("window-minimize", function (event) {
    var webContents = event.sender;
    var win = electron_1.BrowserWindow.fromWebContents(webContents);
    if (win)
        win.minimize();
});
electron_1.ipcMain.on("window-maximize", function (event) {
    var webContents = event.sender;
    var win = electron_1.BrowserWindow.fromWebContents(webContents);
    if (win) {
        if (win.isMaximized()) {
            win.unmaximize();
        }
        else {
            win.maximize();
        }
    }
});
electron_1.ipcMain.on("window-close", function (event) {
    var webContents = event.sender;
    var win = electron_1.BrowserWindow.fromWebContents(webContents);
    if (win)
        win.close();
});
// ==========================================
// SISTEMA DE ARQUIVOS
// ==========================================
electron_1.ipcMain.handle("dialog:saveFile", function (_, content) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, canceled, filePath, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!mainWindow)
                    return [2 /*return*/, { success: false }];
                return [4 /*yield*/, electron_1.dialog.showSaveDialog(mainWindow, {
                        title: "Salvar Arquivo",
                        defaultPath: "roteiro.yousee",
                        filters: [
                            { name: "YouSee Script", extensions: ["yousee", "json"] },
                            { name: "Todos", extensions: ["*"] },
                        ],
                    })];
            case 1:
                _a = _b.sent(), canceled = _a.canceled, filePath = _a.filePath;
                if (canceled || !filePath)
                    return [2 /*return*/, { success: false }];
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                return [4 /*yield*/, promises_1.default.writeFile(filePath, content, "utf-8")];
            case 3:
                _b.sent();
                return [2 /*return*/, { success: true, filePath: filePath }];
            case 4:
                err_1 = _b.sent();
                return [2 /*return*/, { success: false, error: "Falha ao gravar arquivo." }];
            case 5: return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.handle("dialog:openFile", function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, canceled, filePaths, filePath, content, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!mainWindow)
                    return [2 /*return*/, null];
                return [4 /*yield*/, electron_1.dialog.showOpenDialog(mainWindow, {
                        title: "Importar Roteiro",
                        properties: ["openFile"],
                        filters: [{ name: "YouSee Script", extensions: ["yousee", "json"] }],
                    })];
            case 1:
                _a = _b.sent(), canceled = _a.canceled, filePaths = _a.filePaths;
                if (canceled || filePaths.length === 0)
                    return [2 /*return*/, null];
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                filePath = filePaths[0];
                return [4 /*yield*/, promises_1.default.readFile(filePath, "utf-8")];
            case 3:
                content = _b.sent();
                return [2 /*return*/, { content: content, filePath: filePath }];
            case 4:
                err_2 = _b.sent();
                return [2 /*return*/, null];
            case 5: return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.handle("dialog:selectFolder", function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, canceled, filePaths;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!mainWindow)
                    return [2 /*return*/, null];
                return [4 /*yield*/, electron_1.dialog.showOpenDialog(mainWindow, {
                        title: "Selecione a pasta de trabalho",
                        properties: ["openDirectory"],
                    })];
            case 1:
                _a = _b.sent(), canceled = _a.canceled, filePaths = _a.filePaths;
                if (canceled || filePaths.length === 0)
                    return [2 /*return*/, null];
                return [2 /*return*/, filePaths[0]];
        }
    });
}); });
electron_1.ipcMain.handle("fs:readWorkspace", function (_, folderPath) { return __awaiter(void 0, void 0, void 0, function () {
    var files, scriptFiles, scriptsData, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, promises_1.default.readdir(folderPath)];
            case 1:
                files = _a.sent();
                scriptFiles = files.filter(function (file) { return file.endsWith(".yousee") || file.endsWith(".json"); });
                return [4 /*yield*/, Promise.all(scriptFiles.map(function (fileName) { return __awaiter(void 0, void 0, void 0, function () {
                        var fullPath, stats, content, json, e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    fullPath = path_1.default.join(folderPath, fileName);
                                    return [4 /*yield*/, promises_1.default.stat(fullPath)];
                                case 1:
                                    stats = _a.sent();
                                    return [4 /*yield*/, promises_1.default.readFile(fullPath, "utf-8")];
                                case 2:
                                    content = _a.sent();
                                    json = JSON.parse(content);
                                    return [2 /*return*/, {
                                            id: fullPath,
                                            title: json.title || fileName.replace(".yousee", ""),
                                            seriesTitle: json.seriesTitle || "",
                                            chapterNumber: json.chapterNumber || "",
                                            lastModified: stats.mtimeMs,
                                        }];
                                case 3:
                                    e_1 = _a.sent();
                                    return [2 /*return*/, null];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 2:
                scriptsData = _a.sent();
                return [2 /*return*/, scriptsData.filter(function (s) { return s !== null; })];
            case 3:
                err_3 = _a.sent();
                return [2 /*return*/, []];
            case 4: return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.handle("fs:saveToPath", function (_1, _a) { return __awaiter(void 0, [_1, _a], void 0, function (_, _b) {
    var err_4;
    var filePath = _b.filePath, content = _b.content;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, promises_1.default.writeFile(filePath, content, "utf-8")];
            case 1:
                _c.sent();
                return [2 /*return*/, true];
            case 2:
                err_4 = _c.sent();
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.handle("fs:deleteFile", function (_, filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, promises_1.default.unlink(filePath)];
            case 1:
                _a.sent();
                return [2 /*return*/, true];
            case 2:
                err_5 = _a.sent();
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.handle("fs:readFile", function (_, filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, promises_1.default.readFile(filePath, "utf-8")];
            case 1: return [2 /*return*/, _a.sent()];
            case 2:
                err_6 = _a.sent();
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ==========================================
// LIFECYCLE
// ==========================================
electron_1.app.on("ready", createWindow);
electron_1.app.on("window-all-closed", function () {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
electron_1.app.on("activate", function () {
    if (electron_1.BrowserWindow.getAllWindows().length === 0)
        createWindow();
});
