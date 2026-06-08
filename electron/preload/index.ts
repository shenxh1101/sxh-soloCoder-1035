import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (options: Electron.OpenDialogOptions) => ipcRenderer.invoke('dialog:openFile', options),
  saveFile: (options: Electron.SaveDialogOptions) => ipcRenderer.invoke('dialog:saveFile', options),
  showMessageBox: (options: Electron.MessageBoxOptions) => ipcRenderer.invoke('dialog:showMessageBox', options)
})

declare global {
  interface Window {
    electronAPI: {
      openFile: (options: Electron.OpenDialogOptions) => Promise<Electron.OpenDialogReturnValue>
      saveFile: (options: Electron.SaveDialogOptions) => Promise<Electron.SaveDialogReturnValue>
      showMessageBox: (options: Electron.MessageBoxOptions) => Promise<Electron.MessageBoxReturnValue>
    }
  }
}
