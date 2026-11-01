const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
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

  // Load Vite dev server if running, or production build
  const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
  const distPath = path.join(__dirname, '../dist/index.html');

  if (fs.existsSync(distPath) && !process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL(devServerUrl).catch(() => {
      // Fallback to dist if dev server not running
      if (fs.existsSync(distPath)) {
        mainWindow.loadFile(distPath);
      }
    });
  }

  // Open external links safely
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

// IPC Handler: Print to PDF
ipcMain.handle('print-to-pdf', async (event, filename) => {
  if (!mainWindow) return false;
  try {
    const pdfData = await mainWindow.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      margins: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    });

    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'حفظ سند القبض بصيغة PDF',
      defaultPath: filename || 'سند_قبض.pdf',
      filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
    });

    if (filePath) {
      fs.writeFileSync(filePath, pdfData);
      return { success: true, filePath };
    }
    return { success: false, canceled: true };
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return { success: false, error: error.message };
  }
});
