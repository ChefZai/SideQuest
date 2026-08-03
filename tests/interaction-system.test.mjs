import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const load=path=>readFile(path,"utf8");

test("Version 5.7 owns one centralized motion vocabulary",async()=>{
  const [main,css,release]=await Promise.all([load("src/main.tsx"),load("src/v2/interaction-system.css"),load("src/config/release.ts")]);
  assert.ok(main.indexOf("interaction-system.css")>main.indexOf("product-tour.css"));
  for(const token of["--motion-instant:120ms","--motion-quick:150ms","--motion-standard:230ms","--motion-page:330ms","--ease-out"])assert.ok(css.includes(token),token);
  assert.match(release,/version: "5.7"/);
  assert.match(release,/Living Interactions/);
});

test("motion system covers hero, cards, navigation feedback, loading, and empty states",async()=>{
  const css=await load("src/v2/interaction-system.css");
  for(const behavior of[".hero-quest>div>small",".living-card",":active",".busy:before",".deferred-loading:before",".journey-empty",".celebration","::view-transition-group"])assert.ok(css.includes(behavior),behavior);
  assert.match(css,/sq-shimmer/);
  assert.match(css,/sq-memory-bloom/);
  assert.doesNotMatch(css,/confetti|audio|sound/i);
});

test("reduced motion preserves immediate state changes without transforms",async()=>{
  const css=await load("src/v2/interaction-system.css");
  const reduced=css.slice(css.indexOf("@media(prefers-reduced-motion:reduce)"));
  assert.match(reduced,/animation-duration:.001ms!important/);
  assert.match(reduced,/transition-duration:.001ms!important/);
  assert.match(reduced,/transform:none!important/);
});

test("Quest navigation uses shared element continuity with a safe fallback",async()=>{
  const [transitions,card,home,app]=await Promise.all([load("src/platform/viewTransitions.ts"),load("src/v2/IdeaCard.tsx"),load("src/v2/HomeQuestSections.tsx"),load("src/v2/AppV2.tsx")]);
  assert.match(transitions,/prefersReducedMotion/);
  assert.match(transitions,/document.startViewTransition/);
  assert.match(transitions,/update\(\)/);
  assert.match(card,/questTransitionName\(idea.id\)/);
  assert.match(home,/questTransitionName\(hero.id\)/);
  assert.match(app,/transitionView\(\(\)=>setSelected/);
  assert.match(app,/questTransitionName\(idea.id\)/);
});

test("future-native haptics are abstracted and never gate product behavior",async()=>{
  const [feedback,journey,app]=await Promise.all([load("src/platform/feedback.ts"),load("src/v2/JourneyTimeline.tsx"),load("src/v2/AppV2.tsx")]);
  assert.match(feedback,/registerHapticAdapter/);
  assert.match(feedback,/hapticAdapter\?\.impact/);
  assert.match(feedback,/result instanceof Promise/);
  assert.match(feedback,/Feedback must never interrupt/);
  assert.match(journey,/signalFeedback\("milestone"\)/);
  assert.match(app,/signalFeedback\("save"\)/);
  assert.match(app,/signalFeedback\("memory"\)/);
});

test("Milestone completion exposes pending and success feedback accessibly",async()=>{
  const journey=await load("src/v2/JourneyTimeline.tsx");
  assert.match(journey,/completingMilestone/);
  assert.match(journey,/aria-busy=/);
  assert.match(journey,/Remembering…/);
  assert.match(journey,/finally\{setCompletingMilestone\(""\)\}/);
});
