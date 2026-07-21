import { useState } from "react";
import { ArrowRight, Check, Compass, Lightbulb, MapPin, MessageCircle, PartyPopper, Users, X } from "lucide-react";
import type { Space } from "./domain";
import { HELP_ARTICLES, HELP_SECTIONS, helpArticle } from "./help-content";
import { VersionHistory } from "./VersionHistory";

export const TIP_COPY = {
  reactions: "See how everyone feels without needing a conversation right away.",
  planner: "When an Idea starts feeling real, turn it into a plan.",
  map: "Places saved to Ideas appear here.",
  memories: "Completed SideQuests become memories you can return to.",
  activity: "See the little ways your Spaces are moving forward.",
} as const;

export type TipKey = keyof typeof TIP_COPY;

function StepProgress({ current }: { current: number }) {
  return (
    <div className="onboarding-progress" aria-label={"Onboarding step " + current + " of 5"}>
      {[1, 2, 3, 4, 5].map(step => (
        <span key={step} className={step <= current ? "active" : ""} />
      ))}
    </div>
  );
}

export function OnboardingWelcome({
  name,
  invited,
  onStart,
  returning = false,
  onDismiss,
}: {
  name: string;
  invited: boolean;
  onStart: () => void;
  returning?: boolean;
  onDismiss?: () => void;
}) {
  return (
    <main className="first-run">
      <div className="first-run-card welcome-step">
        {!returning && <StepProgress current={1} />}
        <div className="first-run-mark"><Compass /></div>
        <p className="eyebrow">{returning ? "A quick SideQuest introduction" : `Welcome, ${name}`}</p>
        <h1>{invited ? "A shared possibility is waiting for you." : "A little home for what comes next."}</h1>
        <p className="first-run-lead">
          Save ideas without pressure. Share them with someone. See what excites you both.
          Make plans when the time feels right.
        </p>
        {returning && <ul className="version-intro-list" aria-label="What is new in SideQuest"><li><b>Space templates</b><span>Begin with editable categories and optional starter Ideas.</span></li><li><b>Idea templates</b><span>Save useful details for restaurants, trips, events, hikes, gifts, and more.</span></li><li><b>Inspiration</b><span>Browse evergreen and seasonal prompts, then edit before saving.</span></li><li><b>Dynamic Ideas</b><span>Cards and details now adapt to what you are planning.</span></li></ul>}
        {invited && <p className="invite-note"><Users /> Your invitation will stay with you while you sign in and join.</p>}
        <button className="primary first-run-primary" onClick={onStart}>
          {returning ? "Continue to SideQuest" : invited ? "Join the Space" : "Start your first Space"} <ArrowRight />
        </button>
        {returning && onDismiss && <button className="link" onClick={onDismiss}>Skip introduction</button>}
      </div>
    </main>
  );
}

export function OnboardingSpaceIntro() {
  return (
    <div className="onboarding-intro">
      <StepProgress current={2} />
      <p className="eyebrow">Your first Space</p>
      <h1>Give your possibilities a place to gather.</h1>
      <p>A Space is a private place for ideas you want to collect with someone—or just for yourself.</p>
      <div className="space-examples" aria-label="Example Spaces">
        <span>❤️ Me &amp; Zoe</span>
        <span>✈️ Japan Trip</span>
        <span>🧭 Solo Adventures</span>
        <span>👥 The Boys</span>
        <span>🎂 Mom’s Birthday</span>
      </div>
    </div>
  );
}

export function OnboardingInviteChoice({
  space,
  onInvite,
  onAlone,
}: {
  space: Space;
  onInvite: () => void;
  onAlone: () => void;
}) {
  return (
    <main className="first-run">
      <div className="first-run-card">
        <StepProgress current={3} />
        <div className="first-run-mark peach"><Users /></div>
        <p className="eyebrow">{space.emoji} {space.name}</p>
        <h1>Who would make this Space more fun?</h1>
        <p className="first-run-lead">
          Bring someone along. SideQuest works best when possibilities are shared—but you can always start alone.
        </p>
        <div className="first-run-actions">
          <button className="primary" onClick={onInvite}><Users /> Invite someone</button>
          <button className="secondary" onClick={onAlone}>Continue alone</button>
        </div>
      </div>
    </main>
  );
}

export function OnboardingJoined({
  space,
  onContinue,
  onExplore,
}: {
  space: Space;
  onContinue: () => void;
  onExplore?: () => void;
}) {
  return (
    <main className="first-run">
      <div className="first-run-card">
        <StepProgress current={3} />
        <div className="joined-space-emoji" aria-hidden="true">{space.emoji}</div>
        <p className="eyebrow">You’re in</p>
        <h1>You joined {space.name}.</h1>
        <p className="first-run-lead">
          This is a private place for ideas you share together. Add a possibility—or open an Idea and react when you’re ready.
        </p>
        <div className="first-run-actions">
          <button className="primary" onClick={onContinue}>Save your first Idea <ArrowRight /></button>
          {onExplore && <button className="secondary" onClick={onExplore}>Explore this Space</button>}
        </div>
      </div>
    </main>
  );
}

export function OnboardingIdeaIntro({ space }: { space: Space }) {
  return (
    <div className="onboarding-idea-intro">
      <StepProgress current={4} />
      <p className="eyebrow">{space.emoji} {space.name}</p>
      <h1>Save something you don’t want to forget.</h1>
      <p>A restaurant, a weekend thought, a gift, a trip, or any small possibility is enough.</p>
    </div>
  );
}

export function OnboardingSuccess({
  replaying,
  onDone,
}: {
  replaying: boolean;
  onDone: () => void;
}) {
  return (
    <main className="first-run">
      <div className="first-run-card success-step" role="status">
        <StepProgress current={5} />
        <div className="first-run-mark yellow"><PartyPopper /></div>
        <p className="eyebrow">{replaying ? "A fresh possibility" : "Your first possibility"}</p>
        <h1>That’s your first possibility ✨</h1>
        <p className="first-run-lead">Add more whenever inspiration hits. No planning pressure required.</p>
        <button className="primary first-run-primary" onClick={onDone}>
          See your Space <ArrowRight />
        </button>
      </div>
    </main>
  );
}

export function ContextTip({
  tip,
  onDismiss,
}: {
  tip: TipKey;
  onDismiss: () => void;
}) {
  return (
    <aside className={"context-tip context-tip-" + tip} aria-label="SideQuest tip">
      <Lightbulb aria-hidden="true" />
      <p>{TIP_COPY[tip]}</p>
      <button className="icon" aria-label="Dismiss tip" onClick={onDismiss}><X /></button>
    </aside>
  );
}

export function HelpLearn({
  onClose,
  onReplay,
  onReplayTips,
}: {
  onClose: () => void;
  onReplay: () => void;
  onReplayTips: () => void;
}) {
  const [openArticle, setOpenArticle] = useState("what-is-sidequest");
  const openRelated = (id: string) => {
    setOpenArticle(id);
    requestAnimationFrame(() => {
      const target = document.getElementById(`help-${id}`);
      target?.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      target?.focus();
    });
  };
  return (
    <section className="modal panel help-learn" aria-labelledby="help-title">
      <header>
        <div><p className="eyebrow">Help &amp; Learn</p><h2 id="help-title">SideQuest, at your pace.</h2><p>Short guides for collecting possibilities, sharing them, and making them real.</p></div>
        <button className="icon" aria-label="Close Help and Learn" onClick={onClose}><X /></button>
      </header>
      <nav className="help-section-links" aria-label="Help topics">{HELP_SECTIONS.map(section=><a key={section} href={`#help-section-${section.toLowerCase().replaceAll(" ","-")}`}>{section}</a>)}</nav>
      <div className="help-articles">
        {HELP_SECTIONS.map(section=><section key={section} id={`help-section-${section.toLowerCase().replaceAll(" ","-")}`}><h3>{section}</h3><div className="help-grid">{HELP_ARTICLES.filter(article=>article.section===section).map(article=><details id={`help-${article.id}`} tabIndex={-1} key={article.id} open={openArticle===article.id} onToggle={event=>{if(event.currentTarget.open)setOpenArticle(article.id);else if(openArticle===article.id)setOpenArticle("")}}><summary><span>{section==="Start here"?<Compass/>:section==="Troubleshooting"?<MessageCircle/>:section==="Version 0.4"?<Lightbulb/>:section==="Core features"?<Check/>:<Users/>}</span><span><b>{article.title}</b><small>{article.summary}</small></span></summary><div className="help-article-body"><p>{article.summary}</p>{article.steps&&<ol>{article.steps.map(step=><li key={step}>{step}</li>)}</ol>}{article.tip&&<aside><Lightbulb aria-hidden="true"/><span>{article.tip}</span></aside>}{article.related&&article.related.length>0&&<div className="related-guides"><small>Related guides</small>{article.related.map(id=>{const related=helpArticle(id);return related?<button type="button" className="link" key={id} onClick={()=>openRelated(id)}>{related.title}</button>:null})}</div>}</div></details>)}</div></section>)}
      </div>
      <VersionHistory />
      <div className="help-replay"><button className="secondary" onClick={onReplay}>Replay the Version 0.4 introduction</button><button className="link" onClick={onReplayTips}>Replay contextual tips</button></div>
    </section>
  );
}