import { BrowserWindow, ipcMain, dialog, IpcMainEvent } from 'electron'
import { OPEN_FILE, DROP_FILE, PROCESS_END, events } from '../utils/eventsName'
import { exec } from '../core'

function endSender(event: IpcMainEvent, res: any) {
  event.sender.send(events[PROCESS_END], res)
}

export function initIpc(win: BrowserWindow | null) {
  ipcMain.on(events[OPEN_FILE], async (event, data) => {
    const res = await dialog.showOpenDialog(win!, data.config.dialog)
    const processRes = exec(res.filePaths, data.config.file, data.type)
    endSender(event, processRes)
  })

  ipcMain.on(events[DROP_FILE], async (event, data) => {
    console.log(data.type)
    const processRes = exec(
      data.config.drop.filePaths,
      data.config.file,
      data.type,
    )
    endSender(event, processRes)
  })
}
