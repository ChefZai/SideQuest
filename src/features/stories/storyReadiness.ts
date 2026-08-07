import type { Idea, Memory, Reflection, Space } from "../../v2/domain";

export interface MemoryStoryReadiness {
  coverPhoto: string;
  completionLabel: string;
  peopleLabel: string;
  photoLabel: string;
  reflectionLabel: string;
  locationLabel: string;
  source: {
    questId: string;
    journeyAvailable: true;
    momentCompatible: true;
    milestoneCompatible: true;
  };
}

export function memoryStoryReadiness(
  quest: Idea,
  memory: Memory,
  reflections: Reflection[],
  space: Space,
): MemoryStoryReadiness {
  const completed = quest.completedAt?.toDate?.();
  const photoUrls = Array.isArray(memory.photoUrls)
    ? memory.photoUrls.filter((value): value is string => typeof value === "string" && value.length > 0)
    : [];
  const memberIds = Array.isArray(space.memberIds) ? space.memberIds : [];
  const safeReflections = Array.isArray(reflections) ? reflections : [];
  return {
    coverPhoto: photoUrls[0] || quest.photoUrl || "",
    completionLabel: completed
      ? `Became a Memory on ${completed.toLocaleDateString()}`
      : "A completed Journey worth returning to",
    peopleLabel: memberIds.length === 1
      ? "A personal Journey"
      : memberIds.length > 1
        ? `Shared by ${memberIds.length} people`
        : "People can be added when the moment is right",
    photoLabel: `${photoUrls.length} ${photoUrls.length === 1 ? "photo" : "photos"}`,
    reflectionLabel: `${safeReflections.length} ${safeReflections.length === 1 ? "reflection" : "reflections"}`,
    locationLabel: quest.location ? `Remembered in ${quest.location}` : "",
    source: {
      questId: quest.id,
      journeyAvailable: true,
      momentCompatible: true,
      milestoneCompatible: true,
    },
  };
}
