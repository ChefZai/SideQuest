import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let server;
let catalog;
let data;
let types;
let packs;

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  catalog = await server.ssrLoadModule("/src/features/templates/starterIdeas.ts");
  data = await server.ssrLoadModule("/src/v2/starter-idea-data.ts");
  types = await server.ssrLoadModule("/src/features/templates/templateTypes.ts");
  packs = await server.ssrLoadModule("/src/features/templates/categoryPacks.ts");
});

after(async () => server?.close());

test("each relevant Space template has four to six editable starter Ideas", () => {
  for (const templateId of types.SPACE_TEMPLATE_IDS.filter(id => id !== "blank")) {
    const ideas = catalog.getStarterIdeas(templateId);
    assert.ok(ideas.length >= 4 && ideas.length <= 6, `${templateId}: ${ideas.length}`);
    assert.equal(new Set(ideas.map(idea => idea.id)).size, ideas.length);
    assert.ok(ideas.every(idea => types.IDEA_TEMPLATE_IDS.includes(idea.templateId)));
    assert.ok(ideas.every(idea => catalog.starterCategory(packs.getCategoryPack(templateId), idea)));
  }
});

test("Blank Space receives no starter Ideas", () => {
  assert.deepEqual(catalog.getStarterIdeas("blank"), []);
});

test("starter document IDs are deterministic and safe", () => {
  const first = catalog.starterIdeaDocumentId("space/unsafe", "new restaurant");
  const retry = catalog.starterIdeaDocumentId("space/unsafe", "new restaurant");
  assert.equal(first, retry);
  assert.doesNotMatch(first, /[ /]/);
});

test("retry reports existing documents instead of duplicates", async () => {
  const idea = catalog.getStarterIdeas("couple")[0];
  const input = { spaceId: "space-one", profile: {}, categories: [], idea };
  const seen = new Set();
  const writer = async value => {
    const id = catalog.starterIdeaDocumentId(value.spaceId, value.idea.id);
    if (seen.has(id)) return "existing";
    seen.add(id);
    return "created";
  };
  const first = await data.applyStarterIdeas([input], writer);
  const retry = await data.applyStarterIdeas([input], writer);
  assert.equal(first.created.length, 1);
  assert.equal(retry.existing.length, 1);
  assert.equal(seen.size, 1);
});

test("partial failures are reported without hiding successful Ideas", async () => {
  const ideas = catalog.getStarterIdeas("friends").slice(0, 3);
  const inputs = ideas.map(idea => ({ spaceId: "space-two", profile: {}, categories: [], idea }));
  const result = await data.applyStarterIdeas(inputs, async input => {
    if (input.idea.id === ideas[1].id) throw new Error("network unavailable");
    return "created";
  });
  assert.equal(result.created.length, 2);
  assert.equal(result.failed.length, 1);
  assert.equal(result.failed[0].title, ideas[1].title);
});

test("starter toggle defaults on only for incomplete first-run profiles", () => {
  assert.equal(catalog.shouldDefaultStarterIdeas({ onboarding: { completed: false } }), true);
  assert.equal(catalog.shouldDefaultStarterIdeas({ onboarding: { completed: true } }), false);
});
