import type { Idea } from "./domain";

export type IdeaCreateInput = Omit<Idea, "id" | "createdAt" | "updatedAt">;
export type IdeaSaveStage = "validation" | "image" | "write";

export class IdeaSaveError extends Error {
  readonly stage: IdeaSaveStage;
  readonly cause: unknown;

  constructor(stage: IdeaSaveStage, message: string, cause?: unknown) {
    super(message);
    this.name = "IdeaSaveError";
    this.stage = stage;
    this.cause = cause;
  }
}

function cleanValue(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (typeof value === "number" && !Number.isFinite(value)) return undefined;
  if (Array.isArray(value)) return value.map(cleanValue).filter(item => item !== undefined);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, item]) => [key, cleanValue(item)] as const)
        .filter(([, item]) => item !== undefined),
    );
  }
  return value;
}

export function sanitizeIdeaCreateInput(input: IdeaCreateInput): IdeaCreateInput {
  const clean = cleanValue(input) as IdeaCreateInput;
  clean.spaceId = clean.spaceId?.trim();
  clean.title = clean.title?.trim();
  clean.createdBy = clean.createdBy?.trim();
  clean.createdByName = clean.createdByName?.trim();
  clean.category = clean.category?.trim();

  if (!clean.spaceId) throw new IdeaSaveError("validation", "Choose a Space before saving this Idea.");
  if (!clean.title) throw new IdeaSaveError("validation", "Give this Idea a title.");
  if (!clean.createdBy) throw new IdeaSaveError("validation", "Sign in again before saving this Idea.");
  if (!clean.category) throw new IdeaSaveError("validation", "Choose a category.");
  return clean;
}

export async function runIdeaCreate({
  id,
  input,
  file,
  upload,
  write,
  cleanup,
}: {
  id: string;
  input: IdeaCreateInput;
  file: File | null;
  upload: (file: File) => Promise<string>;
  write: (input: IdeaCreateInput, id: string) => Promise<{ id: string }>;
  cleanup: (url: string) => Promise<void>;
}): Promise<{ id: string; photoUrl: string }> {
  const clean = sanitizeIdeaCreateInput(input);
  let uploadedUrl = "";
  try {
    if (file) {
      try {
        uploadedUrl = await upload(file);
      } catch (cause) {
        throw new IdeaSaveError("image", "The image upload failed. Try again or remove the image.", cause);
      }
    }
    const photoUrl = uploadedUrl || clean.photoUrl || "";
    try {
      const result = await write({ ...clean, photoUrl }, id);
      return { id: result.id, photoUrl };
    } catch (cause) {
      throw new IdeaSaveError("write", "We could not save this Idea. Your draft is still here.", cause);
    }
  } catch (error) {
    if (uploadedUrl) await cleanup(uploadedUrl).catch(() => undefined);
    throw error;
  }
}
export function ideaSaveMessage(error: unknown, online = true): string {
  if (!online) return "You appear to be offline. Reconnect and try again.";
  const cause = error instanceof IdeaSaveError ? error.cause : error;
  const code = typeof cause === "object" && cause && "code" in cause ? String(cause.code) : "";
  if (code.includes("permission-denied") || code.includes("storage/unauthorized")) {
    return "You no longer have permission to add Ideas to this Space.";
  }
  if (error instanceof IdeaSaveError) return error.message;
  return "We could not save this Idea. Your draft is still here.";
}
