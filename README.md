# Web App Wrapper (Linux)

A simple Electron wrapper to turn any website into a native-like Linux desktop app. The user can choose a URL, a name, and an icon, and the generator will create a ready-to-run app folder with a `.desktop` file.

---

## Installation & Setup

1. **Clone the repository**

```bash
git clone https://github.com/<your-username>/web-app-wrapper.git
cd web-app-wrapper
```

2. **Install generator dependencies**

```bash
npm install
```

3. **Run the generator**

```bash
node generate.js
```

or

```bash
chmod +x ./generate.js
./generate.js
```

You will be prompted to provide:
- **App name**
- **URL** of the website you want to wrap
- **Full path to an icon** (PNG)

The generator will create a folder inside `dist/<AppName>/` containing your app, `run.sh`, icon, and `.desktop` file.

## Running Your App

### From the terminal:

```bash
cd dist/<AppName>/
./run.sh
```
This launches your app directly.

### Installing system-wide (optional)

1. Move the app folder to a central location, e.g.:
```bash
sudo mv dist/<AppName>/ ~/Applications/webapps/<AppName>/
```
2. Move the .desktop file to your applications directory:
```bash
mv /Applications/webapps/<AppName>/<AppName>.desktop ~/.local/share/applications/
```
3. You can now launch your app from your application menu.

## Troubleshooting

### Fixing chrome-sandbox Permissions (Linux)

If you see an error related to `chrome-sandbox` when running your app, fix it manually:

```bash
cd /path/to/your/app/node_modules/electron/dist/
sudo chown root:root chrome-sandbox
sudo chmod 4755 chrome-sandbox
```

After that, the app should launch without issues.

### Icon Not Showing in Taskbar (KDE/Wayland)

If your app shows a blank or default icon, follow these steps:

**Step 1: Find the Correct Application ID (Window Class)**

1. Launch your nativefied web app.
2. Open **System Settings** → **Window Management** → **Window Rules**.
3. Click **Add New...** → **Detect Window Properties** → click the app window.
4. Copy the value under **Window Class (application)**.

    *Example:* whatsapp-nativefier-4054a10e.

**Step 2: Edit Your `.desktop` File**

1. Open the `.desktop` file in a text editor.
2. Ensure the `StartupWMClass` line contains the exact value from Step 1:
```ini
[Desktop Entry]
# ...
StartupNotify=true
StartupWMClass=whatsapp-nativefier-4054a10e
#^--- must match Step 1
```
3. Ensure the Icon path is absolute, pointing to the icon file inside your app folder:
```ini
Icon=/Applications/webapps/<AppName>/icon.png
```
4. Save the `.desktop` file.
5. Rename the `.desktop` file if necessary, e.g., to match your app name.

## Notes

- The generator automatically sets up a run.sh script for Wayland compatibility.
- OAuth/login flows open in external browser windows when required.
- Window bounds are preserved between launches.