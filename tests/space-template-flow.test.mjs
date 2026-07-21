import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { readFileSync } from "node:fs";

let server;
let flow;
let templateTypes;

const profile = {
  id: "owner-one",
  displayName: "Isaiah",
  email: "isaiah@example.test",
  photoUrl: null,
  onboarding: { started: false, step: "welcome", completed: true, dismissedTips: [] },
};

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  flow = await server.ssrLoadModule("/src/v2/SpaceTemplateCreator.tsx");
  templateTypes = await server.ssrLoadModule("/src/features/templates/templateTypes.ts");
});

after(async () => server?.close());

test("template picker presents every accessible Space choice", () => {
  const markup = renderToStaticMarkup(React.createElement(flow.SpaceTemplateCreator, { profile, onSaved() {} }));
  assert.match(markup, /What kind of adventures are you planning together/);
  assert.equal((markup.match(/role="radio"/g) || []).length, templateTypes.SPACE_TEMPLATE_IDS.length);
  assert.match(markup, /Couple/);
  assert.match(markup, /Blank Space/);
  assert.match(markup, /aria-checked="false"/);
});

test("selecting templates preserves the name while changing safe defaults", () => {
  const original = { ...flow.initialSpaceTemplateDraft(), name: "Our Plans" };
  const travel = flow.selectSpaceTemplate(original, "travel");
  const blank = flow.selectSpaceTemplate(travel, "blank");
  assert.equal(travel.name, "Our Plans");
  assert.equal(travel.templateId, "travel");
  assert.ok(travel.categories.length > 0);
  assert.equal(blank.name, "Our Plans");
  assert.deepEqual(blank.categories, []);
});

test("final payload contains ownership and versioned template metadata", () => {
  const draft = {
    ...flow.selectSpaceTemplate(flow.initialSpaceTemplateDraft(), "couple"),
    name: "  Me & Zoe  ",
    inviteAfter: true,
  };
  const payload = flow.createSpaceTemplatePayload(draft, profile);
  assert.equal(payload.name, "Me & Zoe");
  assert.equal(payload.ownerId, profile.id);
  assert.deepEqual(payload.memberIds, [profile.id]);
  assert.equal(payload.templateId, "couple");
  assert.equal(payload.templateVersion, 1);
  assert.equal(payload.starterPackApplied, true);
});

test("Blank Space creates no automatic category pack", () => {
  const draft = { ...flow.selectSpaceTemplate(flow.initialSpaceTemplateDraft(), "blank"), name: "Anything" };
  const payload = flow.createSpaceTemplatePayload(draft, profile);
  assert.deepEqual(payload.categories, []);
  assert.equal(payload.templateId, "blank");
  assert.equal(payload.starterPackApplied, false);
});

test("onboarding Space creation uses one deterministic document ID", () => {
  const source = readFileSync(new URL("../src/v2/SpaceTemplateCreator.tsx", import.meta.url), "utf8");
  assert.match(source, /onboarding-\$\{profile\.id\}/);
});
