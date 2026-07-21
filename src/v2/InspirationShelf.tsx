import { ArrowRight, Lightbulb } from "lucide-react";
import { INSPIRATION_SECTIONS, suggestionsForSection, type InspirationSectionId } from "../features/templates/inspirationCatalog";
import type { InspirationSuggestion } from "../features/templates/templateTypes";
import type { Space } from "./domain";
import { SeasonalInspiration } from "./SeasonalInspiration";
import "./inspiration.css";

const LABELS:Record<InspirationSectionId,string>={popular:"Popular", "for-this-space":"For this Space", "rainy-day":"Rainy Day", "weekend-adventure":"Weekend Adventure", "date-night":"Date Night", "budget-friendly":"Budget Friendly", "at-home":"At Home", outdoors:"Outdoors", "food-drinks":"Food & Drinks", "bucket-list":"Bucket List"};
export function InspirationShelf({space,profileId,onSelect}:{space:Space;profileId:string;onSelect:(suggestion:InspirationSuggestion)=>void}){
  const sections=INSPIRATION_SECTIONS.map(id=>({id,items:suggestionsForSection(id,space.templateId)})).filter(section=>section.items.length);
  return <section className="inspiration" aria-labelledby="inspiration-title"><header><div><p className="eyebrow">A place to begin</p><h2 id="inspiration-title">Never start from a blank page</h2><p>Evergreen prompts—not personal recommendations. Nothing is saved until you choose.</p></div><Lightbulb aria-hidden="true"/></header><SeasonalInspiration profileId={profileId} onSelect={onSelect}/>{sections.map(section=><section className="inspiration-row" key={section.id} aria-labelledby={`inspiration-${section.id}`}><div className="inspiration-row-title"><h3 id={`inspiration-${section.id}`}>{LABELS[section.id]}</h3><small>{section.id==="for-this-space"?`Based only on the ${space.templateId||"blank"} Space type`:"Ideas you can make your own"}</small></div><div className="inspiration-scroll">{section.items.map(item=><button type="button" className="inspiration-card" key={item.id} onClick={()=>onSelect(item)}><span aria-hidden="true">{item.templateId==="restaurant"?"🍽️":item.templateId==="hike"?"🥾":item.templateId==="movie"?"🎬":item.templateId==="trip"?"✈️":item.templateId==="coffee"?"☕":"✨"}</span><div><h4>{item.title}</h4><p>{item.description}</p><small>Open and edit <ArrowRight aria-hidden="true"/></small></div></button>)}</div></section>)}</section>
}
