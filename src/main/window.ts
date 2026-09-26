import { app, BrowserWindow, screen } from "electron";
import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

type Position = { x: number; y: number };

function positionFile(): string {
  return join(app.getPath("userData"), "window-position.json");
}

function savedPosition(): Position | undefined {
  try {
    const value: unknown = JSON.parse(readFileSync(positionFile(), "utf8"));
    if (!value || typeof value !== "object") return undefined;
    const { x, y } = value as Record<string, unknown>;
    if (typeof x !== "number" || typeof y !== "number") return undefined;
    const visible = screen
      .getAllDisplays()
      .some(
        ({ workArea }) =>
          x < workArea.x + workArea.width &&
          x + 320 > workArea.x &&
          y < workArea.y + workArea.height &&
          y + 420 > workArea.y,
      );
    return visible ? { x, y } : undefined;
  } catch {
    return undefined;
  }
}

export function createPetWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 320,
    height: 420,
    ...savedPosition(),
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, "../preload/preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  window.setAlwaysOnTop(true, "floating");
  window.on("moved", () => {
    const [x, y] = window.getPosition();
    writeFileSync(positionFile(), JSON.stringify({ x, y }));
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    const html = join(__dirname, "../renderer/index.html");
    if (existsSync(html)) void window.loadFile(html);
  }

  return window;
}
