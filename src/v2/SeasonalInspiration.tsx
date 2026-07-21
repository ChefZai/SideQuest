import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { seasonForDate, suggestionsForSeason, type Season } from "../features/templates/seasonalCatalog";
import type { InspirationSuggestion } from "../features/templates/templateTypes";
import "./seasonal-inspiration.css";

const SEASONS:readonly Season[]=["spring","summer","fall","winter"];
const labels:Record<Season,string>={spring:"Spring",summer:"Summer",fall:"Fall",winter:"Winter"};
const key=(profileId:string,part:string)=>`sidequest:${profileId}:seasonal:${part}`;
export function SeasonalInspiration({profileId,onSelect}:{profileId:string;onSelect:(item:InspirationSuggestion)=>void}){
  const[season,setSeason]=useState<Season>(()=>{const saved=localStorage.getItem(key(profileId,"season"));return SEASONS.includes(saved as Season)?saved as Season:seasonForDate()});
  const[hidden,setHidden]=useState(()=>localStorage.getItem(key(profileId,"hidden"))==="true");
  useEffect(()=>localStorage.setItem(key(profileId,"season"),season),[profileId,season]);
  useEffect(()=>localStorage.setItem(key(profileId,"hidden"),String(hidden)),[profileId,hidden]);
  if(hidden)return <div className="seasonal-hidden"><span>Seasonal inspiration is hidden on this browser.</span><button className="link" onClick={()=>setHidden(false)}><Eye aria-hidden="true"/>Show it</button></div>;
  const items=suggestionsForSeason(season);
  return <section className="seasonal-inspiration" aria-labelledby="seasonal-title"><header><div><p className="eyebrow">A little seasonal nudge</p><h3 id="seasonal-title">Ideas for {labels[season].toLowerCase()}</h3><p>Choose the season that fits where you are. SideQuest does not use your location.</p></div><button className="link" onClick={()=>setHidden(true)}><EyeOff aria-hidden="true"/>Hide</button></header><div className="season-selector" role="group" aria-label="Choose inspiration season">{SEASONS.map(item=><button className={season===item?"active":""} aria-pressed={season===item} onClick={()=>setSeason(item)} key={item}>{labels[item]}</button>)}</div><div className="seasonal-cards">{items.map(item=><button className="seasonal-card" key={item.id} onClick={()=>onSelect(item)}><span aria-hidden="true">{season==="spring"?"🌷":season==="summer"?"☀️":season==="fall"?"🍂":"❄️"}</span><div><b>{item.title}</b><p>{item.description}</p></div></button>)}</div></section>
}
