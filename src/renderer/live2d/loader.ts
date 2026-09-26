import { Application, ShaderSystem, Ticker } from "pixi.js";
import { install } from "@pixi/unsafe-eval";
import type { Cubism4InternalModel } from "pixi-live2d-display/cubism4";
import type { CodexState } from "../../codex/state";
import {
  defaultModelConfig,
  isModelConfig,
  type ModelConfig,
} from "../../config/model-config";

// Use interpreted shader uniform handling under our restrictive CSP.
install({ ShaderSystem });

const coreUrl = new URL("./live2dcubismcore.min.js", document.baseURI);
const modelUrl = new URL("./model/model3.json", document.baseURI);
const configUrl = new URL("./model/pet-config.json", document.baseURI);

export interface Live2DPetController {
  setState(state: CodexState): Promise<void>;
}

async function loadModelConfig(): Promise<ModelConfig> {
  try {
    const response = await fetch(configUrl.href);
    if (!response.ok) return defaultModelConfig;
    const config: unknown = await response.json();
    return isModelConfig(config) ? config : defaultModelConfig;
  } catch {
    return defaultModelConfig;
  }
}

function loadScript(url: URL): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url.href;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Cubism Core is missing from models/"));
    document.head.append(script);
  });
}

export async function loadLive2D(
  canvas: HTMLCanvasElement,
): Promise<Live2DPetController | null> {
  const response = await fetch(modelUrl.href);
  if (!response.ok) return null;
  const settings: unknown = await response.json().catch(() => null);
  if (
    !settings ||
    typeof settings !== "object" ||
    !("FileReferences" in settings)
  )
    return null;

  await loadScript(coreUrl);
  const config = await loadModelConfig();
  // The plugin checks for Cubism Core when the module is evaluated.
  const { Live2DModel } = await import("pixi-live2d-display/cubism4");
  Live2DModel.registerTicker(Ticker);

  const app = new Application({
    view: canvas,
    width: 320,
    height: 420,
    backgroundAlpha: 0,
    antialias: true,
    autoStart: true,
  });

  try {
    const model = await Live2DModel.from(modelUrl.href, {
      autoInteract: false,
      autoUpdate: false,
    });
    const cubismModel = (model.internalModel as Cubism4InternalModel).coreModel;
    const core = cubismModel.getModel() as ReturnType<
      typeof cubismModel.getModel
    > & {
      getRenderOrders?: () => Int32Array;
      offscreens?: { count: number };
    };
    if (core.offscreens?.count) {
      model.destroy();
      throw new Error("This model uses unsupported Cubism offscreen effects");
    }
    // Core 5 r.5 moved render order data from drawables to the model.
    // Classic models can still use the Cubism 4 renderer via this accessor.
    if (!core.drawables.renderOrders && core.getRenderOrders) {
      cubismModel.getDrawableRenderOrders = () => core.getRenderOrders!();
    }
    model.autoUpdate = true;
    const scale = Math.min(280 / model.width, 380 / model.height);
    model.scale.set(scale);
    model.anchor.set(0.5, 1);
    model.position.set(160, 410);
    app.stage.addChild(model);
    let currentState: CodexState | undefined;
    return {
      async setState(state: CodexState): Promise<void> {
        if (state === currentState) return;
        currentState = state;
        const reaction = config[state];
        const actions: Promise<boolean>[] = [];
        if (reaction.motion) actions.push(model.motion(reaction.motion));
        if (reaction.expression)
          actions.push(model.expression(reaction.expression));
        await Promise.allSettled(actions);
      },
    };
  } catch (error) {
    app.destroy(true);
    throw error;
  }
}
