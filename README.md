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

## Connect Codex activity

The pet uses [supported Codex lifecycle hooks](https://developers.openai.com/codex/hooks) rather than reading Codex's internal databases. Install the user-level hooks:

```sh
npm run setup:codex
```

Then open `/hooks` in Codex, review the hook definitions, and trust them. Start a new Codex task after trusting the hooks. The pet maps lifecycle events to five normalized states:

| Codex event                               | Pet state |
| ----------------------------------------- | --------- |
| Session starts or a turn is interrupted   | `idle`    |
| User submits a prompt or Codex uses tools | `working` |
| Codex requests permission                 | `waiting` |
| A turn stops                              | `done`    |
| A supported tool reports failure          | `error`   |

The hook writes only the state, session id, turn id, and timestamp under `~/.codex-live2d-pet/`. It does not copy prompts, responses, or tool arguments.

## Models and licenses

No character models or proprietary Cubism Core files are included. To try a model locally:

1. Download the Cubism SDK for Web from [Live2D](https://www.live2d.com/en/sdk/download/web/) after reviewing its license. Copy `live2dcubismcore.min.js` into `models/`.
2. Put a compatible Cubism 3/4 model in `models/model/`, with its entry file named `model3.json`. Keep its textures, motions, and expressions in their original relative locations.
3. Run `npm run dev`. The app loads the model and plays its configured idle motion, if present.

To customize reactions, add `models/model/pet-config.json`:

```json
{
  "idle": { "motion": "Idle" },
  "working": { "motion": "Idle", "expression": "F06" },
  "waiting": { "expression": "F05" },
  "done": { "motion": "TapBody", "expression": "F03" },
  "error": { "expression": "F08" }
}
```

Validated locally with the official Haru sample and Cubism SDK for Web 5 r.5 Core using a hidden Electron window: model loading, transparent output, and changing animation frames passed. The renderer targets classic Cubism 3/4 models; models using newer offscreen effects are not supported. Downloaded SDK and sample folders are excluded from Git. Local assets are copied into `out/renderer` when building, so review model and SDK licenses before distributing that build.

The `models/` folder is ignored by Git. Only use models you have the right to use; do not commit or redistribute third-party model files without their owner's permission. This repository's code license does not grant rights to any external model or Cubism Core.
