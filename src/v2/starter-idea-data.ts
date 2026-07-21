import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { CURRENT_IDEA_TEMPLATE_VERSION } from "../features/templates/templateTypes";
import {
  starterCategory,
  starterIdeaDocumentId,
  type StarterIdeaDraft,
} from "../features/templates/starterIdeas";
import { sanitizeTemplateData } from "../features/templates/templateValidation";
import type { UserProfile } from "../types/domain";
import type { CategoryDef } from "./domain";
import { withTimeout } from "./reliability";

export interface StarterIdeaWriteInput {
  spaceId: string;
  profile: UserProfile;
  categories: CategoryDef[];
  idea: StarterIdeaDraft;
}

export interface StarterIdeaApplyResult {
  created: string[];
  existing: string[];
  failed: { id: string; title: string; error: Error }[];
}

export async function ensureStarterIdea({ spaceId, profile, categories, idea }: StarterIdeaWriteInput): Promise<"created" | "existing"> {
  const category = starterCategory(categories, idea);
  if (!category) throw new Error("Keep or add at least one category before adding starter Ideas.");
  const id = starterIdeaDocumentId(spaceId, idea.id);
  const reference = doc(db, "ideas", id);
  return withTimeout(runTransaction(db, async transaction => {
    const current = await transaction.get(reference);
    if (current.exists()) return "existing" as const;
    const templateData = sanitizeTemplateData(idea.templateId, idea.templateData);
    transaction.set(reference, {
      spaceId,
      title: idea.title.trim(),
      description: idea.description.trim(),
      category: category.label,
      categoryEmoji: category.emoji,
      accent: category.accent,
      location: "",
      placeId: "",
      latitude: null,
      longitude: null,
      mapsUrl: "",
      tags: ["starter-idea"],
      price: "",
      duration: "",
      photoUrl: "",
      createdBy: profile.id,
      createdByName: profile.displayName,
      completed: false,
      completionRequestedBy: [],
      completedAt: null,
      templateId: idea.templateId,
      templateVersion: CURRENT_IDEA_TEMPLATE_VERSION,
      ...(templateData ? { templateData } : {}),
      starterId: idea.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return "created" as const;
  }), 15000, `Adding ${idea.title}`);
}

export async function applyStarterIdeas(
  inputs: readonly StarterIdeaWriteInput[],
  writer: (input: StarterIdeaWriteInput) => Promise<"created" | "existing"> = ensureStarterIdea,
): Promise<StarterIdeaApplyResult> {
  const settled = await Promise.allSettled(inputs.map(input => writer(input)));
  const result: StarterIdeaApplyResult = { created: [], existing: [], failed: [] };
  settled.forEach((entry, index) => {
    const idea = inputs[index].idea;
    const id = starterIdeaDocumentId(inputs[index].spaceId, idea.id);
    if (entry.status === "fulfilled") result[entry.value].push(id);
    else result.failed.push({ id, title: idea.title, error: entry.reason instanceof Error ? entry.reason : new Error(String(entry.reason)) });
  });
  return result;
}
