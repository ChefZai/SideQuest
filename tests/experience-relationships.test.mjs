import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";

let quests;
test.before(async () => {
  const result = await build({
    entryPoints: ["src/features/quests/questTypes.ts"],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
  });
  quests = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
});

test("legacy Quests gain safe empty relationship defaults", () => {
  const normalized = quests.normalizeQuestMetadata({ completed: false });
  assert.equal(normalized.parentQuestId, null);
  assert.deepEqual(normalized.relatedQuestIds, []);
});

test("Quest relationships are trimmed, deduplicated, and non-breaking", () => {
  const normalized = quests.normalizeQuestMetadata({
    completed: false,
    collectionId: " collection ",
    parentQuestId: " parent ",
    relatedQuestIds: ["one", " one ", "", 7, "two"],
  });
  assert.equal(normalized.collectionId, "collection");
  assert.equal(normalized.parentQuestId, "parent");
  assert.deepEqual(normalized.relatedQuestIds, ["one", "two"]);
});

