import { Check, Image, MapPin, MessageCircle, Pause, Play, Sparkles, Star, Users } from "lucide-react";
import type { MomentRecord } from "../features/journeys/journeyTypes";

const ICONS = {
  "quest-created": Sparkles,
  "status-changed": Play,
  "memory-added": Star,
  "photo-added": Image,
  "comment-added": MessageCircle,
  "reaction-added": Sparkles,
  "milestone-reached": Star,
  "quest-completed": Check,
  "reflection-written": MessageCircle,
  "invitation-accepted": Users,
  "journey-started": Play,
  "journey-resumed": Play,
  "journey-paused": Pause,
  "journey-reopened": Play,
  "journey-update": Sparkles,
} as const;

function momentTime(moment: MomentRecord): string {
  if (!moment.createdAt?.toDate) return "Just now";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(moment.createdAt.toDate());
}

export function MomentCard({ moment }: { moment: MomentRecord }) {
  const Icon = ICONS[moment.type];
  return (
    <article className={moment.isMilestone ? "moment-card milestone" : "moment-card"} style={moment.celebrationColor ? { "--moment-accent": moment.celebrationColor } as React.CSSProperties : undefined}>
      <span className="moment-icon" aria-hidden="true">{moment.emoji || <Icon />}</span>
      <div className="moment-story">
        <header><div><h4>{moment.title}</h4><p>{moment.actorName}</p></div><time>{momentTime(moment)}</time></header>
        {moment.description && <p>{moment.description}</p>}
        {moment.imageUrl && <img src={moment.imageUrl} alt="" loading="lazy" decoding="async" />}
        <footer>
          {moment.location && <span><MapPin aria-hidden="true" />{moment.location}</span>}
          {moment.people?.length ? <span><Users aria-hidden="true" />{moment.people.join(", ")}</span> : null}
          {moment.reactionCount ? <span><Sparkles aria-hidden="true" />{moment.reactionCount}</span> : null}
        </footer>
      </div>
    </article>
  );
}
