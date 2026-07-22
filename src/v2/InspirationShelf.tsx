import { lazy, Suspense, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Lightbulb } from "lucide-react";
import { INSPIRATION_CATALOG } from "../features/templates/inspirationCatalog";
import type { InspirationSuggestion } from "../features/templates/templateTypes";
import type { Space } from "./domain";
import { inspirationItems, INSPIRATION_FILTERS, type InspirationFilterId, templateEmoji, templateName } from "./inspirationFilters";
import "./inspiration.css";

const FullInspirationView=lazy(()=>import("./FullInspirationView").then(module=>({default:module.FullInspirationView})));
const SESSION_KEY="sidequest:inspiration-filter";
function initialFilter():InspirationFilterId{try{const value=sessionStorage.getItem(SESSION_KEY);return INSPIRATION_FILTERS.some(item=>item.id===value)?value as InspirationFilterId:"for-you"}catch{return"for-you"}}

export function InspirationShelf({space,profileId:_profileId,onSelect}:{space:Space;profileId:string;onSelect:(suggestion:InspirationSuggestion)=>void}){
  const[selected,setSelected]=useState<InspirationFilterId>(initialFilter);
  const[exploring,setExploring]=useState(false);
  const chips=useRef<HTMLDivElement>(null),cards=useRef<HTMLDivElement>(null),homeScroll=useRef(0);
  const choose=(id:InspirationFilterId)=>{setSelected(id);try{sessionStorage.setItem(SESSION_KEY,id)}catch{ /* Session persistence is optional. */ }};
  const moveChip=(event:React.KeyboardEvent<HTMLDivElement>)=>{if(event.key!=="ArrowLeft"&&event.key!=="ArrowRight")return;const buttons=[...(chips.current?.querySelectorAll<HTMLButtonElement>("button")||[])];const current=buttons.indexOf(document.activeElement as HTMLButtonElement);if(current<0)return;event.preventDefault();const next=buttons[(current+(event.key==="ArrowRight"?1:-1)+buttons.length)%buttons.length];next.focus();next.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"})};
  const explore=()=>{homeScroll.current=window.scrollY;setExploring(true)};
  const backHome=()=>{setExploring(false);requestAnimationFrame(()=>window.scrollTo({top:homeScroll.current}))};
  const preview=inspirationItems(INSPIRATION_CATALOG,selected,space.templateId).slice(0,5);
  if(exploring)return <Suspense fallback={<div className="deferred-loading">Gathering every possibility...</div>}><FullInspirationView space={space} profileId={_profileId} selected={selected} onSelected={choose} onBack={backHome} onSelect={onSelect}/></Suspense>;
  return <section className="inspiration inspiration-compact" aria-labelledby="inspiration-title">
    <header><div><p className="eyebrow">A place to begin</p><h2 id="inspiration-title">Need inspiration?</h2><p>Choose a category and discover something worth doing.</p></div><Lightbulb aria-hidden="true"/></header>
    <div ref={chips} className="inspiration-chips" role="tablist" aria-label="Choose an inspiration category" onKeyDown={moveChip}>{INSPIRATION_FILTERS.map(filter=><button type="button" role="tab" aria-selected={selected===filter.id} className={selected===filter.id?"active":""} key={filter.id} onClick={()=>choose(filter.id)}>{filter.label}</button>)}</div>
    <div className="inspiration-preview-head"><div><h3>{INSPIRATION_FILTERS.find(item=>item.id===selected)?.label}</h3><small>{selected==="for-you"?`Suggestions for your ${space.templateId||"blank"} Space`:"A few possibilities to make your own"}</small></div><div><button type="button" className="icon" aria-label="Previous inspiration" onClick={()=>cards.current?.scrollBy({left:-280,behavior:"smooth"})}><ArrowLeft/></button><button type="button" className="icon" aria-label="Next inspiration" onClick={()=>cards.current?.scrollBy({left:280,behavior:"smooth"})}><ArrowRight/></button></div></div>
    <div ref={cards} className="inspiration-preview" aria-live="polite">{preview.map(item=><button type="button" className="inspiration-card" key={item.id} onClick={()=>onSelect(item)} aria-label={`Start ${item.title} as a ${templateName(item.templateId)} Idea`}><span aria-hidden="true">{templateEmoji(item.templateId)}</span><div><small>{templateName(item.templateId)}</small><h4>{item.title}</h4><p>{item.description}</p><b>Use this Idea <ArrowRight aria-hidden="true"/></b></div></button>)}</div>
    <button type="button" className="secondary inspiration-explore-action" onClick={explore}>Explore all ideas <ArrowRight aria-hidden="true"/></button>
  </section>;
}