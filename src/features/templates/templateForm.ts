import { getIdeaTemplateDefinition } from "./ideaTemplates";
import { sanitizeTemplateData } from "./templateValidation";
import type { IdeaTemplateData, IdeaTemplateId } from "./templateTypes";

export type TemplateFormDraft = { [key: string]: string };

const URL_KEYS = new Set([
  "reservationLink", "menuLink", "website", "trailerLink", "ticketLink", "bookingLink",
  "trailLink", "purchaseLink", "storeLink", "bookLink", "inspirationLink",
]);
const DATE_KEYS = new Set(["eventDate", "deadline"]);
const TIME_KEYS = new Set(["eventTime"]);

export interface TemplateFormResult {
  data?: IdeaTemplateData;
  errors: { key: string; message: string }[];
}

export function templateDataToDraft(templateId: IdeaTemplateId, value: unknown): TemplateFormDraft {
  const clean = sanitizeTemplateData(templateId, value);
  if (!clean) return {};
  return Object.fromEntries(Object.entries(clean).map(([key, item]) => [key, Array.isArray(item) ? item.join(", ") : String(item)]));
}

function validWebUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateTemplateForm(templateId: IdeaTemplateId, draft: TemplateFormDraft): TemplateFormResult {
  const definition = getIdeaTemplateDefinition(templateId);
  const raw: { [key: string]: unknown } = {};
  const errors: TemplateFormResult["errors"] = [];
  for (const field of definition.fields) {
    const entered = (draft[field.key] ?? "").trim();
    if (!entered) continue;
    if (URL_KEYS.has(field.key) && !validWebUrl(entered)) {
      errors.push({ key: field.key, message: "Use a complete http:// or https:// link." });
      continue;
    }
    if (DATE_KEYS.has(field.key) && !/^\d{4}-\d{2}-\d{2}$/.test(entered)) {
      errors.push({ key: field.key, message: "Choose a valid date." });
      continue;
    }
    if (TIME_KEYS.has(field.key) && !/^([01]\d|2[0-3]):[0-5]\d$/.test(entered)) {
      errors.push({ key: field.key, message: "Choose a valid time." });
      continue;
    }
    if (field.kind === "number") {
      const numeric = Number(entered);
      if (!Number.isFinite(numeric) || (field.min !== undefined && numeric < field.min) || (field.max !== undefined && numeric > field.max)) {
        errors.push({ key: field.key, message: `Enter a number${field.min !== undefined ? ` from ${field.min}` : ""}${field.max !== undefined ? ` to ${field.max}` : ""}.` });
      } else raw[field.key] = numeric;
    } else if (field.kind === "string-list") {
      raw[field.key] = entered.split(",").map(item => item.trim()).filter(Boolean);
    } else raw[field.key] = entered;
  }
  if (errors.length) return { errors };
  return { data: sanitizeTemplateData(templateId, raw), errors: [] };
}

export function hasTemplateFormValues(draft: TemplateFormDraft): boolean {
  return Object.values(draft).some(value => value.trim().length > 0);
}

export function isSafeExternalUrl(value: unknown): value is string {
  return typeof value === "string" && validWebUrl(value.trim());
}
