import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { getIdeaTemplateDefinition } from "../features/templates/ideaTemplates";
import { isSafeExternalUrl } from "../features/templates/templateForm";
import { resolveIdeaTemplateId, sanitizeTemplateData } from "../features/templates/templateValidation";
import type { IdeaTemplateId } from "../features/templates/templateTypes";
import type { Idea } from "./domain";
import { mapsSearchUrl } from "./maps";
import "./idea-template-details.css";

interface DetailField { key: string; label: string; kind?: "link" | "money" | "minutes" | "miles" | "feet" | "date" }

const DETAIL_FIELDS: Partial<Record<IdeaTemplateId, readonly DetailField[]>> = {
  restaurant: [{key:"cuisine",label:"Cuisine"},{key:"priceRange",label:"Price range"},{key:"preferredTiming",label:"Preferred timing"},{key:"reservationLink",label:"Reservation",kind:"link"},{key:"menuLink",label:"Menu",kind:"link"}],
  movie: [{key:"genre",label:"Genre"},{key:"runtimeMinutes",label:"Runtime",kind:"minutes"},{key:"releaseYear",label:"Release year"},{key:"streamingService",label:"Streaming service"},{key:"trailerLink",label:"Trailer",kind:"link"},{key:"watchLocation",label:"Where to watch"}],
  trip: [{key:"destination",label:"Destination"},{key:"potentialDates",label:"Potential dates",kind:"date"},{key:"budgetGoal",label:"Budget goal",kind:"money"},{key:"lodgingIdeas",label:"Lodging ideas"},{key:"travelMethod",label:"Travel method"},{key:"activities",label:"Activities"}],
  hike: [{key:"trailName",label:"Trail"},{key:"difficulty",label:"Difficulty"},{key:"distanceMiles",label:"Distance",kind:"miles"},{key:"elevationFeet",label:"Elevation",kind:"feet"},{key:"bestSeason",label:"Best season"},{key:"trailLink",label:"Trail information",kind:"link"},{key:"packingNotes",label:"Packing notes"}],
  event: [{key:"eventDate",label:"Date",kind:"date"},{key:"eventTime",label:"Time"},{key:"venue",label:"Venue"},{key:"ticketLink",label:"Tickets",kind:"link"},{key:"estimatedPrice",label:"Estimated price",kind:"money"}],
  gift: [{key:"recipient",label:"For"},{key:"occasion",label:"Occasion"},{key:"estimatedPrice",label:"Estimated price",kind:"money"},{key:"purchaseLink",label:"Purchase",kind:"link"},{key:"deadline",label:"Deadline",kind:"date"}],
  coffee: [{key:"atmosphere",label:"Atmosphere"},{key:"itemToTry",label:"What to try"},{key:"website",label:"Website",kind:"link"}],
  "day-trip": [{key:"destination",label:"Destination"},{key:"estimatedDriveMinutes",label:"Drive time",kind:"minutes"},{key:"idealSeason",label:"Ideal season"},{key:"activities",label:"Activities"},{key:"estimatedCost",label:"Estimated cost",kind:"money"}],
  hotel: [{key:"nightlyEstimate",label:"Nightly estimate",kind:"money"},{key:"preferredDates",label:"Preferred dates",kind:"date"},{key:"amenities",label:"Amenities"},{key:"bookingLink",label:"Booking",kind:"link"}],
  camping: [{key:"campground",label:"Campground"},{key:"dates",label:"Dates",kind:"date"},{key:"campsiteType",label:"Campsite type"},{key:"packingList",label:"Packing list"},{key:"estimatedCost",label:"Estimated cost",kind:"money"},{key:"reservationLink",label:"Reservation",kind:"link"}],
  game: [{key:"platform",label:"Platform"},{key:"playerCount",label:"Players"},{key:"genre",label:"Genre"},{key:"plannedSession",label:"Planned session"},{key:"storeLink",label:"Store",kind:"link"}],
  book: [{key:"author",label:"Author"},{key:"genre",label:"Genre"},{key:"format",label:"Format"},{key:"readingPlan",label:"Reading plan"},{key:"bookLink",label:"Book link",kind:"link"}],
  "photo-spot": [{key:"placeName",label:"Place"},{key:"bestTime",label:"Best time"},{key:"photoStyle",label:"Photo style"},{key:"accessNotes",label:"Access notes"},{key:"inspirationLink",label:"Inspiration",kind:"link"}],
  activity: [{key:"estimatedPrice",label:"Estimated price",kind:"money"},{key:"durationMinutes",label:"Duration",kind:"minutes"},{key:"bestTiming",label:"Best timing"},{key:"bookingLink",label:"Booking",kind:"link"}],
};

const object = (value: unknown): { [key: string]: unknown } => typeof value === "object" && value !== null && !Array.isArray(value) ? value as { [key: string]: unknown } : {};
const display = (value: unknown, kind?: DetailField["kind"]): string => {
  if (Array.isArray(value)) return value.filter(item=>typeof item === "string").join(" · ");
  if (typeof value !== "string" && typeof value !== "number") return "";
  if (kind === "money") return typeof value === "number" ? `$${value.toLocaleString()}` : String(value);
  if (kind === "minutes" && typeof value === "number") return value >= 60 ? `${Math.floor(value/60)} hr${value>=120?"s":""}${value%60?` ${value%60} min`:""}` : `${value} min`;
  if (kind === "miles") return `${value} mi`;
  if (kind === "feet") return `${Number(value).toLocaleString()} ft`;
  return String(value).trim();
};

export function IdeaTemplateDetails({idea}:{idea:Idea}) {
  const templateId = resolveIdeaTemplateId(idea);
  if (templateId === "custom") return null;
  const template = getIdeaTemplateDefinition(templateId);
  const data = object(sanitizeTemplateData(templateId, idea.templateData));
  const fields = (DETAIL_FIELDS[templateId]||[]).map(field=>{const raw=data[field.key];const value=field.kind==="link"&&!isSafeExternalUrl(raw)?"":display(raw,field.kind);return{field,value,raw}}).filter(item=>item.value);
  const locationUrl = idea.location ? (idea.mapsUrl || mapsSearchUrl(idea.location)) : "";
  if (!fields.length && !idea.location) return null;
  return <section className={`template-details template-details-${templateId}`} aria-labelledby="template-details-title">
    <header><span aria-hidden="true">{template.emoji}</span><div><p className="eyebrow">{template.name} details</p><h3 id="template-details-title">What you have saved</h3></div></header>
    <dl>
      {idea.location && <div><dt><MapPin aria-hidden="true"/>Location</dt><dd><a href={locationUrl} target="_blank" rel="noopener noreferrer">{idea.location}<ExternalLink aria-hidden="true"/></a></dd></div>}
      {fields.map(({field,value,raw})=><div key={field.key}><dt>{field.kind === "date"?<CalendarDays aria-hidden="true"/>:null}{field.label}</dt><dd>{field.kind === "link" && isSafeExternalUrl(raw)?<a href={String(raw)} target="_blank" rel="noopener noreferrer">Open {field.label.toLowerCase()}<ExternalLink aria-hidden="true"/></a>:value}</dd></div>)}
    </dl>
  </section>;
}
