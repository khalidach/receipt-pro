const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  print: () => ipcRenderer.invoke('print-receipt'),
  printToPDF: (filename) => ipcRenderer.invoke('print-to-pdf', filename),
  savePDFBuffer: (base64Data, filename) =>
    ipcRenderer.invoke('save-pdf-buffer', { base64Data, filename }),
});
