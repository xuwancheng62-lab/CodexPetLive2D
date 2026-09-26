import { contextBridge, ipcRenderer } from "electron";
import type { CodexState } from "../codex/state";

contextBridge.exposeInMainWorld("petApi", {
  getCodexState: (): Promise<CodexState> =>
    ipcRenderer.invoke("codex-state:get"),
  onCodexState: (listener: (state: CodexState) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: CodexState) =>
      listener(state);
    ipcRenderer.on("codex-state", handler);
    return () => ipcRenderer.removeListener("codex-state", handler);
  },
});
