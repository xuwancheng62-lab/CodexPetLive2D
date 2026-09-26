import type { CodexState } from "../codex/state";

export interface ModelReaction {
  motion?: string;
  expression?: string;
}

export type ModelConfig = Record<CodexState, ModelReaction>;

// These names match the official Haru sample. Users can override every value
// with models/model/pet-config.json without changing application code.
export const defaultModelConfig: ModelConfig = {
  idle: { motion: "Idle" },
  working: { motion: "Idle", expression: "F06" },
  waiting: { expression: "F05" },
  done: { motion: "TapBody", expression: "F03" },
  error: { expression: "F08" },
};

export function isModelConfig(value: unknown): value is ModelConfig {
  if (!value || typeof value !== "object") return false;
  return ["idle", "working", "waiting", "done", "error"].every((state) => {
    const reaction = (value as Record<string, unknown>)[state];
    if (!reaction || typeof reaction !== "object") return false;
    const { motion, expression } = reaction as Record<string, unknown>;
    return (
      (motion === undefined || typeof motion === "string") &&
      (expression === undefined || typeof expression === "string")
    );
  });
}
