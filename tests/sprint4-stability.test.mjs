import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { transform } from "esbuild";

async function load(entry) {
  const source = await readFile(entry, "utf8");
  const result = await transform(source, { loader: "ts", format: "esm" });
  return import(`data:text/javascript;base64,${Buffer.from(result.code).toString("base64")}`);
}

test("legacy Memories tolerate missing arrays and member metadata", async () => {
  const { memoryStoryReadiness } = await load("src/features/stories/storyReadiness.ts");
  const result = memoryStoryReadiness({ id: "legacy", title: "Old Quest" }, {}, undefined, {});
  assert.equal(result.coverPhoto, "");
  assert.equal(result.photoLabel, "0 photos");
  assert.equal(result.reflectionLabel, "0 reflections");
  assert.match(result.peopleLabel, /People can be added/);
});

test("latest-operation and pending guards reject stale and duplicate work", async () => {
  const { latestOperation, pendingGuard } = await load("src/platform/asyncSafety.ts");
  const latest = latestOperation();
  const first = latest.begin();
  const second = latest.begin();
  assert.equal(latest.isLatest(first), false);
  assert.equal(latest.isLatest(second), true);
  latest.cancel();
  assert.equal(latest.isLatest(second), false);
  const guard = pendingGuard();
  assert.equal(guard.enter(), true);
  assert.equal(guard.enter(), false);
  guard.leave();
  assert.equal(guard.enter(), true);
});

test("diagnostics classify failures without serializing private content", async () => {
  const { classifyDiagnostic } = await load("src/platform/diagnostics.ts");
  assert.equal(classifyDiagnostic("quests", "save", { code: "permission-denied", privateDraft: "never log" }).category, "permission");
  assert.equal(classifyDiagnostic("uploads", "photo", new Error("Operation timed out")).category, "timeout");
  assert.equal(JSON.stringify(classifyDiagnostic("quests", "save", { code: "permission-denied", privateDraft: "never log" })).includes("never log"), false);
});

test("Space restoration ignores stale and deleted selections", async () => {
  globalThis.localStorage = { values: new Map(), getItem(key) { return this.values.get(key) ?? null; }, setItem(key, value) { this.values.set(key, value); }, removeItem(key) { this.values.delete(key); } };
  const { resolveAccessibleSpaceId, rememberSpaceId, restoredSpaceId } = await load("src/v2/space-restoration.ts");
  const spaces = [{ id: "available" }, { id: "deleted", deletedAt: {} }];
  rememberSpaceId("qa", "available");
  assert.equal(restoredSpaceId("qa"), "available");
  assert.equal(resolveAccessibleSpaceId(spaces, "missing", "available"), "available");
  assert.equal(resolveAccessibleSpaceId(spaces, "deleted", "missing"), "available");
});

test("runtime safeguards remain wired into the authenticated application", async () => {
  const [main, data, css, transitions] = await Promise.all([
    readFile("src/main.tsx", "utf8"),
    readFile("src/v2/data.ts", "utf8"),
    readFile("src/v2/ux-simplification.css", "utf8"),
    readFile("src/platform/viewTransitions.ts", "utf8"),
  ]);
  assert.match(main, /AppErrorBoundary/);
  assert.match(data, /where\("spaceId","==",spaceId\)/);
  assert.doesNotMatch(data, /where\("spaceId","in",spaceIds/);
  assert.match(data, /pendingPlanCreation/);
  assert.match(data, /pendingMemoryCreation/);
  assert.match(transitions, /transition\.finished\.catch/);
  assert.match(css, /\.stars button\{min-width:44px\}/);
});

test("QA fixtures are explicitly emulator-only and deterministic", async () => {
  const [fixture, environment, docs] = await Promise.all([
    readFile("scripts/qa-fixtures.mjs", "utf8"),
    readFile(".env.qa", "utf8"),
    readFile("docs/AUTHENTICATED_QA.md", "utf8"),
  ]);
  assert.match(fixture, /connectAuthEmulator/);
  assert.match(fixture, /127\.0\.0\.1/);
  assert.match(fixture, /QA Populated/);
  assert.match(fixture, /QA Edge Cases/);
  assert.match(environment, /VITE_QA_EMULATORS=true/);
  assert.match(docs, /qa:reset/);
});

test("image and upload work fail explicitly instead of waiting forever", async () => {
  const [images, data, card, resilient] = await Promise.all([
    readFile("src/v2/images.ts", "utf8"),
    readFile("src/v2/data.ts", "utf8"),
    readFile("src/v2/IdeaCard.tsx", "utf8"),
    readFile("src/v2/ResilientImage.tsx", "utf8"),
  ]);
  assert.match(images, /HEIC photo cannot be prepared/);
  assert.match(images, /25_000_000/);
  assert.match(images, /source\.close/);
  assert.match(data, /Image upload timed out/);
  assert.match(data, /Finishing image upload/);
  assert.match(card, /loading="lazy"/);
  assert.match(card, /sizes=/);
  assert.match(resilient, /state === "failed"/);
});

test("starter Quest idempotency uses an authorized Space-scoped query", async () => {
  const source = await readFile("src/v2/starter-idea-data.ts", "utf8");
  assert.match(source, /where\("spaceId", "==", spaceId\)/);
  assert.match(source, /where\("starterId", "==", idea\.id\)/);
  assert.match(source, /starterIdeaDocumentId/);
  assert.doesNotMatch(source, /transaction\.get/);
});
