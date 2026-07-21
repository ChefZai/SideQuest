import { ChevronDown } from "lucide-react";
import { getIdeaTemplateDefinition, IDEA_TEMPLATE_DEFINITIONS } from "../features/templates/ideaTemplates";
import type { IdeaTemplateId, TemplateFieldDefinition } from "../features/templates/templateTypes";
import type { TemplateFormDraft } from "../features/templates/templateForm";
import "./template-fields.css";

const LABELS: { [key: string]: string } = {
  cuisine: "Cuisine", priceRange: "Price range", reservationLink: "Reservation link", menuLink: "Menu link", preferredTiming: "Preferred timing",
  atmosphere: "Atmosphere", itemToTry: "Drink or food to try", website: "Website",
  genre: "Genre", releaseYear: "Release year", runtimeMinutes: "Runtime in minutes", streamingService: "Streaming service", trailerLink: "Trailer link", watchLocation: "Where to watch",
  venue: "Venue", eventDate: "Event date", eventTime: "Event time", ticketLink: "Ticket link", estimatedPrice: "Estimated price",
  destination: "Destination", estimatedDriveMinutes: "Estimated drive time in minutes", idealSeason: "Ideal season", activities: "Activities", estimatedCost: "Estimated cost",
  potentialDates: "Potential dates", budgetGoal: "Budget goal", lodgingIdeas: "Lodging ideas", travelMethod: "Travel method",
  nightlyEstimate: "Nightly estimate", bookingLink: "Booking link", amenities: "Amenities", preferredDates: "Preferred dates",
  trailName: "Trail name", distanceMiles: "Distance in miles", difficulty: "Difficulty", elevationFeet: "Elevation in feet", bestSeason: "Best season", trailLink: "Trail link", packingNotes: "Packing notes",
  campground: "Campground", dates: "Dates", campsiteType: "Campsite type", packingList: "Packing list",
  recipient: "Recipient", occasion: "Occasion", purchaseLink: "Purchase link", deadline: "Deadline",
  platform: "Platform", playerCount: "Player count", storeLink: "Store link", plannedSession: "Planned session",
  author: "Author", format: "Format", bookLink: "Purchase or library link", readingPlan: "Reading plan",
  placeName: "Place name", bestTime: "Best time", photoStyle: "Photo style", accessNotes: "Access notes", inspirationLink: "Inspiration link",
  durationMinutes: "Duration in minutes", bestTiming: "Best timing",
};

const URL_KEYS = new Set(["reservationLink", "menuLink", "website", "trailerLink", "ticketLink", "bookingLink", "trailLink", "purchaseLink", "storeLink", "bookLink", "inspirationLink"]);
const DATE_KEYS = new Set(["eventDate", "deadline"]);

function fieldType(field: TemplateFieldDefinition): string {
  if (field.kind === "number") return "number";
  if (DATE_KEYS.has(field.key)) return "date";
  if (field.key === "eventTime") return "time";
  if (URL_KEYS.has(field.key)) return "url";
  return "text";
}

function Field({ field, value, error, onChange }: {
  field: TemplateFieldDefinition;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const label = LABELS[field.key] ?? field.key;
  const id = `template-field-${field.key}`;
  const props = { id, value, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value), "aria-invalid": Boolean(error), "aria-describedby": error ? `${id}-error` : undefined };
  return <label className="template-field" htmlFor={id}>{label}
    {field.key === "packingNotes" || field.key === "accessNotes" || field.key === "readingPlan"
      ? <textarea {...props} maxLength={field.maxLength} />
      : <input {...props} type={fieldType(field)} min={field.min} max={field.max} maxLength={field.kind === "string" ? field.maxLength : undefined} placeholder={field.kind === "string-list" ? "Separate items with commas" : undefined} />}
    {error && <small id={`${id}-error`} className="template-field-error">{error}</small>}
  </label>;
}

export function TemplateFieldsEditor({ templateId, draft, errors, onChange, onTemplateChange }: {
  templateId: IdeaTemplateId;
  draft: TemplateFormDraft;
  errors: { key: string; message: string }[];
  onChange: (draft: TemplateFormDraft) => void;
  onTemplateChange: (id: IdeaTemplateId) => void;
}) {
  const definition = getIdeaTemplateDefinition(templateId);
  const primary = definition.fields.slice(0, 2);
  const secondary = definition.fields.slice(2);
  const render = (field: TemplateFieldDefinition) => <Field key={field.key} field={field} value={draft[field.key] ?? ""} error={errors.find(error => error.key === field.key)?.message} onChange={value => onChange({ ...draft, [field.key]: value })} />;
  return <section className="template-fields" aria-labelledby="template-fields-title">
    <header><div><span aria-hidden="true">{definition.emoji}</span><div><small>Idea template</small><h3 id="template-fields-title">{definition.name}</h3></div></div><label>Change template<select aria-label="Change Idea template" value={templateId} onChange={event => onTemplateChange(event.target.value as IdeaTemplateId)}>{IDEA_TEMPLATE_DEFINITIONS.map(template => <option key={template.id} value={template.id}>{template.name}</option>)}</select></label></header>
    {templateId !== "custom" && <>
      <div className="template-field-grid">{primary.map(render)}</div>
      {secondary.length > 0 && <details><summary>More details <ChevronDown aria-hidden="true" /></summary><div className="template-field-grid">{secondary.map(render)}</div></details>}
    </>}
    {templateId === "custom" && <p className="template-custom-note">Use the open-ended fields above. Nothing extra is required.</p>}
  </section>;
}
