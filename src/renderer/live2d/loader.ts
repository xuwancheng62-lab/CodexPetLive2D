import { Application, Ticker } from "pixi.js";
import { Live2DModel } from "pixi-live2d-display/cubism4";

const coreUrl = new URL("./live2dcubismcore.min.js", document.baseURI);
const modelUrl = new URL("./model/model3.json", document.baseURI);

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

export async function loadLive2D(canvas: HTMLCanvasElement): Promise<boolean> {
  const response = await fetch(modelUrl.href);
  if (!response.ok) return false;
  const settings: unknown = await response.json().catch(() => null);
  if (
    !settings ||
    typeof settings !== "object" ||
    !("FileReferences" in settings)
  )
    return false;

  await loadScript(coreUrl);
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
    });
    const scale = Math.min(280 / model.width, 380 / model.height);
    model.scale.set(scale);
    model.anchor.set(0.5, 1);
    model.position.set(160, 410);
    app.stage.addChild(model);
    return true;
  } catch (error) {
    app.destroy(true);
    throw error;
  }
}
