import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let server;
let validation;
let templateTypes;
let spaces;
let ideas;
let categoryPacks;

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  validation = await server.ssrLoadModule("/src/features/templates/templateValidation.ts");
  templateTypes = await server.ssrLoadModule("/src/features/templates/templateTypes.ts");
  spaces = await server.ssrLoadModule("/src/features/templates/spaceTemplates.ts");
  ideas = await server.ssrLoadModule("/src/features/templates/ideaTemplates.ts");
  categoryPacks = await server.ssrLoadModule("/src/features/templates/categoryPacks.ts");
});

after(async () => server?.close());

test("existing untyped Spaces remain blank Spaces", () => {
  const timestamp = { toMillis: () => 123 };
  const existing = { id: "old-space", name: "Existing", updatedAt: timestamp };
  const normalized = validation.normalizeSpaceTemplateDocument(existing);
  assert.equal(validation.resolveSpaceTemplateId(existing), "blank");
  assert.equal(normalized.templateId, undefined);
  assert.equal(normalized.updatedAt, timestamp);
});

test("existing untyped Ideas remain custom Ideas", () => {
  const timestamp = { toMillis: () => 456 };
  const existing = { id: "old-idea", title: "Existing", createdAt: timestamp };
  const normalized = validation.normalizeIdeaTemplateDocument(existing);
  assert.equal(validation.resolveIdeaTemplateId(existing), "custom");
  assert.equal(normalized.templateId, undefined);
  assert.equal(normalized.createdAt, timestamp);
});

test("valid Space and Idea template metadata survive normalization", () => {
  const space = validation.deserializeSpaceTemplateMetadata({
    templateId: "travel", templateVersion: 1, accentTheme: "sky", starterPackApplied: true,
  });
  assert.deepEqual(space, { templateId: "travel", templateVersion: 1, accentTheme: "sky", starterPackApplied: true });

  const idea = validation.deserializeIdeaTemplateMetadata({
    templateId: "movie", templateVersion: 1,
    templateData: { genre: "Drama", runtimeMinutes: 118, streamingService: "Example", ignored: "remove me" },
  });
  assert.deepEqual(idea, {
    templateId: "movie", templateVersion: 1,
    templateData: { genre: "Drama", runtimeMinutes: 118, streamingService: "Example" },
  });
});

test("unknown template IDs fall back safely", () => {
  assert.equal(validation.resolveSpaceTemplateId({ templateId: "unknown", templateVersion: 1 }), "blank");
  assert.equal(validation.resolveIdeaTemplateId({ templateId: "unknown", templateVersion: 1 }), "custom");
  assert.equal(spaces.getSpaceTemplateDefinition("unknown").id, "blank");
  assert.equal(ideas.getIdeaTemplateDefinition("unknown").id, "custom");
});

test("malformed templateData is ignored or sanitized", () => {
  const malformed = validation.deserializeIdeaTemplateMetadata({
    templateId: "hike", templateVersion: 1,
    templateData: { trailName: 77, distanceMiles: Number.NaN, difficulty: "  Moderate\u0000  ", unknown: true },
  });
  assert.deepEqual(malformed.templateData, { difficulty: "Moderate" });
  assert.equal(validation.sanitizeTemplateData("movie", "not-an-object"), undefined);
  assert.equal(validation.sanitizeTemplateData("custom", { arbitrary: "not stored" }), undefined);
});

test("missing optional fields remain absent", () => {
  assert.deepEqual(validation.deserializeSpaceTemplateMetadata({}), {});
  assert.deepEqual(validation.deserializeIdeaTemplateMetadata({}), {});
});

test("unsupported versions fall back without crashing", () => {
  assert.deepEqual(validation.deserializeSpaceTemplateMetadata({ templateId: "couple", templateVersion: 99 }), {});
  assert.deepEqual(validation.deserializeIdeaTemplateMetadata({ templateId: "restaurant", templateVersion: 99, templateData: { cuisine: "Thai" } }), {});
});

test("serialization strips unknown fields and preserves supported values", () => {
  const source = {
    templateId: "restaurant",
    templateVersion: templateTypes.CURRENT_IDEA_TEMPLATE_VERSION,
    templateData: {
      cuisine: "  Ethiopian  ",
      priceRange: "$$",
      reservationLink: "https://example.com/book",
      topLevelTitle: "must not enter templateData",
    },
  };
  assert.deepEqual(validation.templateFieldsForFirestore(source), {
    templateId: "restaurant",
    templateVersion: 1,
    templateData: { cuisine: "Ethiopian", priceRange: "$$", reservationLink: "https://example.com/book" },
  });
});

test("template catalogs are complete, stable, and versioned", () => {
  assert.deepEqual(spaces.SPACE_TEMPLATE_DEFINITIONS.map(item => item.id), [...templateTypes.SPACE_TEMPLATE_IDS]);
  assert.deepEqual(ideas.IDEA_TEMPLATE_DEFINITIONS.map(item => item.id), [...templateTypes.IDEA_TEMPLATE_IDS]);
  assert.ok(spaces.SPACE_TEMPLATE_DEFINITIONS.every(item => item.version === 1));
  assert.ok(ideas.IDEA_TEMPLATE_DEFINITIONS.every(item => item.version === 1));
});

test("category packs use stable IDs and return defensive copies", () => {
  for (const templateId of templateTypes.SPACE_TEMPLATE_IDS.filter(id => id !== "blank")) {
    const values = categoryPacks.getCategoryPack(templateId);
    assert.ok(values.length > 0, templateId);
    assert.equal(new Set(values.map(value => value.id)).size, values.length, templateId);
  }
  assert.deepEqual(categoryPacks.getCategoryPack("blank"), []);
  const first = categoryPacks.getCategoryPack("couple");
  first[0].label = "Changed locally";
  assert.notEqual(categoryPacks.getCategoryPack("couple")[0].label, "Changed locally");
});
