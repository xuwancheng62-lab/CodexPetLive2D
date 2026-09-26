# Codex Live2D Pet

Code is licensed under the [MIT License](LICENSE). External models and Cubism Core retain their own licenses.

A macOS desktop companion designed to react to Codex activity. This repository is in early development.

## Current status

The Electron prototype shows a transparent, always-on-top, draggable pet. It loads a Cubism 3/4 model when local assets are present and otherwise displays a placeholder. Codex activity detection is planned next. See [project plan](Codex-Live2D-Pet-PROJECT.md).

## Run locally

Requires macOS and Node.js 22 or later.

```sh
npm install
npm run dev
```

Use `npm run typecheck`, `npm run lint`, and `npm run build` to check the project.

## Models and licenses

No character models or proprietary Cubism Core files are included. To try a model locally:

1. Download the Cubism SDK for Web from [Live2D](https://www.live2d.com/en/sdk/download/web/) after reviewing its license. Copy `live2dcubismcore.min.js` into `models/`.
2. Put a compatible Cubism 3/4 model in `models/model/`, with its entry file named `model3.json`. Keep its textures, motions, and expressions in their original relative locations.
3. Run `npm run dev`. The app loads the model and plays its configured idle motion, if present.

The `models/` folder is ignored by Git. Only use models you have the right to use; do not commit or redistribute third-party model files without their owner's permission. This repository's code license does not grant rights to any external model or Cubism Core.
