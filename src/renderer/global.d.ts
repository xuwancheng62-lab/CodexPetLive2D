import type { CodexState } from "../codex/state";

declare global {
  interface Window {
    petApi: {
      getCodexState: () => Promise<CodexState>;
      onCodexState: (listener: (state: CodexState) => void) => () => void;
    };
  }
}

export {};
