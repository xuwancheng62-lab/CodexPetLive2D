import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  watch,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { FSWatcher } from "node:fs";
import type { CodexState, CodexStateEvent } from "./state";
import { isCodexStateEvent } from "./state";

const DONE_DURATION_MS = 6_000;
const ERROR_DURATION_MS = 8_000;
const STALE_EVENT_MS = 30 * 60_000;

const priority: Record<CodexState, number> = {
  idle: 0,
  done: 1,
  error: 2,
  working: 3,
  waiting: 4,
};

export function codexStateDirectory(): string {
  return join(homedir(), ".codex-live2d-pet", "sessions");
}

function effectiveState(event: CodexStateEvent, now: number): CodexState {
  const age = now - Date.parse(event.updatedAt);
  if (age > STALE_EVENT_MS) return "idle";
  if (event.state === "done" && age > DONE_DURATION_MS) return "idle";
  if (event.state === "error" && age > ERROR_DURATION_MS) return "idle";
  return event.state;
}

export class CodexStateAdapter {
  private watcher?: FSWatcher;
  private timer?: NodeJS.Timeout;
  private listener?: (state: CodexState) => void;
  private currentState: CodexState = "idle";

  get state(): CodexState {
    return this.currentState;
  }

  start(listener: (state: CodexState) => void): void {
    this.listener = listener;
    const directory = codexStateDirectory();
    mkdirSync(directory, { recursive: true });
    this.watcher = watch(directory, () => this.refresh());
    this.timer = setInterval(() => this.refresh(), 1_000);
    this.refresh(true);
  }

  stop(): void {
    this.watcher?.close();
    if (this.timer) clearInterval(this.timer);
  }

  private refresh(force = false): void {
    const now = Date.now();
    const states: CodexState[] = [];
    const directory = codexStateDirectory();

    if (existsSync(directory)) {
      for (const name of readdirSync(directory)) {
        if (!name.endsWith(".json")) continue;
        try {
          const parsed: unknown = JSON.parse(
            readFileSync(join(directory, name), "utf8"),
          );
          if (isCodexStateEvent(parsed))
            states.push(effectiveState(parsed, now));
        } catch {
          // A hook may be replacing a file while the directory watcher fires.
        }
      }
    }

    const next = states.reduce<CodexState>(
      (best, state) => (priority[state] > priority[best] ? state : best),
      "idle",
    );
    if (force || next !== this.currentState) {
      this.currentState = next;
      this.listener?.(next);
    }
  }
}
