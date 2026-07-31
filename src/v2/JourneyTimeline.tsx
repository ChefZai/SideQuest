import { useEffect, useMemo, useState } from "react";
import { Camera, MapPin, MessageCircle, Plus, Sparkles, Star, X } from "lucide-react";
import { journeySummary, orderMoments, type JourneyOrder, type MomentRecord, type MomentType } from "../features/journeys/journeyTypes";
import type { UserProfile } from "../types/domain";
import { addMoment, removeImage, uploadImage, watchJourney } from "./data";
import type { Idea, Space } from "./domain";
import { MomentCard } from "./MomentCard";
import "./journey-system.css";

const MANUAL_TYPES: { id: MomentType; label: string; emoji: string }[] = [
  { id: "journey-update", label: "Journey Update", emoji: "✨" },
  { id: "photo-added", label: "Photo", emoji: "📷" },
  { id: "memory-added", label: "Memory", emoji: "💛" },
  { id: "reflection-written", label: "Reflection", emoji: "💭" },
  { id: "milestone-reached", label: "Milestone", emoji: "⭐" },
  { id: "status-changed", label: "Status Change", emoji: "🧭" },
];

export function JourneyTimeline({ quest, space, profile, compact = false }: { quest: Idea; space: Space; profile: UserProfile; compact?: boolean }) {
  const [moments, setMoments] = useState<MomentRecord[]>([]);
  const [order, setOrder] = useState<JourneyOrder>("newest");
  const [creating, setCreating] = useState(false);
  const [type, setType] = useState<MomentType>("journey-update");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => watchJourney(quest.id, setMoments, failure => setError(failure.message)), [quest.id]);
  const ordered = useMemo(() => orderMoments(moments, order), [moments, order]);
  const summary = useMemo(() => journeySummary(moments, quest.createdAt, quest.completed), [moments, quest.createdAt, quest.completed]);

  const save = async () => {
    if (!description.trim()) return setError("Add a few words about this Moment.");
    setBusy(true);
    setError("");
    let uploadedUrl = "";
    try {
      if (file) uploadedUrl = await uploadImage(space.id, "ideas", quest.id, profile.id, file, setProgress);
      await addMoment({
        spaceId: space.id,
        questId: quest.id,
        actorId: profile.id,
        actorName: profile.displayName,
        type,
        title: MANUAL_TYPES.find(item => item.id === type)?.label || "Journey Update",
        description: description.trim(),
        location: location.trim() || undefined,
        imageUrl: uploadedUrl || undefined,
        isMilestone: type === "milestone-reached",
        emoji: emoji.trim() || undefined,
      });
      setDescription("");
      setLocation("");
      setFile(null);
      setCreating(false);
    } catch (failure) {
      if (uploadedUrl) void removeImage(uploadedUrl);
      setError(failure instanceof Error ? failure.message : "This Moment could not be saved.");
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <section className={compact ? "journey-timeline compact" : "journey-timeline"} aria-labelledby={`journey-${quest.id}`}>
      <header className="journey-heading">
        <div><p className="eyebrow">The story so far</p><h3 id={`journey-${quest.id}`}>Journey</h3></div>
        <div className="journey-actions">
          <label>Order<select aria-label="Journey order" value={order} onChange={event => setOrder(event.target.value as JourneyOrder)}><option value="newest">Newest first</option><option value="chronological">Beginning first</option></select></label>
          <button className="secondary" onClick={() => setCreating(true)}><Plus />Add Moment</button>
        </div>
      </header>

      {summary.length > 0 && <div className="quest-journey-summary">{summary.map(line => <span key={line}>{line}</span>)}</div>}
      {creating && <div className="moment-composer">
        <header><div><p className="eyebrow">A meaningful update</p><h4>Add a Moment</h4></div><button className="icon" aria-label="Close Moment composer" onClick={() => setCreating(false)}><X /></button></header>
        <div className="moment-types">{MANUAL_TYPES.map(item => <button key={item.id} className={type === item.id ? "active" : ""} aria-pressed={type === item.id} onClick={() => { setType(item.id); setEmoji(item.emoji); }}>{item.emoji}<span>{item.label}</span></button>)}</div>
        <label>What happened?<textarea value={description} onChange={event => setDescription(event.target.value)} placeholder="What made this part of the Journey worth remembering?" /></label>
        <div className="twocol"><label>Emoji<input value={emoji} maxLength={8} onChange={event => setEmoji(event.target.value)} /></label><label>Location, if it matters<input value={location} onChange={event => setLocation(event.target.value)} /></label></div><label>Photo, if this Moment has one<input type="file" accept="image/*" onChange={event => setFile(event.target.files?.[0] || null)} /></label>
        {error && <div className="error" role="alert">{error}</div>}
        <button className="primary" disabled={busy} onClick={save}>{busy ? progress ? `Uploading ${progress}%…` : "Saving Moment…" : "Add to Journey"}</button>
      </div>}

      {!creating && error && <div className="error" role="alert">{error}</div>}
      {ordered.length ? <div className="moment-list">{ordered.map(moment => <MomentCard key={moment.id} moment={moment} />)}</div> : <div className="journey-empty"><Sparkles aria-hidden="true" /><h4>This Journey is ready for its first Moment.</h4><p>Notice the small wins, meaningful changes, and memories as they happen.</p><button className="secondary" onClick={() => setCreating(true)}>Add the first Moment</button></div>}
    </section>
  );
}
