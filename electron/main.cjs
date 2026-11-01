const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

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
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
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
