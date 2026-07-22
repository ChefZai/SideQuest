import { ArrowLeft } from "lucide-react";
import { INSPIRATION_CATALOG } from "../features/templates/inspirationCatalog";
import type { InspirationSuggestion } from "../features/templates/templateTypes";
import type { Space } from "./domain";
import { inspirationItems, INSPIRATION_FILTERS, type InspirationFilterId, templateEmoji, templateName } from "./inspirationFilters";
import { SeasonalInspiration } from "./SeasonalInspiration";

export function FullInspirationView({space,profileId,selected,onSelected,onBack,onSelect}:{space:Space;profileId:string;selected:InspirationFilterId;onSelected:(id:InspirationFilterId)=>void;onBack:()=>void;onSelect:(item:InspirationSuggestion)=>void}){
  const items=inspirationItems(INSPIRATION_CATALOG,selected,space.templateId);
  return <section className="inspiration-explore" aria-labelledby="explore-inspiration-title">
    <header><button type="button" className="secondary" onClick={onBack}><ArrowLeft aria-hidden="true"/>Back to Home</button><div><p className="eyebrow">Explore possibilities</p><h2 id="explore-inspiration-title">All inspiration</h2><p>Choose a direction, then make any Idea completely yours.</p></div></header>
    <div className="inspiration-chips" role="tablist" aria-label="Inspiration categories">
      {INSPIRATION_FILTERS.map(filter=><button key={filter.id} role="tab" aria-selected={selected===filter.id} className={selected===filter.id?"active":""} onClick={()=>onSelected(filter.id)}>{filter.label}</button>)}
    </div>
    {selected==="seasonal"&&<SeasonalInspiration profileId={profileId} onSelect={onSelect}/>}
    <div className="inspiration-full-grid">{items.map(item=><button type="button" className="inspiration-card" key={item.id} onClick={()=>onSelect(item)} aria-label={`Start ${item.title} as a ${templateName(item.templateId)} Idea`}><span aria-hidden="true">{templateEmoji(item.templateId)}</span><div><small>{templateName(item.templateId)}</small><h3>{item.title}</h3><p>{item.description}</p><b>Use this Idea</b></div></button>)}</div>
  </section>;
}
