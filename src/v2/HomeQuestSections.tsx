import { Heart, Plus, Sparkles } from "lucide-react";
import { meaningfulHomeSections } from "../features/product-focus/productFocus";
import type { UserProfile } from "../types/domain";
import { IdeaCard } from "./IdeaCard";
import type { ActivityItem, Idea, Space } from "./domain";
import "./quest-foundation.css";

function FocusSection({ title, copy, ideas, space, profile, onOpen, empty }: {
  title: string; copy: string; ideas: Idea[]; space: Space; profile: UserProfile;
  onOpen: (idea: Idea) => void; empty: string;
}) {
  return <section className="home-focus-section">
    <header><div><p className="eyebrow">{copy}</p><h2>{title}</h2></div></header>
    {ideas.length
      ? <div className="cards">{ideas.map(quest => <IdeaCard key={quest.id} idea={quest} space={space} profile={profile} onOpen={() => onOpen(quest)} />)}</div>
      : <div className="focus-empty"><Sparkles aria-hidden="true" /><p>{empty}</p></div>}
  </section>;
}

export function HomeQuestSections({ ideas, events = [], space, profile, onOpen, onCreate }: {
  ideas: Idea[]; events: ActivityItem[]; space: Space; profile: UserProfile;
  onOpen: (idea: Idea) => void; onCreate: () => void;
}) {
  if (!ideas.length) return <div className="empty quest-home-empty">
    <span aria-hidden="true">✨</span><h2>Your next favorite memory can start here.</h2>
    <p>Save one possibility. It can stay simple until the right moment arrives.</p>
    <button className="primary" onClick={onCreate}><Plus />Save your first Quest</button>
  </div>;
  const sections = meaningfulHomeSections(ideas, events, profile.id);
  return <div className="home-focus-sections">
    <FocusSection title="Shared With You" copy="Possibilities from your people" ideas={sections.sharedWithYou} space={space} profile={profile} onOpen={onOpen} empty="Nothing is waiting on you. When someone shares a possibility, it will be here—without pressure." />
    <FocusSection title="Shared Excitement" copy="The things you both want" ideas={sections.sharedExcitement} space={space} profile={profile} onOpen={onOpen} empty="A little mutual excitement will gather here when your reactions line up." />
    <FocusSection title="Becoming Real" copy="Possibilities beginning to move" ideas={sections.becomingReal} space={space} profile={profile} onOpen={onOpen} empty="Nothing needs planning yet. When a Quest starts feeling real, you can take the next small step." />
    {sections.memory && <button className="remember-feature" onClick={() => onOpen(sections.memory!)} style={sections.memory.photoUrl ? { backgroundImage: `linear-gradient(90deg,rgba(23,39,36,.9),rgba(23,39,36,.28)),url(${sections.memory.photoUrl})` } : undefined}>
      <Heart aria-hidden="true" /><span><small>Remember this?</small><b>{sections.memory.title}</b></span>
    </button>}
  </div>;
}
