import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import { createServer } from "vite";

let server;
let focus;
before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
  focus = await server.ssrLoadModule("/src/features/product-focus/productFocus.ts");
});
after(async () => server?.close());

const idea = (patch = {}) => ({
  id: "quest", spaceId: "space", title: "Sunset picnic", category: "Together",
  categoryEmoji: "✨", accent: "", description: "", location: "", tags: [],
  price: "", duration: "", photoUrl: "", createdBy: "owner", createdByName: "Isaiah",
  completed: false, ...patch,
});
const space = { id: "space", name: "Us", emoji: "✨", ownerId: "owner", memberIds: ["owner", "friend"], reactionDefs: [
  { type: "love", emoji: "❤️", label: "Love this" },
  { type: "maybe", emoji: "🤔", label: "Maybe" },
] };

test("Quick Capture uses backward-compatible additive defaults", () => {
  assert.deepEqual(focus.QUICK_CAPTURE_DEFAULTS, { questType: "experience", status: "inspired" });
  assert.equal(focus.normalizeCaptureInput({ url: " https://example.com " }).sourceType, "url");
  assert.equal(focus.normalizeCaptureInput({ title: " Sunset picnic " }).title, "Sunset picnic");
});

test("simplified lifecycle preserves detailed statuses", () => {
  assert.equal(focus.deriveQuestLifecycle(idea({ status: "inspired" })), "saved");
  assert.equal(focus.deriveQuestLifecycle(idea({ status: "inspired" }), space), "shared");
  assert.equal(focus.deriveQuestLifecycle(idea({ status: "planning" }), space), "making-it-happen");
  assert.equal(focus.deriveQuestLifecycle(idea({ status: "paused" }), space), "making-it-happen");
  assert.equal(focus.deriveQuestLifecycle(idea({ completed: true }), space), "remembered");
});

test("mutual interest needs two distinct positive participants", () => {
  assert.equal(focus.mutualInterest([{ userId: "owner", type: "love" }], space.reactionDefs), false);
  assert.equal(focus.mutualInterest([{ userId: "owner", type: "love" }, { userId: "owner", type: "love" }], space.reactionDefs), false);
  assert.equal(focus.mutualInterest([{ userId: "owner", type: "love" }, { userId: "friend", type: "love" }], space.reactionDefs), true);
  assert.equal(focus.mutualInterest([{ userId: "owner", type: "maybe" }, { userId: "friend", type: "maybe" }], space.reactionDefs), false);
});

test("Home prioritizes shared, mutually exciting, and active Quests", () => {
  const quests = [
    idea({ id: "shared", createdBy: "friend" }),
    idea({ id: "mutual" }),
    idea({ id: "active", status: "in-progress" }),
    idea({ id: "memory", completed: true }),
  ];
  const events = [
    { id: "a", action: "reaction-added", actorId: "owner", questId: "mutual", targetId: "mutual" },
    { id: "b", action: "reaction-added", actorId: "friend", questId: "mutual", targetId: "mutual" },
  ];
  const result = focus.meaningfulHomeSections(quests, events, "owner");
  assert.equal(result.sharedWithYou[0].id, "shared");
  assert.equal(result.sharedExcitement[0].id, "mutual");
  assert.ok(result.becomingReal.some(item => item.id === "active"));
  assert.equal(result.memory.id, "memory");
});

test("analytics vocabulary follows the Constitution without private payloads", () => {
  assert.equal(focus.PRODUCT_ANALYTICS_EVENTS.captureStarted, "Quick Capture Started");
  assert.equal(focus.PRODUCT_ANALYTICS_EVENTS.mutualInterest, "Mutual Interest Detected");
});
