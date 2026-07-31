import { Plus } from "lucide-react";
import { resolveQuestStatus, resolveQuestType } from "../features/quests/questTypes";
import type { UserProfile } from "../types/domain";
import { IdeaCard } from "./IdeaCard";
import type { Idea, Space } from "./domain";
import "./quest-foundation.css";

function QuestSection({
  title,
  copy,
  ideas,
  space,
  profile,
  onOpen,
  empty,
}: {
  title: string;
  copy: string;
  ideas: Idea[];
  space: Space;
  profile: UserProfile;
  onOpen: (idea: Idea) => void;
  empty: string;
}) {
  return (
    <section className="home-quest-section">
      <header><div><p className="eyebrow">{copy}</p><h2>{title}</h2></div><span>{ideas.length}</span></header>
      {ideas.length ? <div className="cards">{ideas.map(quest => <IdeaCard key={quest.id} idea={quest} space={space} profile={profile} onOpen={() => onOpen(quest)} />)}</div> : <div className="quest-section-empty"><span aria-hidden="true">✦</span><p>{empty}</p></div>}
    </section>
  );
}

export function HomeQuestSections({
  ideas,
  space,
  profile,
  onOpen,
  onCreate,
}: {
  ideas: Idea[];
  space: Space;
  profile: UserProfile;
  onOpen: (idea: Idea) => void;
  onCreate: () => void;
}) {
  const active = ideas.filter(quest => !quest.completed);
  const memories = ideas.filter(quest => quest.completed);
  const collections = active.filter(quest => resolveQuestType(quest.questType) === "collection");
  const inspired = active.filter(quest => resolveQuestStatus(quest.status) === "inspired" && resolveQuestType(quest.questType) !== "collection");
  const continuing = active.filter(quest => ["planning", "in-progress", "paused"].includes(resolveQuestStatus(quest.status)) && resolveQuestType(quest.questType) !== "collection");
  const claimed = new Set([...collections, ...inspired, ...continuing].map(quest => quest.id));
  const recent = active.filter(quest => !claimed.has(quest.id));

  if (!ideas.length) {
    return (
      <div className="empty quest-home-empty">
        <span aria-hidden="true">🌅</span>
        <h2>Your future has room for something wonderful.</h2>
        <p>What have you been dreaming about lately? Start with one Quest and let it grow when you are ready.</p>
        <button className="primary" onClick={onCreate}><Plus />Start your first Quest</button>
      </div>
    );
  }

  return (
    <div className="home-quest-sections">
      <QuestSection title="Continue Your Journey" copy="Keep moving what matters" empty="You haven’t started a Journey yet. Your next chapter can begin whenever you’re ready." ideas={continuing} space={space} profile={profile} onOpen={onOpen} />
      <QuestSection title="Recently Inspired" copy="New sparks worth returning to" empty="What have you been dreaming about lately?" ideas={inspired} space={space} profile={profile} onOpen={onOpen} />
      <QuestSection title="Collections" copy="Possibilities that belong together" empty="Create a Collection when a few possibilities start to feel connected." ideas={collections} space={space} profile={profile} onOpen={onOpen} />
      <QuestSection title="Recent Quests" copy="The future you are building" empty="Your next adventure starts here." ideas={recent} space={space} profile={profile} onOpen={onOpen} />
      <QuestSection title="Memories" copy="Completed Journeys worth revisiting" empty="The moments you make real will gather here." ideas={memories} space={space} profile={profile} onOpen={onOpen} />
    </div>
  );
}
