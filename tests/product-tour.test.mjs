import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server;
let tour;
let state;

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  tour = await server.ssrLoadModule("/src/v2/ProductUpdateTour.tsx");
  state = await server.ssrLoadModule("/src/v2/onboarding-state.ts");
});

after(async () => server?.close());

test("the editorial product tour is versioned separately from first-time onboarding", () => {
  assert.equal(state.CURRENT_PRODUCT_TOUR_VERSION, "v5_6_editorial");
  assert.equal(state.shouldShowProductTour({ started: true, step: "complete", completed: true, dismissedTips: [], version: 3 }), true);
  assert.equal(state.shouldShowProductTour({ started: true, step: "complete", completed: true, dismissedTips: [], version: 3, productTourVersion: "v5_6_editorial" }), false);
  assert.equal(state.shouldShowProductTour({ started: false, step: "welcome", completed: false, dismissedTips: [], version: 3 }), false);
});

test("product tour version survives normalization", () => {
  const value = state.normalizeOnboardingState({ started: true, step: "complete", completed: true, dismissedTips: ["map"], version: 3, productTourVersion: "v5_6_editorial" }, { started: false, step: "welcome", completed: false, dismissedTips: [] });
  assert.equal(value.productTourVersion, "v5_6_editorial");
  assert.deepEqual(value.dismissedTips, ["map"]);
});

test("new accounts are stamped so normal onboarding remains the only first-run experience", async () => {
  const auth = await readFile("src/services/auth.ts", "utf8");
  assert.match(auth, /NEW_USER_ONBOARDING[\s\S]*productTourVersion: CURRENT_PRODUCT_TOUR_VERSION/);
});

test("walkthrough opens as an accessible editorial full-screen experience", () => {
  const markup = renderToStaticMarkup(React.createElement(tour.ProductUpdateTour, { onComplete() {}, onSkip() {} }));
  assert.match(markup, /Welcome to the new SideQuest/);
  assert.match(markup, /Show me what&#x27;s new/);
  assert.match(markup, /aria-label="Page 1 of 8"/);
  assert.match(markup, /Previous page/);
  assert.match(markup, /Skip/);
  assert.match(markup, /future-overlook\.webp/);
});

test("all eight emotional chapters and Help replay integration remain present", async () => {
  const component = await readFile("src/v2/ProductUpdateTour.tsx", "utf8");
  const app = await readFile("src/v2/AppV2.tsx", "utf8");
  const help = await readFile("src/v2/onboarding.tsx", "utf8");
  for (const copy of ["Welcome to the new SideQuest", "Every story has a main character", "Progress that actually means something", "Your life is bigger than individual Quests", "Memories are no longer the ending", "Capture inspiration in seconds", "Built to feel calm", "Let's build a life worth remembering"]) assert.match(component, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(app, /shouldShowProductTour/);
  assert.match(app, /setReplayingProductTour\(true\)/);
  assert.match(help, /Replay What's New/);
});

test("responsive, motion, and touch-target safeguards cover required sizes", async () => {
  const css = await readFile("src/v2/product-tour.css", "utf8");
  assert.match(css, /@media\(max-width:900px\)/);
  assert.match(css, /@media\(max-width:600px\)/);
  assert.match(css, /@media\(max-width:390px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /min-height:44px/);
  assert.match(css, /overflow:hidden/);
});