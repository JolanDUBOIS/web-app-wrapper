const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let BASE_URL = "__URL__"; // placeholder to be replaced by generate.js

// File to store last window bounds
const boundsFile = path.join(app.getPath('userData'), 'window-bounds.json');
let lastBounds = { width: 1200, height: 800 };

// Load bounds from disk
try {
  if (fs.existsSync(boundsFile)) {
    lastBounds = JSON.parse(fs.readFileSync(boundsFile, 'utf-8'));
  }
} catch (err) {
  console.error('Failed to read window bounds:', err);
}

// Save bounds to disk
function saveBounds(bounds) {
  lastBounds = bounds;
  try {
    fs.writeFileSync(boundsFile, JSON.stringify(lastBounds, null, 2));
  } catch (err) {
    console.error('Failed to save window bounds:', err);
  }
}

// Create a new BrowserWindow
function createWindow(url = BASE_URL) {
  const win = new BrowserWindow({
    x: lastBounds.x ?? undefined,
    y: lastBounds.y ?? undefined,
    width: lastBounds.width,
    height: lastBounds.height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,          // needed for OAuth / login flows
      nativeWindowOpen: true,  // allows popups in app
    },
    frame: true,               // KDE native title bar
  });

  win.setMenu(null);

  // Save bounds on move, resize, close
  const saveCurrentBounds = () => saveBounds(win.getBounds());
  win.on('resize', saveCurrentBounds);
  win.on('move', saveCurrentBounds);
  win.on('close', saveCurrentBounds);

  // Handle new windows (internal vs external links)
  win.webContents.setWindowOpenHandler(({ url: newUrl }) => {
    if (newUrl.startsWith(BASE_URL)) {
      return { action: 'allow' };
    }
    shell.openExternal(newUrl);
    return { action: 'deny' };
  });

  // Prevent navigation to external URLs in current window
  win.webContents.on('will-navigate', (event, navUrl) => {
    if (!navUrl.startsWith(BASE_URL)) {
      event.preventDefault();
      shell.openExternal(navUrl);
    }
  });

  win.loadURL(url);

  return win;
}

// --- App ready ---
app.whenReady().then(() => {
  createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', () => app.quit());
