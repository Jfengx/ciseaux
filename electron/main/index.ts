import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { preset } from './preset'
import { initIpc } from './ipc'
import './menu'

const ROOT_PATH_DIST = join(__dirname, '../..')

const ROOT_PATH_PUBLIC = join(
  __dirname,
  app.isPackaged ? '../..' : '../../../public',
)

const LOCAL_URL = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`

const INDEX_HTML = join(ROOT_PATH_DIST, 'index.html')

let win: BrowserWindow | null = null

async function createWindow() {
  win = new BrowserWindow({
    titleBarStyle: 'hiddenInset',
    width: 400,
    height: 300,
    minWidth: 400,
    minHeight: 300,
    frame: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (app.isPackaged) {
    win.loadFile(INDEX_HTML)
  } else {
    win.loadURL(LOCAL_URL)
    win.webContents.openDevTools()
  }

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

preset()
initIpc(win)
