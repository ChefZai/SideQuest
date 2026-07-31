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

function CollectionSummary({ collection, children, events, onOpen }: { collection: Idea; children: Idea[]; events: ActivityItem[]; onOpen: (idea: Idea) => void }) {
  const completed = children.filter(item => item.completed);
  const featured = children.find(item => item.photoUrl) || children[0];
  const childIds = new Set(children.map(item => item.id));
  const latestEvent = events.find(event => childIds.has(event.questId || event.targetId));
  const cover = collection.photoUrl || featured?.photoUrl;
  return <button className="collection-summary alive" onClick={() => onOpen(collection)}>
    {cover ? <img className="collection-cover" src={cover} alt="" loading="lazy" decoding="async" /> : <span className="collection-cover-fallback" aria-hidden="true">{collection.categoryEmoji || "✨"}</span>}
    <div className="collection-summary-body"><div className="collection-summary-head"><div><p className="eyebrow">{collection.categoryEmoji} A living Collection</p><h3>{collection.title}</h3></div><span>{children.length} Quests</span></div>
    <p>{collection.description || "A place for connected possibilities to grow into a chapter of their own."}</p>
    {children.length ? <div className="collection-story"><span><b>{featured?.title}</b><small>Featured Quest</small></span>{latestEvent&&<span><b>{latestEvent.title || latestEvent.targetTitle}</b><small>Latest Moment</small></span>}<span><b>{completed.length} remembered</b><small>{Math.max(0, children.length-completed.length)} still unfolding</small></span></div> : <div className="collection-invitation"><Sparkles aria-hidden="true" /><span><b>The first Quest can begin anywhere.</b><small>Add a possibility when it feels connected to this story.</small></span></div>}
    </div>
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
    <section className="home-quest-section"><header><div><p className="eyebrow">Related possibilities taking shape</p><h2>Collections Growing</h2></div><span>{collections.length}</span></header>{collections.length ? <div className="collection-grid">{collections.map(collection => <CollectionSummary key={collection.id} collection={collection} children={ideas.filter(item => item.collectionId === collection.id || item.parentQuestId === collection.id)} events={events} onOpen={onOpen} />)}</div> : <div className="quest-section-empty"><Sparkles aria-hidden="true" /><p>Create a Collection when a few possibilities start to feel connected.</p></div>}</section>
    <QuestSection title="Dream Bigger" copy="Sparks waiting for the right moment" empty="What have you been dreaming about lately?" ideas={inspired} space={space} profile={profile} onOpen={onOpen} />
  </div>;
}
