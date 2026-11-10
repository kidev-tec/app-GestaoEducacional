/**
 * ERP Platform Desktop — main process (Electron). Bootstrap apenas.
 * Regras de segurança (gate duro G6b): contextIsolation ON, nodeIntegration OFF,
 * sandbox ON, preload mínimo, navegação restrita a origens locais (lib.isAllowedUrl).
 */
import { app, BrowserWindow, shell } from 'electron';
import * as path from 'node:path';
import { isAllowedUrl, resolveTargetUrl } from './lib.js';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    title: 'ERP Platform',
    backgroundColor: '#F7F8FA',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.webContents.on('will-navigate', (event, target) => {
    if (!isAllowedUrl(target)) event.preventDefault();
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!isAllowedUrl(url)) {
      void shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  const target = resolveTargetUrl(__dirname, process.env, app.isPackaged, process.resourcesPath);
  if (target.kind === 'url') {
    void mainWindow.loadURL(target.url);
  } else {
    void mainWindow.loadFile(target.filePath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
