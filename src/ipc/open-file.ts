import { ipcRenderer } from 'electron'

ipcRenderer.on('main-process-message', (_event, ...args) => {
  console.log('[Receive Main-process message]:', ...args)
})

ipcRenderer.on('process-end', (e, d) => {
  console.log(e, d)
})
