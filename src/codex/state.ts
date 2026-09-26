export type CodexState = "idle" | "working" | "waiting" | "done" | "error";

export interface CodexStateEvent {
  state: CodexState;
  sessionId: string;
  turnId?: string;
  updatedAt: string;
}

export function isCodexState(value: unknown): value is CodexState {
  return ["idle", "working", "waiting", "done", "error"].includes(
    value as string,
  );
}

export function isCodexStateEvent(value: unknown): value is CodexStateEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Record<string, unknown>;
  return (
    isCodexState(event.state) &&
    typeof event.sessionId === "string" &&
    typeof event.updatedAt === "string" &&
    !Number.isNaN(Date.parse(event.updatedAt))
  );
}
