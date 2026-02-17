import { app, BrowserWindow, screen, shell, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Fix for transparent window on Windows (prevents black background)
app.disableHardwareAcceleration();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// The built directory structure
//
// ├─┬ dist-electron
// │ └── main.js
// └─┬ dist
//   └── index.html
// @ts-ignore
process.env.DIST = path.join(__dirname, '../dist');
// @ts-ignore
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');
let win;
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    win = new BrowserWindow({
        width: 320, // Initial Width
        height: 480, // Initial Height
        x: width - 340, // Margin from right
        y: 20,
        icon: path.join(process.env.VITE_PUBLIC || '', 'electron-vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true,
        },
        title: 'Focus Arena Desktop',
        alwaysOnTop: true,
        frame: false,
        transparent: true,
        resizable: true, // Allow resizing (internal or user)
        skipTaskbar: false,
        minWidth: 50,
        minHeight: 40,
    });
    // win.setAlwaysOnTop(true, 'screen-saver')
    win.setSkipTaskbar(false);
    // Open urls in the user's browser
    win.webContents.setWindowOpenHandler((edata) => {
        shell.openExternal(edata.url);
        return { action: 'deny' };
    });
    // IPC for resizing with Start-Anchored logic (Default Top-Right)
    ipcMain.on('resize-window', (event, width, height) => {
        if (!win)
            return;
        const bounds = win.getBounds();
        const display = screen.getDisplayMatching(bounds);
        const workArea = display.workArea;
        // Calculate new X (Anchor to right)
        let newX = bounds.x + bounds.width - width;
        // Calculate new Y (Anchor to top default)
        let newY = bounds.y;
        // Check if Y would go off-screen (Bottom overflow)
        if (newY + height > workArea.y + workArea.height) {
            // Anchor to Bottom-Right instead
            newY = bounds.y + bounds.height - height;
        }
        // Clamp to screen (Safety)
        if (newX < workArea.x)
            newX = workArea.x;
        if (newY < workArea.y)
            newY = workArea.y;
        win.setBounds({
            x: newX,
            y: newY,
            width: width,
            height: height
        }, true); // animate: true (Windows support limited)
    });
    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
    }
    else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(process.env.DIST || '', 'index.html'));
    }
}
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
app.whenReady().then(createWindow);
