import { CalendarDays, DollarSign, MapPin, Ticket, Users } from "lucide-react";
import { getIdeaTemplateDefinition } from "../features/templates/ideaTemplates";
import { resolveIdeaTemplateId, sanitizeTemplateData } from "../features/templates/templateValidation";
import type { IdeaTemplateId } from "../features/templates/templateTypes";
import { QUEST_STATUS_LABELS, questTypeDefinition, resolveQuestStatus } from "../features/quests/questTypes";
import { measurableGoal, momentumSignals } from "../features/living-quests/livingQuests";
import type { UserProfile } from "../types/domain";
import type { Idea, Space } from "./domain";
import "./idea-cards.css";

export interface IdeaCardMetadata {
  key: string;
  label: string;
  value: string;
  icon: "location" | "money" | "calendar" | "ticket" | "people";
}

const ICONS = { location: MapPin, money: DollarSign, calendar: CalendarDays, ticket: Ticket, people: Users };
const map = (value: unknown): { [key: string]: unknown } => typeof value === "object" && value !== null && !Array.isArray(value) ? value as { [key: string]: unknown } : {};
const text = (value: unknown): string => typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
const list = (value: unknown): string => Array.isArray(value) ? value.filter(item => typeof item === "string").join(", ") : "";
const money = (value: unknown): string => typeof value === "number" ? `$${value.toLocaleString()}` : text(value);

export function ideaCardMetadata(idea: Pick<Idea, "templateId" | "templateVersion" | "templateData" | "location">): IdeaCardMetadata[] {
  const templateId = resolveIdeaTemplateId(idea);
  const data = map(sanitizeTemplateData(templateId, idea.templateData));
  const location = idea.location?.trim();
  const values: IdeaCardMetadata[] = [];
  const add = (key: string, label: string, value: string, icon: IdeaCardMetadata["icon"]) => { if (value) values.push({ key, label, value, icon }); };
  if (templateId === "restaurant") {
    add("cuisine", "Cuisine", text(data.cuisine), "ticket"); add("price", "Price range", text(data.priceRange), "money"); add("location", "Location", location, "location"); add("reservation", "Reservation", data.reservationLink ? "Reservation ready" : "", "calendar");
  } else if (templateId === "movie") {
    add("genre", "Genre", text(data.genre), "ticket"); add("runtime", "Runtime", data.runtimeMinutes ? `${data.runtimeMinutes} min` : "", "calendar"); add("streaming", "Streaming service", text(data.streamingService), "ticket");
  } else if (templateId === "trip") {
    add("destination", "Destination", text(data.destination) || location, "location"); add("dates", "Potential dates", list(data.potentialDates), "calendar"); add("budget", "Budget goal", money(data.budgetGoal), "money");
  } else if (templateId === "hike") {
    add("difficulty", "Difficulty", text(data.difficulty), "ticket"); add("distance", "Distance", data.distanceMiles ? `${data.distanceMiles} mi` : "", "location"); add("location", "Location", location || text(data.trailName), "location");
  } else if (templateId === "event") {
    add("date", "Event date", text(data.eventDate), "calendar"); add("venue", "Venue", text(data.venue) || location, "location"); add("ticket", "Tickets", data.ticketLink ? "Ticket link saved" : "", "ticket");
  } else if (templateId === "gift") {
    add("recipient", "Recipient", text(data.recipient), "people"); add("occasion", "Occasion", text(data.occasion), "calendar"); add("price", "Estimated price", money(data.estimatedPrice), "money");
  } else if (templateId === "hotel") {
    add("location", "Location", location, "location"); add("nightly", "Nightly estimate", money(data.nightlyEstimate), "money"); add("dates", "Preferred dates", list(data.preferredDates), "calendar");
  } else if (templateId === "game") {
    add("platform", "Platform", text(data.platform), "ticket"); add("players", "Player count", data.playerCount ? `${data.playerCount} players` : "", "people");
  } else if (location) add("location", "Location", location, "location");
  return values.slice(0, 3);
}

export function ideaCardContext(idea: Idea, space: Space, profile: UserProfile): string {
  if (idea.completed) return "A memory now";
  if (space.memberIds.length === 1) return "Just for you";
  if (idea.createdBy !== profile.id) return `Shared by ${idea.createdByName}`;
  const waiting = space.memberIds.filter(id => id !== profile.id).map(id => space.memberNames[id] || "someone")[0];
  return `Still waiting on ${waiting || "your people"}`;
}

export function IdeaCard({ idea, space, profile, onOpen, variant = "standard" }: { idea: Idea; space: Space; profile: UserProfile; onOpen: () => void; variant?: "standard" | "compact" }) {
  const templateId: IdeaTemplateId = resolveIdeaTemplateId(idea);
  const template = getIdeaTemplateDefinition(templateId);
  const metadata = ideaCardMetadata(idea);
  const questType = questTypeDefinition(idea.questType);
  const questStatus = resolveQuestStatus(idea.status, idea.completed);
  const goal = measurableGoal(idea);
  const momentum = momentumSignals(idea, [], space)[0];
  return <button className={`card idea-card living-card ${variant} template-${templateId}${idea.photoUrl ? " has-image" : " no-image"}`} onClick={onOpen} aria-label={`Open ${idea.title}. ${questType.label} Quest.`}>
    <div className="cover" style={idea.photoUrl ? { backgroundImage: `linear-gradient(0deg,#111 0%,transparent 80%),url(${idea.photoUrl})` } : undefined}>
      <div className="idea-card-quest-meta"><span className="quest-type-chip" title={questType.label}>{questType.emoji}</span><span className="quest-status-chip">{QUEST_STATUS_LABELS[questStatus]}</span>{idea.collectionId&&<span className="collection-badge">Collection</span>}</div>
      {!idea.photoUrl && <span className="idea-card-fallback" aria-hidden="true">{template.emoji}</span>}
      <span className="space-mark" aria-label={`Space: ${space.name}`}>{space.emoji}</span>
      <div className="idea-card-title"><h2>{idea.title}</h2>{!metadata.length && <p>{idea.location || momentum.label}</p>}</div>
    </div>
    {goal ? <div className="living-goal-progress"><div><span>{goal.current} of {goal.target} {goal.unit}</span><b>{goal.percentage}%</b></div><progress value={Math.min(goal.current,goal.target)} max={goal.target}>{goal.percentage}%</progress></div> : metadata.length > 0 && variant === "standard" ? <div className="idea-card-metadata" aria-label="Quest details">{metadata.slice(0,2).map(item => { const Icon = ICONS[item.icon]; return <span key={item.key} aria-label={`${item.label}: ${item.value}`}><Icon aria-hidden="true" /><span className="idea-card-metadata-value">{item.value}</span></span>; })}</div> : null}
    <footer><span className="card-people">{space.memberIds.slice(0,3).map(id=><i key={id} title={space.memberNames[id]||"Member"}>{(space.memberNames[id]||"M")[0]?.toUpperCase()}</i>)}</span><span>{ideaCardContext(idea, space, profile)}</span><small>{momentum.label}</small></footer>
  </button>;
}