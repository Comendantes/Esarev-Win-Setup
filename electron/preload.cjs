const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  runPowerShell:   (command) => ipcRenderer.invoke('run-powershell', command),
  getHardwareInfo: ()        => ipcRenderer.invoke('get-hardware-info'),
  openExternal:    (url)     => ipcRenderer.send('open-external', url),
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close:    () => ipcRenderer.send('window-close'),
  // Интро-окно
  introMinimize:  () => ipcRenderer.send('intro-minimize'),
  introClose:     () => ipcRenderer.send('intro-close'),
  introComplete:  () => ipcRenderer.send('intro-complete'),
  isElectron: true,
});
