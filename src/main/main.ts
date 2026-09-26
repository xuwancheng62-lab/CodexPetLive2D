import { app, BrowserWindow, ipcMain } from "electron";
import { createPetWindow } from "./window";
import { CodexStateAdapter } from "../codex/adapter";

app.setName("Codex Live2D Pet");
const codex = new CodexStateAdapter();

function openPetWindow(): BrowserWindow {
  const window = createPetWindow();
  window.webContents.on("did-finish-load", () => {
    window.webContents.send("codex-state", codex.state);
  });
  return window;
}

app.whenReady().then(() => {
  ipcMain.handle("codex-state:get", () => codex.state);
  codex.start((state) => {
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send("codex-state", state);
    }
  });
  openPetWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) openPetWindow();
  });
});

app.on("before-quit", () => codex.stop());

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
