import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let server;
let packs;
let editor;
let templates;

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  packs = await server.ssrLoadModule("/src/features/templates/categoryPacks.ts");
  editor = await server.ssrLoadModule("/src/v2/CategoryPackEditor.tsx");
  templates = await server.ssrLoadModule("/src/features/templates/templateTypes.ts");
});

after(async () => server?.close());

test("each non-blank Space template has a stable starter pack", () => {
  for (const id of templates.SPACE_TEMPLATE_IDS.filter(value => value !== "blank")) {
    const categories = packs.getCategoryPack(id);
    assert.ok(categories.length >= 6, id);
    assert.equal(new Set(categories.map(category => category.id)).size, categories.length, id);
    assert.equal(editor.categoryPackIssue(categories), "", id);
  }
});

test("categories can be removed and renamed without changing stable IDs", () => {
  const original = packs.getCategoryPack("travel");
  const removed = editor.removeCategory(original, original[0].id);
  const renamed = editor.updateCategory(removed, removed[0].id, { label: "Ways to get there", emoji: "🚆" });
  assert.equal(removed.length, original.length - 1);
  assert.equal(renamed[0].id, removed[0].id);
  assert.equal(renamed[0].label, "Ways to get there");
  assert.equal(original[1].label, "Flights");
});

test("custom categories receive stable IDs and survive retry unchanged", () => {
  const original = packs.getCategoryPack("couple");
  const once = editor.addCustomCategory(original, "stable-id");
  const retrySnapshot = once.map(category => ({ ...category }));
  assert.equal(once.at(-1).id, "custom-stable-id");
  assert.deepEqual(retrySnapshot, once);
  assert.equal(new Set(once.map(category => category.id)).size, once.length);
});

test("duplicate labels are rejected case-insensitively", () => {
  const duplicate = [
    { id: "one", emoji: "✨", label: "Date Night", accent: "1,2,3" },
    { id: "two", emoji: "🌙", label: "date night", accent: "1,2,3" },
  ];
  assert.match(editor.categoryPackIssue(duplicate), /appears more than once/);
});

test("Blank Space receives no pack but accepts a custom category", () => {
  const blank = packs.getCategoryPack("blank");
  assert.deepEqual(blank, []);
  const custom = editor.addCustomCategory(blank, "blank-category");
  assert.equal(custom.length, 1);
  assert.equal(custom[0].id, "custom-blank-category");
});

test("applying the same template returns unique fresh data without accumulation", () => {
  const first = packs.getCategoryPack("friends");
  const retry = packs.getCategoryPack("friends");
  assert.deepEqual(first, retry);
  assert.notEqual(first, retry);
  assert.notEqual(first[0], retry[0]);
  assert.equal(new Set(retry.map(category => category.id)).size, retry.length);
});
