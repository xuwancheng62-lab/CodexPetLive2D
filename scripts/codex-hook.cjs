const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

function failed(response) {
  if (!response || typeof response !== "object") return false;
  if (response.isError === true) return true;
  if (typeof response.exit_code === "number" && response.exit_code !== 0)
    return true;
  if (typeof response.exitCode === "number" && response.exitCode !== 0)
    return true;
  if (["error", "failed"].includes(response.status)) return true;
  return Object.values(response).some((value) =>
    value && typeof value === "object" ? failed(value) : false,
  );
}

function stateFor(input, previous) {
  switch (input.hook_event_name) {
    case "UserPromptSubmit":
    case "PreToolUse":
      return "working";
    case "PermissionRequest":
      return "waiting";
    case "PostToolUse":
      return failed(input.tool_response) ? "error" : "working";
    case "Stop":
      return previous?.state === "error" ? "error" : "done";
    case "SessionStart":
    case "Interrupt":
      return "idle";
    default:
      return null;
  }
}

let payload = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (payload += chunk));
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(payload);
    const sessionId = String(input.session_id || "unknown");
    const safeId = sessionId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const directory =
      process.env.CODEX_PET_STATE_DIR ||
      path.join(os.homedir(), ".codex-live2d-pet", "sessions");
    const target = path.join(directory, `${safeId}.json`);

    if (input.hook_event_name === "SessionEnd") {
      try {
        fs.unlinkSync(target);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
      return;
    }

    let previous;
    try {
      previous = JSON.parse(fs.readFileSync(target, "utf8"));
    } catch {
      previous = undefined;
    }
    const state = stateFor(input, previous);
    if (!state) return;

    fs.mkdirSync(directory, { recursive: true });
    const event = {
      state,
      sessionId,
      ...(input.turn_id ? { turnId: String(input.turn_id) } : {}),
      updatedAt: new Date().toISOString(),
    };
    const temporary = `${target}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(event));
    fs.renameSync(temporary, target);
  } catch (error) {
    console.error(`Codex Live2D Pet hook: ${error.message}`);
    process.exitCode = 1;
  }
});
