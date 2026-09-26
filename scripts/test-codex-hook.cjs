const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const directory = fs.mkdtempSync(path.join(os.tmpdir(), "codex-pet-hook-"));
const hook = path.join(__dirname, "codex-hook.cjs");
const stateFile = path.join(directory, "test-session.json");

function send(hook_event_name, extra = {}) {
  const result = spawnSync(process.execPath, [hook], {
    input: JSON.stringify({
      session_id: "test-session",
      turn_id: "turn-1",
      hook_event_name,
      prompt: "private prompt must not be stored",
      ...extra,
    }),
    encoding: "utf8",
    env: { ...process.env, CODEX_PET_STATE_DIR: directory },
  });
  assert.equal(result.status, 0, result.stderr);
}

function state() {
  return JSON.parse(fs.readFileSync(stateFile, "utf8"));
}

try {
  send("SessionStart");
  assert.equal(state().state, "idle");
  send("UserPromptSubmit");
  assert.equal(state().state, "working");
  assert.equal("prompt" in state(), false);
  send("PermissionRequest");
  assert.equal(state().state, "waiting");
  send("PostToolUse", { tool_response: { exit_code: 1 } });
  assert.equal(state().state, "error");
  send("Stop");
  assert.equal(state().state, "error");
  send("Interrupt");
  assert.equal(state().state, "idle");
  send("SessionEnd");
  assert.equal(fs.existsSync(stateFile), false);
  console.log("Codex hook state transitions passed");
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
