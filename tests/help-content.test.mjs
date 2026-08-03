import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
let server,content,ui;
before(async()=>{server=await createServer({server:{middlewareMode:true},appType:"custom",logLevel:"silent"});content=await server.ssrLoadModule("/src/v2/help-content.ts");ui=await server.ssrLoadModule("/src/v2/onboarding.tsx")});after(async()=>server?.close());
test("Templates and Inspiration Help includes every required task-oriented article",()=>{const titles=content.HELP_ARTICLES.map(x=>x.title);for(const title of["What are Space templates?","Choosing a Space type","Starter categories","Starter Quests","Creating a Blank Space","What are Quest templates?","Choosing a Quest template","Changing a Quest template","Template-specific details","Inspiration suggestions","Seasonal Inspiration","Editing starter content","Deleting starter content","Existing Spaces and Quests","Template privacy","Replay templates & Inspiration"])assert.ok(titles.includes(title),title)});
test("existing Help topics remain available",()=>{const titles=content.HELP_ARTICLES.map(x=>x.title);for(const title of["What is a Space?","Reactions","Comments","Plan","Map","Memories","Journey","Custom categories","Custom reactions","What are Quest Types?","How Collections work"])assert.ok(titles.includes(title),title)});
test("related guides resolve to real articles",()=>{for(const article of content.HELP_ARTICLES)for(const id of article.related||[])assert.ok(content.helpArticle(id),`${article.id} -> ${id}`)});
test("Help renders accessible expandable articles and replay controls",()=>{const markup=renderToStaticMarkup(React.createElement(ui.HelpLearn,{onClose(){},onReplay(){},onReplayTips(){}}));assert.match(markup,/Help &amp; Learn/);assert.match(markup,/Replay What&#x27;s New/);assert.match(markup,/Replay templates &amp; Inspiration/);assert.match(markup,/details/);assert.match(markup,/Related guides/)});

test("Help card copy keeps an unconstrained content column", async () => {
  const css = await readFile("src/v2/onboarding.css", "utf8");
  assert.match(css, /\.help-grid summary > span:first-child/);
  assert.match(css, /summary>span:last-child\{width:auto;height:auto;min-width:0/);
  assert.doesNotMatch(css, /\.help-grid summary span \{/);
});