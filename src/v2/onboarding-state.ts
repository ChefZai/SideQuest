import type { CategoryDefinition, IdeaRecord, OnboardingState } from "../types/domain";

export const CURRENT_ONBOARDING_VERSION = 2;

export function normalizeOnboardingState(
  saved: unknown,
  fallback: OnboardingState,
): OnboardingState {
  if (!saved || typeof saved !== "object") return { ...fallback };
  const value = saved as Record<string, unknown>;
  const version = typeof value.version === "number" && Number.isFinite(value.version)
    ? value.version
    : undefined;
  const firstIdeaId = typeof value.firstIdeaId === "string" && value.firstIdeaId
    ? value.firstIdeaId
    : undefined;

  return {
    started: Boolean(value.started),
    step: (value.step as OnboardingState["step"]) || "welcome",
    completed: Boolean(value.completed),
    dismissedTips: Array.isArray(value.dismissedTips)
      ? value.dismissedTips.filter((tip): tip is string => typeof tip === "string")
      : [],
    replaying: Boolean(value.replaying),
    ...(firstIdeaId ? { firstIdeaId } : {}),
    ...(version !== undefined ? { version } : {}),
  };
}

export function initialOnboardingCategories(
  onboarding: boolean,
  defaults: CategoryDefinition[],
): CategoryDefinition[] {
  return onboarding ? defaults.map((category) => ({ ...category })) : [];
}

export function ensureFirstIdeaId(
  onboarding: OnboardingState,
  createId: () => string = () => crypto.randomUUID(),
): string {
  return onboarding.firstIdeaId || createId();
}

export function hasPersistedFirstIdea(
  onboarding: OnboardingState,
  ideas: Pick<IdeaRecord, "id">[],
): boolean {
  return Boolean(
    onboarding.firstIdeaId && ideas.some((idea) => idea.id === onboarding.firstIdeaId),
  );
}
export function shouldShowOnboardingIntroduction(
  onboarding: OnboardingState,
  currentVersion: number = CURRENT_ONBOARDING_VERSION,
): boolean {
  return onboarding.completed && (onboarding.version ?? 0) < currentVersion;
}
