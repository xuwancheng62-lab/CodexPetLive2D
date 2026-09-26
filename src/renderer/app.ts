import "./style.css";
import { loadLive2D } from "./live2d/loader";
import type { CodexState } from "../codex/state";

const canvas = document.querySelector<HTMLCanvasElement>("#live2d")!;
const placeholder = document.querySelector<HTMLElement>("#placeholder")!;
const status = document.querySelector<HTMLElement>("#status")!;

const labels: Record<CodexState, string> = {
  idle: "Codex is idle",
  working: "Codex is working",
  waiting: "Codex needs you",
  done: "Codex finished",
  error: "Codex hit an error",
};

void loadLive2D(canvas).then(
  async (pet) => {
    if (pet) {
      placeholder.hidden = true;
      const update = (state: CodexState) => {
        document.body.dataset.codexState = state;
        status.textContent = labels[state];
        void pet.setState(state);
      };
      update(await window.petApi.getCodexState());
      window.petApi.onCodexState(update);
    } else {
      status.textContent = "Add a model to models/model/";
    }
  },
  (error: unknown) => {
    status.textContent =
      error instanceof Error ? error.message : "Could not load Live2D model";
    console.error("Live2D load failed", error);
  },
);
