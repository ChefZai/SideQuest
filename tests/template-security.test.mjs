import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let server;
let validation;
let forms;
let inspiration;

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  validation = await server.ssrLoadModule("/src/features/templates/templateValidation.ts");
  forms = await server.ssrLoadModule("/src/features/templates/templateForm.ts");
  inspiration = await server.ssrLoadModule("/src/features/templates/inspirationCatalog.ts");
});

after(async () => server?.close());

test("unsafe external URL schemes are rejected", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,bad", "file:///secret", "ftp://example.test/file"]) assert.equal(forms.isSafeExternalUrl(url), false);
  assert.equal(forms.isSafeExternalUrl("https://example.test/book"), true);
  assert.equal(forms.isSafeExternalUrl("http://example.test/menu"), true);
});

test("malformed and unknown template data cannot escape validation", () => {
  assert.deepEqual(validation.deserializeIdeaTemplateMetadata({templateId:"restaurant",templateVersion:1,templateData:{cuisine:"Thai\u0000",reservationLink:{unsafe:true},injected:"private"}}),{templateId:"restaurant",templateVersion:1,templateData:{cuisine:"Thai"}});
  assert.deepEqual(validation.deserializeIdeaTemplateMetadata({templateId:"unknown",templateVersion:1,templateData:{title:"private"}}),{});
});

test("static Inspiration contains no private account or invitation fields", () => {
  const serialized=JSON.stringify(inspiration.INSPIRATION_CATALOG).toLowerCase();
  for(const forbidden of ["email","invitecode","memberids","comment","photourl","createdby"]) assert.equal(serialized.includes(forbidden),false,forbidden);
});