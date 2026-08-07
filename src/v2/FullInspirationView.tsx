import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react";
import { INSPIRATION_CATALOG } from "../features/templates/inspirationCatalog";
import type { InspirationSuggestion } from "../features/templates/templateTypes";
import type { Space } from "./domain";
import { inspirationItems, INSPIRATION_FILTERS, type InspirationFilterId, templateEmoji, templateName } from "./inspirationFilters";
import { SeasonalInspiration } from "./SeasonalInspiration";

export function FullInspirationView({space,profileId,selected,onSelected,onBack,onSelect}:{space:Space;profileId:string;selected:InspirationFilterId;onSelected:(id:InspirationFilterId)=>void;onBack:()=>void;onSelect:(item:InspirationSuggestion)=>void}){
  const [visibleCount,setVisibleCount]=useState(8);
  useEffect(()=>setVisibleCount(8),[selected]);
  const items=inspirationItems(INSPIRATION_CATALOG,selected,space.templateId),featured=items[0],rest=items.slice(1),visible=rest.slice(0,visibleCount);
  const selectedLabel=INSPIRATION_FILTERS.find(filter=>filter.id===selected)?.label||"For You";
  return <section className="inspiration-explore editorial-inspiration" aria-labelledby="explore-inspiration-title">
    <header><button type="button" className="secondary inspiration-back" onClick={onBack}><ArrowLeft aria-hidden="true"/>Home</button><div><p className="eyebrow">A little possibility goes a long way</p><h2 id="explore-inspiration-title">What might your life hold next?</h2><p>Browse slowly. Keep only the possibilities that make you feel something.</p></div></header>
    <nav className="inspiration-chips" role="tablist" aria-label="Inspiration categories">
      {INSPIRATION_FILTERS.map(filter=><button key={filter.id} role="tab" aria-selected={selected===filter.id} className={selected===filter.id?"active":""} onClick={()=>onSelected(filter.id)}>{filter.label}</button>)}
    </nav>
    {selected==="seasonal"&&<SeasonalInspiration profileId={profileId} onSelect={onSelect}/>}
    {featured&&<button type="button" className="inspiration-feature" onClick={()=>onSelect(featured)} aria-label={`Start ${featured.title} as a ${templateName(featured.templateId)} Quest`}><span className="inspiration-feature-art" aria-hidden="true">{templateEmoji(featured.templateId)}</span><div><small>{selectedLabel} · {templateName(featured.templateId)}</small><h3>{featured.title}</h3><p>{featured.description}</p><b>Make this yours <ArrowUpRight aria-hidden="true"/></b></div></button>}
    {rest.length>0&&<section className="inspiration-collection" aria-labelledby="inspiration-collection-title"><header><div><p className="eyebrow">More to wonder about</p><h3 id="inspiration-collection-title">{selectedLabel}</h3></div><Sparkles aria-hidden="true"/></header><div className="inspiration-full-grid editorial-grid">{visible.map((item,index)=><button type="button" className={`inspiration-card inspiration-card-${index%4}`} key={item.id} onClick={()=>onSelect(item)} aria-label={`Start ${item.title} as a ${templateName(item.templateId)} Quest`}><span className="inspiration-card-art" aria-hidden="true">{templateEmoji(item.templateId)}</span><div><small>{templateName(item.templateId)}</small><h3>{item.title}</h3><p>{item.description}</p><b>Explore <ArrowUpRight aria-hidden="true"/></b></div></button>)}</div>{visibleCount<rest.length&&<button type="button" className="secondary inspiration-load-more" onClick={()=>setVisibleCount(count=>Math.min(count+8,rest.length))}>Load more possibilities</button>}</section>}
    {!featured&&<div className="empty inspiration-empty"><span aria-hidden="true">✨</span><h3>Another possibility will find you.</h3><p>Try a different direction or return when inspiration strikes.</p></div>}
  </section>;
}
