const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const database = require('./database.cjs');

let mainWindow;

/**
 * Checks if the Vite dev server is responding
 */
function checkUrlLive(url) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const req = http.get(
        {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          path: '/',
          timeout: 1000,
        },
        (res) => {
          resolve(res.statusCode < 500);
        }
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 650,
    title: 'سند برو | Ar-Receipt Pro',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
  const distPath = path.join(__dirname, '../dist/index.html');

  if (!app.isPackaged) {
    const isDevRunning = await checkUrlLive(devServerUrl);
    if (isDevRunning) {
      console.log(`[Electron] Loading from active dev server: ${devServerUrl}`);
      await mainWindow.loadURL(devServerUrl);
      return;
    }
  }

  if (fs.existsSync(distPath)) {
    console.log(`[Electron] Loading from built dist: ${distPath}`);
    await mainWindow.loadFile(distPath);
  } else {
    console.log(`[Electron] Falling back to: ${devServerUrl}`);
    mainWindow.loadURL(devServerUrl).catch((err) => {
      console.error('[Electron] Failed to load URL:', err);
    });
  }

  // Toggle DevTools with F12
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' && input.type === 'keyDown') {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  // Open external links safely in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(async () => {
  // Initialize SQLite database
  try {
    await database.initDatabase(app.getPath('userData'));
  } catch (err) {
    console.error('[SQLite] Initialization failed:', err);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handler: Print
ipcMain.handle('print-receipt', async () => {
  if (!mainWindow) return false;
  mainWindow.webContents.print({
    silent: false,
    printBackground: true,
    pageSize: 'A4',
  });
  return true;
});

// IPC Handler: Save PDF Buffer (Direct high-res raster / jsPDF output)
ipcMain.handle('save-pdf-buffer', async (event, { base64Data, filename }) => {
  if (!mainWindow) return { success: false, error: 'No main window' };
  try {
    const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    const buffer = Buffer.from(base64Content, 'base64');

    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'حفظ سند القبض بصيغة PDF',
      defaultPath: filename || 'سند_قبض.pdf',
      filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
    });

    if (filePath) {
      fs.writeFileSync(filePath, buffer);
      return { success: true, filePath };
    }
    return { success: false, canceled: true };
  } catch (error) {
    console.error('Failed to save PDF buffer:', error);
    return { success: false, error: error.message };
  }
});

// IPC Handler: Print to PDF (Vector native quality)
ipcMain.handle('print-to-pdf', async (event, filename) => {
  if (!mainWindow) return { success: false, error: 'No active window' };
  try {
    const pdfData = await mainWindow.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margins: {
        marginType: 'none',
      },
    });

    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title: 'حفظ سند القبض بصيغة PDF',
      defaultPath: filename || 'سند_قبض.pdf',
      filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    fs.writeFileSync(filePath, pdfData);
    return { success: true, filePath };
  } catch (error) {
    console.error('Failed to generate native PDF:', error);
    return { success: false, error: error.message };
  }
});

// ==========================================
// SQLite Database IPC Handlers
// ==========================================

ipcMain.handle('db:get-all', async () => {
  try {
    return database.getAllData();
  } catch (error) {
    console.error('[SQLite] db:get-all failed:', error);
    return { receipts: null, company: null, error: error.message };
  }
});

ipcMain.handle('db:save-receipts', async (event, receipts) => {
  try {
    return database.saveReceipts(receipts);
  } catch (error) {
    console.error('[SQLite] db:save-receipts failed:', error);
    return false;
  }
});

ipcMain.handle('db:save-company', async (event, profile) => {
  try {
    return database.saveCompanyProfile(profile);
  } catch (error) {
    console.error('[SQLite] db:save-company failed:', error);
    return false;
  }
});

ipcMain.handle('db:get-info', async () => {
  try {
    return database.getDatabaseInfo();
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('db:open-folder', async () => {
  try {
    const info = database.getDatabaseInfo();
    if (info && info.path && fs.existsSync(info.path)) {
      shell.showItemInFolder(info.path);
      return true;
    }
    shell.openPath(app.getPath('userData'));
    return true;
  } catch (error) {
    console.error('[SQLite] open-folder failed:', error);
    return false;
  }
});

ipcMain.handle('db:backup', async () => {
  if (!mainWindow) return { success: false, error: 'No main window' };
  try {
    const dateStr = new Date().toISOString().split('T')[0];
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title: 'تصدير نسخة احتياطية لقاعدة البيانات SQLite',
      defaultPath: `سند_برو_نسخة_احتياطية_${dateStr}.db`,
      filters: [
        { name: 'SQLite Database', extensions: ['db', 'sqlite'] },
        { name: 'JSON Backup', extensions: ['json'] },
      ],
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    const result = await database.backupDatabase(filePath);
    return result;
  } catch (error) {
    console.error('[SQLite] db:backup failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:restore', async () => {
  if (!mainWindow) return { success: false, error: 'No main window' };
  try {
    const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
      title: 'استيراد واستعادة قاعدة البيانات',
      filters: [
        { name: 'Database / Backup Files', extensions: ['db', 'sqlite', 'json'] },
      ],
      properties: ['openFile'],
    });

    if (canceled || !filePaths || filePaths.length === 0) {
      return { success: false, canceled: true };
    }

    const result = database.restoreDatabase(filePaths[0]);
    return result;
  } catch (error) {
    console.error('[SQLite] db:restore failed:', error);
    return { success: false, error: error.message };
  }
});
