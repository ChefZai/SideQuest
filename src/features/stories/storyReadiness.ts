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
  return {
    coverPhoto: memory.photoUrls[0] || quest.photoUrl || "",
    completionLabel: completed
      ? `Became a Memory on ${completed.toLocaleDateString()}`
      : "A completed Journey worth returning to",
    peopleLabel: space.memberIds.length === 1
      ? "A personal Journey"
      : `Shared by ${space.memberIds.length} people`,
    photoLabel: `${memory.photoUrls.length} ${memory.photoUrls.length === 1 ? "photo" : "photos"}`,
    reflectionLabel: `${reflections.length} ${reflections.length === 1 ? "reflection" : "reflections"}`,
    locationLabel: quest.location ? `Remembered in ${quest.location}` : "",
    source: {
      questId: quest.id,
      journeyAvailable: true,
      momentCompatible: true,
      milestoneCompatible: true,
    },
  };
}

