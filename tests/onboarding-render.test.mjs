import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let server;
let ui;

const space = {
  id: "space-one",
  name: "Summer Ideas",
  emoji: "☀️",
  type: "Together",
  ownerId: "owner",
  adminIds: [],
  memberIds: ["owner"],
  memberNames: { owner: "Isaiah" },
  categories: [],
  reactionDefs: [],
  deletedAt: null,
  purgeAfter: null,
};

before(async () => {
  server = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent",
  });
  ui = await server.ssrLoadModule("/src/v2/onboarding.tsx");
});

after(async () => {
  await server?.close();
});

const render = element => renderToStaticMarkup(element);

test("ordinary and invited Welcome states explain the product", () => {
  const ordinary = render(React.createElement(ui.OnboardingWelcome, {
    name: "Isaiah",
    invited: false,
    onStart() {},
  }));
  assert.match(ordinary, /Save ideas without pressure/);
  assert.match(ordinary, /Start your first Space/);

  const invited = render(React.createElement(ui.OnboardingWelcome, {
    name: "Maya",
    invited: true,
    onStart() {},
  }));
  assert.match(invited, /invitation will stay with you/i);
  assert.match(invited, /Join the Space/);
});

test("Space setup stays concise and visual", () => {
  const markup = render(React.createElement(ui.OnboardingSpaceIntro));
  assert.match(markup, /private place for ideas/i);
  assert.match(markup, /Me &amp; Zoe/);
  assert.match(markup, /Solo Adventures/);
});

test("invite and solo paths are both available", () => {
  const markup = render(React.createElement(ui.OnboardingInviteChoice, {
    space,
    onInvite() {},
    onAlone() {},
  }));
  assert.match(markup, /Invite someone/);
  assert.match(markup, /Continue alone/);
});

test("invited members can add or react to shared Ideas", () => {
  const markup = render(React.createElement(ui.OnboardingJoined, {
    space,
    onContinue() {},
    onExplore() {},
  }));
  assert.match(markup, /You joined Summer Ideas/);
  assert.match(markup, /Save your first Idea/);
  assert.match(markup, /Explore shared Ideas/);
});

test("first-Idea success and contextual education render accessibly", () => {
  const success = render(React.createElement(ui.OnboardingSuccess, {
    replaying: false,
    onDone() {},
  }));
  assert.match(success, /That’s your first possibility/);
  assert.match(success, /No planning pressure required/);

  for (const tip of Object.keys(ui.TIP_COPY)) {
    const markup = render(React.createElement(ui.ContextTip, {
      tip,
      onDismiss() {},
    }));
    assert.match(markup, /aria-label="SideQuest tip"/);
    assert.match(markup, /aria-label="Dismiss tip"/);
  }
});

test("Help can replay onboarding and contextual tips", () => {
  const markup = render(React.createElement(ui.HelpLearn, {
    onClose() {},
    onReplay() {},
    onReplayTips() {},
  }));
  assert.match(markup, /Take the first-run guide again/);
  assert.match(markup, /Replay contextual tips/);
  assert.match(markup, /Help &amp; Learn/);
});