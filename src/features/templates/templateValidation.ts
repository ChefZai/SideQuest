import { getIdeaTemplateDefinition } from "./ideaTemplates";
import {
  ACCENT_THEMES,
  CURRENT_IDEA_TEMPLATE_VERSION,
  CURRENT_SPACE_TEMPLATE_VERSION,
  IDEA_TEMPLATE_IDS,
  SPACE_TEMPLATE_IDS,
  type AccentTheme,
  type IdeaTemplateData,
  type IdeaTemplateId,
  type IdeaTemplateMetadata,
  type SpaceTemplateId,
  type SpaceTemplateMetadata,
  type TemplateFieldDefinition,
} from "./templateTypes";

type UnknownMap = { [key: string]: unknown };

const isMap = (value: unknown): value is UnknownMap => typeof value === "object" && value !== null && !Array.isArray(value);
const isSpaceTemplateId = (value: unknown): value is SpaceTemplateId => typeof value === "string" && (SPACE_TEMPLATE_IDS as readonly string[]).includes(value);
const isIdeaTemplateId = (value: unknown): value is IdeaTemplateId => typeof value === "string" && (IDEA_TEMPLATE_IDS as readonly string[]).includes(value);
const isAccentTheme = (value: unknown): value is AccentTheme => typeof value === "string" && (ACCENT_THEMES as readonly string[]).includes(value);

function cleanString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, maxLength);
  return cleaned || undefined;
}

function cleanNumber(value: unknown, field: TemplateFieldDefinition): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  if (field.min !== undefined && value < field.min) return undefined;
  if (field.max !== undefined && value > field.max) return undefined;
  return value;
}

function cleanStringList(value: unknown, field: TemplateFieldDefinition): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const cleaned = value
    .slice(0, field.maxItems ?? 20)
    .map(item => cleanString(item, field.maxLength ?? 200))
    .filter((item): item is string => item !== undefined);
  return cleaned.length ? cleaned : undefined;
}

export function sanitizeTemplateData(templateId: IdeaTemplateId, value: unknown): IdeaTemplateData | undefined {
  if (!isMap(value)) return undefined;
  const definition = getIdeaTemplateDefinition(templateId);
  const clean: UnknownMap = {};
  for (const field of definition.fields) {
    const raw = value[field.key];
    const sanitized = field.kind === "string"
      ? cleanString(raw, field.maxLength ?? 500)
      : field.kind === "number"
        ? cleanNumber(raw, field)
        : cleanStringList(raw, field);
    if (sanitized !== undefined) clean[field.key] = sanitized;
  }
  return Object.keys(clean).length ? clean as IdeaTemplateData : undefined;
}

export function deserializeSpaceTemplateMetadata(value: unknown): SpaceTemplateMetadata {
  if (!isMap(value)) return {};
  if (!isSpaceTemplateId(value.templateId)) return {};
  if (value.templateVersion !== CURRENT_SPACE_TEMPLATE_VERSION) return {};
  return {
    templateId: value.templateId,
    templateVersion: CURRENT_SPACE_TEMPLATE_VERSION,
    accentTheme: isAccentTheme(value.accentTheme) ? value.accentTheme : undefined,
    starterPackApplied: typeof value.starterPackApplied === "boolean" ? value.starterPackApplied : undefined,
  };
}

export function serializeSpaceTemplateMetadata(value: SpaceTemplateMetadata): SpaceTemplateMetadata {
  return deserializeSpaceTemplateMetadata(value);
}

export function deserializeIdeaTemplateMetadata(value: unknown): IdeaTemplateMetadata {
  if (!isMap(value)) return {};
  if (!isIdeaTemplateId(value.templateId)) return {};
  if (value.templateVersion !== CURRENT_IDEA_TEMPLATE_VERSION) return {};
  return {
    templateId: value.templateId,
    templateVersion: CURRENT_IDEA_TEMPLATE_VERSION,
    templateData: sanitizeTemplateData(value.templateId, value.templateData),
  };
}

export function serializeIdeaTemplateMetadata(value: IdeaTemplateMetadata): IdeaTemplateMetadata {
  return deserializeIdeaTemplateMetadata(value);
}

export function resolveSpaceTemplateId(value: unknown): SpaceTemplateId {
  return deserializeSpaceTemplateMetadata(value).templateId ?? "blank";
}

export function resolveIdeaTemplateId(value: unknown): IdeaTemplateId {
  return deserializeIdeaTemplateMetadata(value).templateId ?? "custom";
}

export function templateFieldsForFirestore(value: IdeaTemplateMetadata): UnknownMap {
  const clean = serializeIdeaTemplateMetadata(value);
  if (!clean.templateId) return {};
  return {
    templateId: clean.templateId,
    templateVersion: clean.templateVersion,
    ...(clean.templateData ? { templateData: clean.templateData } : {}),
  };
}

export function normalizeSpaceTemplateDocument<T extends object>(value: T): T & SpaceTemplateMetadata {
  const clean = deserializeSpaceTemplateMetadata(value);
  return {
    ...value,
    templateId: clean.templateId,
    templateVersion: clean.templateVersion,
    accentTheme: clean.accentTheme,
    starterPackApplied: clean.starterPackApplied,
  };
}

export function normalizeIdeaTemplateDocument<T extends object>(value: T): T & IdeaTemplateMetadata {
  const clean = deserializeIdeaTemplateMetadata(value);
  return {
    ...value,
    templateId: clean.templateId,
    templateVersion: clean.templateVersion,
    templateData: clean.templateData,
  };
}
