import { Plus, Sparkles } from "lucide-react";
import { resolveQuestStatus, resolveQuestType } from "../features/quests/questTypes";
import type { UserProfile } from "../types/domain";
import { IdeaCard } from "./IdeaCard";
import type { ActivityItem, Idea, Space } from "./domain";
import "./quest-foundation.css";
import "./journey-system.css";

function QuestSection({ title, copy, ideas, space, profile, onOpen, empty }: {
  title: string;
  copy: string;
  ideas: Idea[];
  space: Space;
  profile: UserProfile;
  onOpen: (idea: Idea) => void;
  empty: string;
}) {
  return <section className="home-quest-section">
    <header><div><p className="eyebrow">{copy}</p><h2>{title}</h2></div><span>{ideas.length}</span></header>
    {ideas.length ? <div className="cards">{ideas.map(quest => <IdeaCard key={quest.id} idea={quest} space={space} profile={profile} onOpen={() => onOpen(quest)} />)}</div> : <div className="quest-section-empty"><Sparkles aria-hidden="true" /><p>{empty}</p></div>}
  </section>;
}

function CollectionSummary({ collection, children, onOpen }: { collection: Idea; children: Idea[]; onOpen: (idea: Idea) => void }) {
  const completed = children.filter(item => item.completed);
  return <button className="collection-summary" onClick={() => onOpen(collection)}>
    <div className="collection-summary-head"><div><p className="eyebrow">{collection.categoryEmoji} Collection</p><h3>{collection.title}</h3></div><span>{children.length} Quests</span></div>
    {collection.description && <p>{collection.description}</p>}
    <div className="collection-stats"><span><b>{children.length}</b><small>total Quests</small></span><span><b>{completed.length}</b><small>completed</small></span><span><b>{Math.max(0, children.length - completed.length)}</b><small>still unfolding</small></span></div>{children[0] && <small className="collection-latest">Recent Journey · {children[0].title}</small>}{completed[0] && <small className="collection-memory">Latest Memory · {completed[0].title}</small>}
  </button>;
}

export function HomeQuestSections({ ideas, events = [], space, profile, onOpen, onCreate }: {
  ideas: Idea[];
  events: ActivityItem[];
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
  const latestMomentIds = [...new Set(events.map(event => event.questId || event.targetId))].slice(0, 6);
  const latestMoments = latestMomentIds.map(id => ideas.find(idea => idea.id === id)).filter((idea): idea is Idea => Boolean(idea));
  const celebrated = memories.slice(0, 6);

  if (!ideas.length) return <div className="empty quest-home-empty"><span aria-hidden="true">🌅</span><h2>Your future has room for something wonderful.</h2><p>What have you been dreaming about lately? Start with one Quest and let it grow when you are ready.</p><button className="primary" onClick={onCreate}><Plus />Start your first Quest</button></div>;

  return <div className="home-quest-sections">
    <QuestSection title="Continue Your Journey" copy="Keep moving what matters" empty="You haven’t started a Journey yet. Your next chapter can begin whenever you’re ready." ideas={continuing} space={space} profile={profile} onOpen={onOpen} />
    <QuestSection title="Latest Moments" copy="Small signs of a life in motion" empty="Your first Moment will appear when a Quest begins to move." ideas={latestMoments} space={space} profile={profile} onOpen={onOpen} />
    <QuestSection title="Recently Celebrated" copy="Journeys that became memories" empty="The moments you make real will gather here." ideas={celebrated} space={space} profile={profile} onOpen={onOpen} />
    <section className="home-quest-section"><header><div><p className="eyebrow">Related possibilities taking shape</p><h2>Collections Growing</h2></div><span>{collections.length}</span></header>{collections.length ? <div className="collection-grid">{collections.map(collection => <CollectionSummary key={collection.id} collection={collection} children={ideas.filter(item => item.collectionId === collection.id)} onOpen={onOpen} />)}</div> : <div className="quest-section-empty"><Sparkles aria-hidden="true" /><p>Create a Collection when a few possibilities start to feel connected.</p></div>}</section>
    <QuestSection title="Dream Bigger" copy="Sparks waiting for the right moment" empty="What have you been dreaming about lately?" ideas={inspired} space={space} profile={profile} onOpen={onOpen} />
  </div>;
}
