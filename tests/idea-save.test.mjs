import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";

let server;
let save;

const validInput = overrides => ({
  spaceId: "space-one",
  title: "  Sunset picnic  ",
  description: "",
  category: "Date Night",
  categoryEmoji: "\u2728",
  accent: "20,181,155",
  location: "",
  tags: [],
  price: "",
  duration: "",
  photoUrl: "",
  createdBy: "owner",
  createdByName: "Owner",
  completed: false,
  completionRequestedBy: [],
  completedAt: null,
  ...overrides,
});

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  save = await server.ssrLoadModule("/src/v2/idea-save.ts");
});

after(async () => server?.close());

test("sanitizer trims required fields and removes undefined recursively", () => {
  const clean = save.sanitizeIdeaCreateInput(validInput({
    optional: undefined,
    templateData: { cuisine: "Italian", empty: undefined, invalid: Number.NaN },
  }));
  assert.equal(clean.title, "Sunset picnic");
  assert.equal("optional" in clean, false);
  assert.deepEqual(clean.templateData, { cuisine: "Italian" });
});

test("sanitizer rejects missing Space, title, creator, and category", () => {
  for (const patch of [{ spaceId: "" }, { title: " " }, { createdBy: "" }, { category: "" }]) {
    assert.throws(() => save.sanitizeIdeaCreateInput(validInput(patch)), save.IdeaSaveError);
  }
});

test("text-only save writes exactly one deterministic Idea", async () => {
  const writes = new Map();
  const result = await save.runIdeaCreate({
    id: "idea-one",
    input: validInput(),
    file: null,
    upload: async () => assert.fail("upload should not run"),
    write: async (input, id) => {
      writes.set(id, input);
      return { id };
    },
    cleanup: async () => undefined,
  });
  assert.equal(result.id, "idea-one");
  assert.equal(writes.size, 1);
  assert.equal(writes.get("idea-one").photoUrl, "");
});

test("retry reuses the same document ID instead of creating a duplicate", async () => {
  const writes = new Map();
  const operation = () => save.runIdeaCreate({
    id: "stable-idea",
    input: validInput(),
    file: null,
    upload: async () => "",
    write: async (input, id) => {
      writes.set(id, input);
      return { id };
    },
    cleanup: async () => undefined,
  });
  await operation();
  await operation();
  assert.equal(writes.size, 1);
});

test("image save uploads before writing and returns the saved URL", async () => {
  const order = [];
  const result = await save.runIdeaCreate({
    id: "image-idea",
    input: validInput(),
    file: { name: "photo.jpg" },
    upload: async () => {
      order.push("upload");
      return "https://example.test/photo.jpg";
    },
    write: async (input, id) => {
      order.push("write");
      assert.equal(input.photoUrl, "https://example.test/photo.jpg");
      return { id };
    },
    cleanup: async () => undefined,
  });
  assert.deepEqual(order, ["upload", "write"]);
  assert.equal(result.photoUrl, "https://example.test/photo.jpg");
});

test("Storage rejection never attempts the Firestore write", async () => {
  let wrote = false;
  await assert.rejects(save.runIdeaCreate({
    id: "failed-upload",
    input: validInput(),
    file: { name: "photo.jpg" },
    upload: async () => { throw new Error("storage unavailable"); },
    write: async () => {
      wrote = true;
      return { id: "failed-upload" };
    },
    cleanup: async () => undefined,
  }), error => error.stage === "image");
  assert.equal(wrote, false);
});

test("Firestore rejection cleans up an uploaded image", async () => {
  const removed = [];
  await assert.rejects(save.runIdeaCreate({
    id: "failed-write",
    input: validInput(),
    file: { name: "photo.jpg" },
    upload: async () => "https://example.test/orphan.jpg",
    write: async () => { throw new Error("permission denied"); },
    cleanup: async url => { removed.push(url); },
  }), error => error.stage === "write");
  assert.deepEqual(removed, ["https://example.test/orphan.jpg"]);
});

test("permission and offline failures use safe actionable copy", () => {
  const denied = new save.IdeaSaveError("write", "fallback", { code: "permission-denied" });
  assert.match(save.ideaSaveMessage(denied, true), /permission/i);
  assert.match(save.ideaSaveMessage(denied, false), /offline/i);
});

test("editor has a synchronous duplicate-submit guard and finally cleanup", async () => {
  const source = await readFile("src/v2/AppV2.tsx", "utf8");
  const editor = source.slice(source.indexOf("function IdeaEditor("), source.indexOf("function IdeaView("));
  assert.match(editor, /if\(submitting\.current\)return/);
  assert.match(editor, /submitting\.current=true/);
  assert.match(editor, /finally\{submitting\.current=false;setBusy\(false\);setProgress\(0\)\}/);
  assert.match(editor, /onSaved\?\.\(id\);if\(!onboarding\)onClose\(\)/);
});

test("failed saves preserve the mounted editor and do not navigate", async () => {
  const source = await readFile("src/v2/AppV2.tsx", "utf8");
  const editor = source.slice(source.indexOf("function IdeaEditor("), source.indexOf("function IdeaView("));
  const submit = editor.slice(editor.indexOf("const submit=async"), editor.indexOf(";return <form"));
  const catchBlock = submit.slice(submit.indexOf("catch(x){"), submit.indexOf("finally{"));
  assert.match(catchBlock, /setError\(/);
  assert.doesNotMatch(catchBlock, /onClose\(\)|onSaved/);
});
