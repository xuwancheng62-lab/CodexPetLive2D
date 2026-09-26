import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(projectRoot, "integrations", "codex", "hooks.json");
const target = join(homedir(), ".codex", "hooks.json");
const hookScript = join(projectRoot, "scripts", "codex-hook.cjs");
const command = `node ${JSON.stringify(hookScript)}`;
const incoming = JSON.parse(readFileSync(source, "utf8"));

for (const groups of Object.values(incoming.hooks)) {
  for (const group of groups) {
    for (const hook of group.hooks) hook.command = command;
  }
}

let existing = { hooks: {} };
if (existsSync(target)) {
  existing = JSON.parse(readFileSync(target, "utf8"));
  copyFileSync(target, `${target}.backup`);
}
existing.hooks ??= {};

for (const [event, groups] of Object.entries(incoming.hooks)) {
  const current = Array.isArray(existing.hooks[event])
    ? existing.hooks[event]
    : [];
  existing.hooks[event] = [
    ...current.filter(
      (group) =>
        !group?.hooks?.some((hook) =>
          String(hook.command || "").includes("scripts/codex-hook.cjs"),
        ),
    ),
    ...groups,
  ];
}

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, `${JSON.stringify(existing, null, 2)}\n`);
console.log(`Installed Codex Live2D Pet hooks in ${target}`);
console.log("Open /hooks in Codex, review the definitions, and trust them.");
