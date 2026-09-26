import "./style.css";
import { loadLive2D } from "./live2d/loader";

const canvas = document.querySelector<HTMLCanvasElement>("#live2d")!;
const placeholder = document.querySelector<HTMLElement>("#placeholder")!;
const status = document.querySelector<HTMLElement>("#status")!;

void loadLive2D(canvas).then(
  (loaded) => {
    if (loaded) {
      placeholder.hidden = true;
      status.textContent = "Drag me around";
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
