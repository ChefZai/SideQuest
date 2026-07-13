import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../src/v2/AppV2.tsx", import.meta.url);
const decoder = new TextDecoder("utf-8");
const cp1252 = new Map([
  [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84],
  [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88],
  [0x2030, 0x89], [0x0160, 0x8a], [0x2039, 0x8b], [0x0152, 0x8c],
  [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92], [0x201c, 0x93],
  [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b],
  [0x0153, 0x9c], [0x017e, 0x9e], [0x0178, 0x9f]
]);

function encodeWindows1252(text) {
  const bytes = [];
  for (const character of text) {
    const code = character.codePointAt(0);
    if (code <= 0xff) bytes.push(code);
    else if (cp1252.has(code)) bytes.push(cp1252.get(code));
    else return null;
  }
  return Uint8Array.from(bytes);
}

function repairSegment(segment) {
  let value = segment;
  for (let pass = 0; pass < 4; pass += 1) {
    const bytes = encodeWindows1252(value);
    if (!bytes) break;
    const decoded = decoder.decode(bytes);
    if (decoded.includes("\ufffd") || decoded === value) break;
    value = decoded;
  }
  return value;
}

let source = await readFile(file, "utf8");
source = source.replace(/[^\x00-\x7F]+/g, repairSegment);
await writeFile(file, source, "utf8");
