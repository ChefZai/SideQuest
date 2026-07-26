import { useEffect, useMemo, useRef, type RefObject } from "react";
import { X } from "lucide-react";
import { INSPIRATION_CATALOG } from "../features/templates/inspirationCatalog";
import type { IdeaTemplateId, InspirationSuggestion } from "../features/templates/templateTypes";
import type { Space } from "./domain";
import type { InspirationFilterId } from "./inspirationFilters";
import { chooseSurpriseSuggestion, orderInspirationIntents, type InspirationIntentId } from "./inspirationIntents";

const RECENT_INTENTS_KEY="sidequest:inspiration-intents";
const LAST_SURPRISE_KEY="sidequest:last-surprise";
function recentIntents():InspirationIntentId[]{try{const value=JSON.parse(sessionStorage.getItem(RECENT_INTENTS_KEY)||"[]");return Array.isArray(value)?value:[]}catch{return[]}}
function rememberIntent(id:InspirationIntentId){try{sessionStorage.setItem(RECENT_INTENTS_KEY,JSON.stringify([id,...recentIntents().filter(value=>value!==id)].slice(0,3)))}catch{/* Session context is optional. */}}

export function InspirationLauncher({space,recentIdeaTemplateIds,onClose,onExplore,onSelect,returnFocusRef}:{space:Space;recentIdeaTemplateIds:readonly IdeaTemplateId[];onClose:()=>void;onExplore:(filter:InspirationFilterId)=>void;onSelect:(suggestion:InspirationSuggestion)=>void;returnFocusRef:RefObject<HTMLButtonElement|null>}){
  const dialog=useRef<HTMLDivElement>(null);
  const intents=useMemo(()=>orderInspirationIntents({spaceTemplateId:space.templateId,categories:space.categories,recentIntentIds:recentIntents(),recentIdeaTemplateIds}),[space.templateId,space.categories,recentIdeaTemplateIds]);
  useEffect(()=>{
    const previousHtmlOverflow=document.documentElement.style.overflow,previousBodyOverflow=document.body.style.overflow;
    const content=document.querySelector<HTMLElement>(".content"),previousContentOverflow=content?.style.overflow||"";
    document.documentElement.style.overflow="hidden";document.body.style.overflow="hidden";if(content)content.style.overflow="hidden";
    const frame=requestAnimationFrame(()=>dialog.current?.querySelector<HTMLElement>("button")?.focus());
    const keydown=(event:KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();onClose();return}if(event.key!=="Tab"||!dialog.current)return;const focusable=[...dialog.current.querySelectorAll<HTMLElement>('button:not([disabled]),[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(element=>element.offsetParent!==null);if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}};
    document.addEventListener("keydown",keydown);
    return()=>{cancelAnimationFrame(frame);document.removeEventListener("keydown",keydown);document.documentElement.style.overflow=previousHtmlOverflow;document.body.style.overflow=previousBodyOverflow;if(content)content.style.overflow=previousContentOverflow;requestAnimationFrame(()=>returnFocusRef.current?.focus())};
  },[onClose,returnFocusRef]);
  const choose=(id:InspirationIntentId,filter:InspirationFilterId|null)=>{rememberIntent(id);if(id==="surprise"){let last:string|null=null;try{last=sessionStorage.getItem(LAST_SURPRISE_KEY)}catch{/* Optional. */}const suggestion=chooseSurpriseSuggestion(INSPIRATION_CATALOG,space.templateId,last);try{sessionStorage.setItem(LAST_SURPRISE_KEY,suggestion.id)}catch{/* Optional. */}onSelect(suggestion);return}if(filter)onExplore(filter)};
  return <div className="inspiration-launcher-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <div ref={dialog} className="inspiration-launcher" role="dialog" aria-modal="true" aria-labelledby="inspiration-launcher-title" aria-describedby="inspiration-launcher-description">
      <div className="inspiration-sheet-handle" aria-hidden="true"/>
      <header><div><p className="eyebrow">{space.emoji} A direction for {space.name}</p><h2 id="inspiration-launcher-title">What are you looking for today?</h2><p id="inspiration-launcher-description">Choose a feeling. We’ll gather a few possibilities from there.</p></div><button type="button" className="icon" aria-label="Close Inspiration" onClick={onClose}><X/></button></header>
      <div className="inspiration-intents" role="list" aria-label="Inspiration intents">{intents.map(intent=><button type="button" role="listitem" key={intent.id} className={intent.id==="surprise"?"inspiration-intent surprise":"inspiration-intent"} aria-label={`${intent.label}. ${intent.helper}`} onClick={()=>choose(intent.id,intent.filter)}><span aria-hidden="true">{intent.emoji}</span><div><b>{intent.label}</b><small>{intent.helper}</small></div></button>)}</div>
    </div>
  </div>;
}