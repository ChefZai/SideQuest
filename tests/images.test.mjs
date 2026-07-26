import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

let server;
let images;

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  images = await server.ssrLoadModule("/src/v2/images.ts");
});

after(async () => server?.close());

test("small valid images are processed at their natural size", () => {
  assert.deepEqual(images.compressionDimensions(320, 240), [320]);
  assert.deepEqual(images.compressionDimensions(48, 48), [48]);
});

test("large images step down to the safe compression floor", () => {
  const dimensions = images.compressionDimensions(4000, 3000);
  assert.equal(dimensions[0], 1600);
  assert.equal(dimensions.at(-1), 640);
  assert.ok(dimensions.every((value, index) => index === 0 || value <= dimensions[index - 1]));
});

test("invalid dimensions do not enter the compression loop", () => {
  assert.deepEqual(images.compressionDimensions(0, 0), []);
  assert.deepEqual(images.compressionDimensions(Number.NaN, 100), []);
});