import { ArrowRight, Check, Compass, Lightbulb, MapPin, MessageCircle, PartyPopper, Users, X } from "lucide-react";
import type { Space } from "./domain";

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
          {onExplore && <button className="secondary" onClick={onExplore}>Explore shared Ideas</button>}
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

const GUIDES = [
  ["What is a Space?", "A private home for Ideas you collect alone or with people you trust."],
  ["Ideas", "Save inspiration now and return when the timing feels right."],
  ["Reactions", TIP_COPY.reactions],
  ["Planner", TIP_COPY.planner],
  ["Map", TIP_COPY.map],
  ["Memories", TIP_COPY.memories],
  ["Activity", TIP_COPY.activity],
] as const;

export function HelpLearn({
  onClose,
  onReplay,
  onReplayTips,
}: {
  onClose: () => void;
  onReplay: () => void;
  onReplayTips: () => void;
}) {
  return (
    <section className="modal panel help-learn" aria-labelledby="help-title">
      <header>
        <div>
          <p className="eyebrow">Help &amp; Learn</p>
          <h2 id="help-title">SideQuest, at your pace.</h2>
          <p>Short guides for collecting possibilities, sharing them, and making them real.</p>
        </div>
        <button className="icon" aria-label="Close Help and Learn" onClick={onClose}><X /></button>
      </header>
      <div className="help-grid">
        {GUIDES.map(([title, copy], index) => (
          <details key={title}>
            <summary>
              <span>{index === 0 ? <Compass /> : index === 2 ? <MessageCircle /> : index === 4 ? <MapPin /> : <Check />}</span>
              <b>{title}</b>
            </summary>
            <p>{copy}</p>
          </details>
        ))}
      </div>
      <div className="help-replay">
        <button className="secondary" onClick={onReplay}>Take the first-run guide again</button>
        <button className="link" onClick={onReplayTips}>Replay contextual tips</button>
      </div>
    </section>
  );
}