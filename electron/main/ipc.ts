import { BrowserWindow, ipcMain, dialog, IpcMainEvent } from 'electron'
import { processFiles, type ImgConfig } from '../utils/file'
import { OPEN_FILE, DROP_FILE, PROCESS_END, events } from '../utils/eventsName'

function endSender(event: IpcMainEvent, res: any) {
  event.sender.send(events[PROCESS_END], res)
}

function processFileByPath(paths: string[], config: ImgConfig<number>) {
  processFiles(paths, config)
}

export function initIpc(win: BrowserWindow | null) {
  ipcMain.on(events[OPEN_FILE], async (event, data) => {
    const res = await dialog.showOpenDialog(win!, data.config.dialog)
    const processRes = await processFileByPath(res.filePaths, data.config.img)
    endSender(event, processRes)
  })

  ipcMain.on(events[DROP_FILE], async (event, data) => {
    const processRes = await processFileByPath(
      data.config.drop.filePaths,
      data.config.img,
    )
    endSender(event, processRes)
  })
}
