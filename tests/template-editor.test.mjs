import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server;
let form;
let editor;

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  form = await server.ssrLoadModule("/src/features/templates/templateForm.ts");
  editor = await server.ssrLoadModule("/src/v2/TemplateFieldsEditor.tsx");
});

after(async () => server?.close());

test("Restaurant fields sanitize and serialize through the shared form", () => {
  const result = form.validateTemplateForm("restaurant", { cuisine: "  Thai  ", priceRange: "$$", reservationLink: "https://example.test/book" });
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.data, { cuisine: "Thai", priceRange: "$$", reservationLink: "https://example.test/book" });
});

test("Movie, Trip, Hike, Event, and Gift numeric/list/date fields validate", () => {
  assert.equal(form.validateTemplateForm("movie", { runtimeMinutes: "120", releaseYear: "2026" }).errors.length, 0);
  assert.deepEqual(form.validateTemplateForm("trip", { potentialDates: "June, September", budgetGoal: "2400" }).data, { potentialDates: ["June", "September"], budgetGoal: 2400 });
  assert.equal(form.validateTemplateForm("hike", { distanceMiles: "5.5", elevationFeet: "1200" }).errors.length, 0);
  assert.equal(form.validateTemplateForm("event", { eventDate: "2026-08-15", eventTime: "19:30" }).errors.length, 0);
  assert.equal(form.validateTemplateForm("gift", { estimatedPrice: "75", deadline: "2026-12-01" }).errors.length, 0);
});

test("unsafe links and invalid numbers are rejected", () => {
  assert.match(form.validateTemplateForm("restaurant", { reservationLink: "javascript:alert(1)" }).errors[0].message, /http/);
  assert.match(form.validateTemplateForm("hike", { distanceMiles: "far" }).errors[0].message, /number/);
  assert.match(form.validateTemplateForm("event", { eventDate: "tomorrow" }).errors[0].message, /date/);
});

test("draft conversion preserves supported values for successful editing", () => {
  const draft = form.templateDataToDraft("trip", { destination: "Lisbon", activities: ["Tram", "Museum"], ignored: true });
  assert.deepEqual(draft, { destination: "Lisbon", activities: "Tram, Museum" });
});

test("shared editor renders primary and expandable secondary fields accessibly", () => {
  const markup = renderToStaticMarkup(React.createElement(editor.TemplateFieldsEditor, { templateId: "restaurant", draft: {}, errors: [], onChange() {}, onTemplateChange() {} }));
  assert.match(markup, /Cuisine/);
  assert.match(markup, /Price range/);
  assert.match(markup, /More details/);
  assert.match(markup, /Change Idea template/);
});

test("Custom retains the open-ended editor without irrelevant fields", () => {
  const markup = renderToStaticMarkup(React.createElement(editor.TemplateFieldsEditor, { templateId: "custom", draft: {}, errors: [], onChange() {}, onTemplateChange() {} }));
  assert.match(markup, /open-ended fields/);
  assert.doesNotMatch(markup, /Cuisine/);
});
