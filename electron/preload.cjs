const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  print: () => ipcRenderer.invoke('print-receipt'),
  printToPDF: (filename) => ipcRenderer.invoke('print-to-pdf', filename),
  savePDFBuffer: (base64Data, filename) =>
    ipcRenderer.invoke('save-pdf-buffer', { base64Data, filename }),

  // SQLite Database API
  db: {
    getAll: () => ipcRenderer.invoke('db:get-all'),
    saveReceipts: (receipts) => ipcRenderer.invoke('db:save-receipts', receipts),
    saveCompanyProfile: (profile) => ipcRenderer.invoke('db:save-company', profile),
    backup: () => ipcRenderer.invoke('db:backup'),
    restore: () => ipcRenderer.invoke('db:restore'),
    getInfo: () => ipcRenderer.invoke('db:get-info'),
    openFolder: () => ipcRenderer.invoke('db:open-folder'),
  },
});
