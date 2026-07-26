import { lazy, Suspense, useRef, useState } from "react";
import { ArrowRight, Lightbulb, Sparkles } from "lucide-react";
import type { IdeaTemplateId, InspirationSuggestion } from "../features/templates/templateTypes";
import type { Space } from "./domain";
import type { InspirationFilterId } from "./inspirationFilters";
import "./inspiration.css";

const InspirationLauncher=lazy(()=>import("./InspirationLauncher").then(module=>({default:module.InspirationLauncher})));

export function InspirationShelf({space,recentIdeaTemplateIds,onExplore,onSelect}:{space:Space;recentIdeaTemplateIds:readonly IdeaTemplateId[];onExplore:(filter:InspirationFilterId)=>void;onSelect:(suggestion:InspirationSuggestion)=>void}){
  const[open,setOpen]=useState(false);
  const trigger=useRef<HTMLButtonElement>(null);
  const close=()=>setOpen(false);
  return <section className="inspiration-entry" aria-labelledby="inspiration-entry-title">
    <div className="inspiration-entry-art" aria-hidden="true"><Lightbulb/><Sparkles/></div>
    <div className="inspiration-entry-copy"><p className="eyebrow">A little nudge, when you want one</p><h2 id="inspiration-entry-title">Need inspiration?</h2><p>Discover something worth planning.</p><small>Ideas picked to feel at home in {space.emoji} {space.name}.</small></div>
    <button ref={trigger} type="button" className="primary inspiration-entry-action" onClick={()=>setOpen(true)}>Get Inspired <ArrowRight aria-hidden="true"/></button>
    {open&&<Suspense fallback={<div className="inspiration-launcher-loading" role="status">Gathering possibilities…</div>}><InspirationLauncher space={space} recentIdeaTemplateIds={recentIdeaTemplateIds} onClose={close} onExplore={filter=>{close();onExplore(filter)}} onSelect={suggestion=>{close();onSelect(suggestion)}} returnFocusRef={trigger}/></Suspense>}
  </section>;
}