import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { User } from "firebase/auth";
import { AnimatePresence, motion } from "motion/react";
import { Activity, ArrowLeft, Camera, Check, ChevronDown, Compass, Home, ImagePlus, LoaderCircle, LogOut, MapPin, MessageCircle, Plus, Send, Settings, Sparkles, Trash2, Users, X } from "lucide-react";
import { DEFAULT_CATEGORIES, DEFAULT_REACTIONS, SPACE_TYPES } from "../config/defaults";
import { createAccount, getUserProfile, observeAuth, signIn, signOutUser } from "../services/auth";
import { addComment, createIdea, createInvitation, createSpace, joinSpaceByCode, observeActivity, observeComments, observeIdeas, observeReactions, observeSpaces, recordActivity, removeIdea, setReaction, updateIdea } from "../services/data";
import { uploadIdeaPhoto } from "../services/storage";
import type { ActivityRecord, CategoryDefinition, CommentRecord, IdeaRecord, ReactionRecord, SpaceRecord, UserProfile } from "../types/domain";
import "./app.css";

type Screen = "home" | "spaces" | "activity" | "profile";
type Dialog = "idea" | "space" | "invite" | "join" | null;

const errorMessage = (error: unknown) => {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (code.includes("email-already-in-use")) return "That email already has an account.";
  if (code.includes("invalid-credential")) return "Email or password is incorrect.";
  if (code.includes("weak-password")) return "Use a password with at least six characters.";
  if (code.includes("operation-not-allowed")) return "Enable Email/Password sign-in in Firebase Authentication first.";
  if (code.includes("permission-denied")) return "Firebase blocked this action. Publish the included security rules.";
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
};

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="logo"><span className="logo-mark"><Compass size={compact ? 18 : 24} /></span><span className={compact ? "logo-text compact" : "logo-text"}>SideQuest</span></div>;
}

function Loading({ label = "Loading SideQuest…" }: { label?: string }) {
  return <div className="center-screen"><LoaderCircle className="spin" /><p>{label}</p></div>;
}

function AuthGate({ onReady }: { onReady: (user: User, profile: UserProfile) => void }) {
  const [mode, setMode] = useState<"landing" | "signin" | "signup">("landing");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const user = mode === "signup" ? await createAccount(email.trim(), password, name.trim() || "Explorer") : await signIn(email.trim(), password);
      onReady(user, await getUserProfile(user));
    } catch (cause) { setError(errorMessage(cause)); } finally { setBusy(false); }
  };

  if (mode === "landing") return (
    <main className="landing">
      <div className="landing-glow" />
      <Logo />
      <section className="hero">
        <p className="eyebrow">A private home for shared possibility</p>
        <h1>Collect ideas today.<br /><em>Live them tomorrow.</em></h1>
        <p>Save the sparks you don’t want to lose. Let the people you trust react on their own time, then turn mutual excitement into plans and memories.</p>
        <div className="hero-cards">
          {[['🍜','Hidden ramen bar'],['✈️','Japan someday'],['🎵','Summer concert']].map(([emoji,title], index) => <motion.div key={title} className="mini-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 * index }}><span>{emoji}</span><b>{title}</b><small>No rush—just saving the spark.</small></motion.div>)}
        </div>
      </section>
      <div className="landing-actions"><button className="primary" onClick={() => setMode("signup")}>Create your space</button><button className="secondary" onClick={() => setMode("signin")}>I already have an account</button><small>Private by default · Built for collaboration, not pressure</small></div>
    </main>
  );

  return (
    <main className="auth-page"><button className="icon-button" onClick={() => { setMode("landing"); setError(""); }}><ArrowLeft /></button><Logo compact />
      <form className="auth-card" onSubmit={submit}><p className="eyebrow">{mode === "signup" ? "Begin your first SideQuest" : "Welcome back"}</p><h1>{mode === "signup" ? "Create an account" : "Sign in"}</h1>
        {mode === "signup" && <label>Your name<input value={name} onChange={e => setName(e.target.value)} required placeholder="Isaiah" /></label>}
        <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" /></label>
        {error && <div className="error">{error}</div>}
        <button className="primary" disabled={busy}>{busy ? <LoaderCircle className="spin" /> : mode === "signup" ? "Continue" : "Sign in"}</button>
        <button className="text-button" type="button" onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); }}>{mode === "signup" ? "Already have an account? Sign in" : "New to SideQuest? Create an account"}</button>
      </form>
    </main>
  );
}

function SpaceForm({ user, onDone, onCancel }: { user: UserProfile; onDone: (id: string) => void; onCancel?: () => void }) {
  const [name, setName] = useState(""); const [emoji, setEmoji] = useState("✨"); const [type, setType] = useState("Together"); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const submit = async (event: FormEvent) => { event.preventDefault(); setBusy(true); setError(""); try { const result = await createSpace({ name: name.trim(), emoji: emoji.trim() || "✨", type, ownerId: user.id, memberIds: [user.id], categories: DEFAULT_CATEGORIES, reactionDefs: DEFAULT_REACTIONS }); onDone(result.id); } catch (cause) { setError(errorMessage(cause)); } finally { setBusy(false); } };
  return <form className="form-card" onSubmit={submit}><div className="form-heading"><div><p className="eyebrow">Spaces keep every story in context</p><h2>Create a Space</h2></div>{onCancel && <button className="icon-button" type="button" onClick={onCancel}><X /></button>}</div>
    <div className="space-preview"><span>{emoji || "✨"}</span><div><b>{name || "Your new Space"}</b><small>{type} · private by default</small></div></div>
    <label>Emoji<input className="emoji-input" value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={8} /></label>
    <label>Space name<input value={name} onChange={e => setName(e.target.value)} required placeholder="Isaiah & Zoe" /></label>
    <label>What kind of Space?<div className="chip-row">{SPACE_TYPES.map(item => <button type="button" key={item} className={type === item ? "chip active" : "chip"} onClick={() => setType(item)}>{item}</button>)}</div></label>
    <div className="info-note"><Sparkles size={17} />You can customize categories, reactions, and the emoji as your Space evolves.</div>{error && <div className="error">{error}</div>}<button className="primary" disabled={busy}>{busy ? "Creating…" : "Create Space"}</button>
  </form>;
}

function IdeaForm({ space, profile, existing, onClose }: { space: SpaceRecord; profile: UserProfile; existing?: IdeaRecord | null; onClose: () => void }) {
  const [title, setTitle] = useState(existing?.title || ""); const [description, setDescription] = useState(existing?.description || ""); const [location, setLocation] = useState(existing?.location || ""); const [tags, setTags] = useState(existing?.tags.join(", ") || ""); const [category, setCategory] = useState(existing?.category || ""); const [file, setFile] = useState<File | null>(null); const [preview, setPreview] = useState(existing?.photoUrl || ""); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const inputRef = useRef<HTMLInputElement>(null);
  const chosen = space.categories.find(item => item.label === category);
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!chosen) return setError("Choose a category."); setBusy(true); setError(""); try {
      let ideaId = existing?.id || ""; let photoUrl = existing?.photoUrl || "";
      if (existing) await updateIdea(existing.id, { title: title.trim(), description: description.trim(), location: location.trim(), tags: tags.split(",").map(tag => tag.trim()).filter(Boolean), category: chosen.label, categoryEmoji: chosen.emoji, accent: chosen.accent });
      else { const result = await createIdea({ spaceId: space.id, title: title.trim(), description: description.trim(), location: location.trim(), tags: tags.split(",").map(tag => tag.trim()).filter(Boolean), category: chosen.label, categoryEmoji: chosen.emoji, accent: chosen.accent, photoUrl: "", createdBy: profile.id, createdByName: profile.displayName, completed: false, completedAt: null }); ideaId = result.id; }
      if (file) { photoUrl = await uploadIdeaPhoto(space.id, ideaId, file); await updateIdea(ideaId, { photoUrl }); }
      await recordActivity({ spaceId: space.id, actorId: profile.id, actorName: profile.displayName, action: existing ? "updated" : "added", targetId: ideaId, targetTitle: title.trim() }); onClose();
    } catch (cause) { setError(errorMessage(cause)); } finally { setBusy(false); } };
  const chooseFile = (next: File | undefined) => { if (!next) return; setFile(next); setPreview(URL.createObjectURL(next)); };
  return <form className="modal-card idea-form" onSubmit={submit}><div className="form-heading"><div><p className="eyebrow">{space.emoji} {space.name}</p><h2>{existing ? "Edit Idea" : "What’s inspiring you?"}</h2></div><button className="icon-button" type="button" onClick={onClose}><X /></button></div>
    <button className={preview ? "photo-picker has-photo" : "photo-picker"} type="button" onClick={() => inputRef.current?.click()} style={preview ? { backgroundImage: `linear-gradient(0deg,rgba(0,0,0,.3),rgba(0,0,0,.05)),url(${preview})` } : undefined}><ImagePlus /><span>{preview ? "Change cover photo" : "Add an inspiration photo"}</span></button><input hidden ref={inputRef} type="file" accept="image/*" onChange={e => chooseFile(e.target.files?.[0])} />
    <label>Idea title<input value={title} onChange={e => setTitle(e.target.value)} required maxLength={100} placeholder="The idea you don’t want to forget" /></label>
    <label>Why this caught your attention<textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={1000} placeholder="No pressure—just enough context for everyone later." /></label>
    <label>Category<div className="chip-row">{space.categories.map(item => <button type="button" key={item.id} className={category === item.label ? "chip active" : "chip"} onClick={() => setCategory(item.label)}>{item.emoji} {item.label}</button>)}</div></label>
    <div className="two-col"><label>Location<input value={location} onChange={e => setLocation(e.target.value)} placeholder="Optional" /></label><label>Tags<input value={tags} onChange={e => setTags(e.target.value)} placeholder="rainy-day, cheap" /></label></div>
    {error && <div className="error">{error}</div>}<button className="primary" disabled={busy}>{busy ? "Saving…" : existing ? "Save changes" : "Save Idea"}</button>
  </form>;
}

function IdeaDetail({ idea, space, profile, onClose, onEdit }: { idea: IdeaRecord; space: SpaceRecord; profile: UserProfile; onClose: () => void; onEdit: () => void }) {
  const [comments, setComments] = useState<CommentRecord[]>([]); const [reactions, setReactions] = useState<ReactionRecord[]>([]); const [comment, setComment] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => observeComments(idea.id, setComments), [idea.id]); useEffect(() => observeReactions(idea.id, setReactions), [idea.id]);
  const mine = reactions.find(item => item.userId === profile.id)?.type;
  const react = async (type: string) => { try { await setReaction(idea.id, mine === type ? null : { userId: profile.id, userName: profile.displayName, type }, profile.id); await recordActivity({ spaceId: space.id, actorId: profile.id, actorName: profile.displayName, action: mine === type ? "removed a reaction from" : "reacted to", targetId: idea.id, targetTitle: idea.title }); } catch (cause) { setError(errorMessage(cause)); } };
  const sendComment = async () => { if (!comment.trim()) return; setBusy(true); try { await addComment(idea.id, { authorId: profile.id, authorName: profile.displayName, text: comment.trim() }); await recordActivity({ spaceId: space.id, actorId: profile.id, actorName: profile.displayName, action: "commented on", targetId: idea.id, targetTitle: idea.title }); setComment(""); } catch (cause) { setError(errorMessage(cause)); } finally { setBusy(false); } };
  const toggleComplete = async () => { await updateIdea(idea.id, { completed: !idea.completed, completedAt: idea.completed ? null : (undefined as never) }); await recordActivity({ spaceId: space.id, actorId: profile.id, actorName: profile.displayName, action: idea.completed ? "reopened" : "completed", targetId: idea.id, targetTitle: idea.title }); onClose(); };
  const destroy = async () => { if (!confirm(`Delete “${idea.title}”?`)) return; try { await removeIdea(idea.id); onClose(); } catch (cause) { setError(errorMessage(cause)); } };
  return <div className="modal-card detail-card"><div className="detail-hero" style={idea.photoUrl ? { backgroundImage: `linear-gradient(0deg,rgba(15,14,13,.95),rgba(15,14,13,.05)),url(${idea.photoUrl})` } : undefined}><button className="icon-button" onClick={onClose}><ArrowLeft /></button><div className="detail-actions"><button className="icon-button" onClick={onEdit}><Settings /></button><button className="icon-button danger" onClick={destroy}><Trash2 /></button></div><div><span className="status-pill">{idea.categoryEmoji} {idea.category}</span><h1>{idea.title}</h1>{idea.location && <p><MapPin size={15} />{idea.location}</p>}</div></div>
    <div className="detail-body"><p className="byline">Added by {idea.createdByName} · {space.emoji} {space.name}</p><p className="description">{idea.description || "No description yet."}</p>{idea.tags.length > 0 && <div className="chip-row">{idea.tags.map(tag => <span className="chip" key={tag}>#{tag}</span>)}</div>}
      <section><h3>How does this feel?</h3><div className="reaction-grid">{space.reactionDefs.map(def => { const people = reactions.filter(item => item.type === def.type); return <button key={def.type} className={mine === def.type ? "reaction active" : "reaction"} onClick={() => react(def.type)}><span>{def.emoji}</span><b>{def.label}</b><small>{people.length ? people.map(item => item.userName).join(", ") : "Tap to react"}</small></button>; })}</div></section>
      <section><div className="section-title"><h3>Conversation</h3><span>{comments.length}</span></div><div className="comments">{comments.length === 0 && <div className="empty-small">No pressure and no rush. Start a thread whenever you’re ready.</div>}{comments.map(item => <div className="comment" key={item.id}><span>{item.authorName.slice(0,1).toUpperCase()}</span><div><b>{item.authorName}</b><p>{item.text}</p></div></div>)}</div><div className="comment-box"><input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => { if (e.key === "Enter") void sendComment(); }} placeholder="Add a thought…" /><button className="icon-button teal" disabled={busy} onClick={sendComment}><Send /></button></div></section>
      {error && <div className="error">{error}</div>}<button className={idea.completed ? "secondary wide" : "primary"} onClick={toggleComplete}>{idea.completed ? "Move back to active ideas" : <><Check /> Mark as completed</>}</button>
    </div></div>;
}

function MainApp({ user, profile }: { user: User; profile: UserProfile }) {
  const [spaces, setSpaces] = useState<SpaceRecord[]>([]); const [activeSpaceId, setActiveSpaceId] = useState(""); const [ideas, setIdeas] = useState<IdeaRecord[]>([]); const [activities, setActivities] = useState<ActivityRecord[]>([]); const [screen, setScreen] = useState<Screen>("home"); const [dialog, setDialog] = useState<Dialog>(null); const [selectedIdea, setSelectedIdea] = useState<IdeaRecord | null>(null); const [editing, setEditing] = useState<IdeaRecord | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [showCompleted, setShowCompleted] = useState(false);
  useEffect(() => observeSpaces(user.uid, items => { setSpaces(items); setActiveSpaceId(current => current && items.some(item => item.id === current) ? current : items[0]?.id || ""); setLoading(false); }, cause => { setError(errorMessage(cause)); setLoading(false); }), [user.uid]);
  useEffect(() => activeSpaceId ? observeIdeas(activeSpaceId, setIdeas, cause => setError(errorMessage(cause))) : undefined, [activeSpaceId]);
  useEffect(() => observeActivity(spaces.map(item => item.id), setActivities), [spaces]);
  const activeSpace = spaces.find(item => item.id === activeSpaceId); const visibleIdeas = ideas.filter(item => item.completed === showCompleted);
  if (loading) return <Loading label="Opening your Spaces…" />;
  if (!spaces.length) return <main className="onboarding"><Logo /><div className="onboarding-copy"><p className="eyebrow">Welcome, {profile.displayName}</p><h1>Give your future ideas somewhere to grow.</h1><p>A Space can be a relationship, a trip, a friend group, or simply a corner for yourself.</p></div><SpaceForm user={profile} onDone={setActiveSpaceId} /></main>;
  if (!activeSpace) return <Loading />;
  return <div className="app-shell"><header className="app-header"><Logo compact /><button className="space-selector" onClick={() => setScreen("spaces")}><span>{activeSpace.emoji}</span><b>{activeSpace.name}</b><ChevronDown /></button><button className="avatar" onClick={() => setScreen("profile")}>{profile.displayName.slice(0,1).toUpperCase()}</button></header>
    {error && <div className="top-error">{error}<button onClick={() => setError("")}><X /></button></div>}
    <main className="content">
      {screen === "home" && <><section className="page-intro"><div><p className="eyebrow">Ideas wait for people—not the other way around</p><h1>{showCompleted ? "Lived moments" : "Ideas worth returning to"}</h1><p>{showCompleted ? "The experiences you turned from possibility into memory." : "Collect now. React when it feels right. Plan when the excitement is mutual."}</p></div><button className="primary compact-button" onClick={() => { setEditing(null); setDialog("idea"); }}><Plus /> Add Idea</button></section><div className="segmented"><button className={!showCompleted ? "active" : ""} onClick={() => setShowCompleted(false)}>Active</button><button className={showCompleted ? "active" : ""} onClick={() => setShowCompleted(true)}>Completed</button></div>
        {visibleIdeas.length === 0 ? <div className="empty-state"><span>🌱</span><h2>{showCompleted ? "Your memories will grow here" : "Every great SideQuest starts with one idea"}</h2><p>{showCompleted ? "When an idea happens, mark it complete and keep the story." : "Save something that made you think of this Space. Nobody has to answer right away."}</p>{!showCompleted && <button className="primary" onClick={() => setDialog("idea")}><Plus /> Add the first Idea</button>}</div> : <div className="idea-grid">{visibleIdeas.map(idea => <motion.button layout className="idea-card" key={idea.id} onClick={() => setSelectedIdea(idea)}><div className="idea-photo" style={idea.photoUrl ? { backgroundImage: `linear-gradient(0deg,rgba(10,9,8,.85),rgba(10,9,8,.05)),url(${idea.photoUrl})` } : undefined}><span>{idea.photoUrl ? idea.categoryEmoji : `${idea.categoryEmoji} ${idea.category}`}</span><div><h2>{idea.title}</h2>{idea.location && <p><MapPin />{idea.location}</p>}</div></div><div className="idea-meta"><span>by {idea.createdByName}</span><span>{idea.completed ? "Completed" : "Open for thoughts"}</span></div></motion.button>)}</div>}</>}
      {screen === "spaces" && <><section className="page-intro"><div><p className="eyebrow">Private worlds for different people and plans</p><h1>Your Spaces</h1></div><div className="header-actions"><button className="secondary" onClick={() => setDialog("join")}>Join with code</button><button className="primary compact-button" onClick={() => setDialog("space")}><Plus /> New Space</button></div></section><div className="space-list">{spaces.map(space => <button className={space.id === activeSpaceId ? "space-row active" : "space-row"} key={space.id} onClick={() => { setActiveSpaceId(space.id); setScreen("home"); }}><span>{space.emoji}</span><div><b>{space.name}</b><small>{space.memberIds.length} {space.memberIds.length === 1 ? "member" : "members"} · {space.type}</small></div>{space.id === activeSpaceId && <Check />}</button>)}</div></>}
      {screen === "activity" && <><section className="page-intro"><div><p className="eyebrow">Collaboration without interruption</p><h1>Activity</h1><p>See what changed while you were living your day.</p></div></section><div className="activity-list">{activities.length === 0 ? <div className="empty-state"><span>🔔</span><h2>Quiet for now</h2><p>New Ideas, reactions, comments, and completed plans will appear here.</p></div> : activities.map(item => <div className="activity-row" key={item.id}><span>{item.actorName.slice(0,1)}</span><p><b>{item.actorName}</b> {item.action} <strong>{item.targetTitle}</strong></p></div>)}</div></>}
      {screen === "profile" && <><section className="profile-hero"><div className="avatar large">{profile.displayName.slice(0,1).toUpperCase()}</div><h1>{profile.displayName}</h1><p>{profile.email}</p></section><div className="principles"><h2>How SideQuest works</h2>{[["💡","Collect","Capture a spark before it disappears."],["🤝","Collaborate","React and comment whenever you have time."],["✨","Anticipate","Turn shared excitement into a plan."],["📸","Remember","Keep completed Ideas as part of your story."]].map(([icon,title,copy]) => <div key={title}><span>{icon}</span><p><b>{title}</b><small>{copy}</small></p></div>)}</div><button className="secondary wide" onClick={() => setDialog("invite")}>Invite someone to {activeSpace.name}</button><button className="danger-button" onClick={signOutUser}><LogOut /> Sign out</button><div className="about"><Logo compact /><p>Collect ideas today. Live them tomorrow.</p><small>SideQuest v0.1 · Private by default</small></div></>}
    </main>
    <nav className="bottom-nav">{([["home",Home,"Home"],["spaces",Users,"Spaces"],["activity",Activity,"Activity"],["profile",Settings,"Profile"]] as const).map(([id,Icon,label]) => <button key={id} className={screen === id ? "active" : ""} onClick={() => setScreen(id)}><Icon /><span>{label}</span></button>)}<button className="fab" onClick={() => { setEditing(null); setDialog("idea"); }}><Plus /></button></nav>
    <AnimatePresence>{(dialog || selectedIdea) && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) { setDialog(null); setSelectedIdea(null); setEditing(null); } }}>
      {dialog === "idea" && <IdeaForm space={activeSpace} profile={profile} existing={editing} onClose={() => { setDialog(null); setEditing(null); }} />}
      {dialog === "space" && <SpaceForm user={profile} onCancel={() => setDialog(null)} onDone={id => { setDialog(null); setActiveSpaceId(id); setScreen("home"); }} />}
      {dialog === "invite" && <InvitePanel space={activeSpace} profile={profile} onClose={() => setDialog(null)} />}
      {dialog === "join" && <JoinPanel userId={profile.id} onClose={() => setDialog(null)} />}
      {selectedIdea && !dialog && <IdeaDetail idea={selectedIdea} space={activeSpace} profile={profile} onClose={() => setSelectedIdea(null)} onEdit={() => { setEditing(selectedIdea); setSelectedIdea(null); setDialog("idea"); }} />}
    </div>}</AnimatePresence>
  </div>;
}

function InvitePanel({ space, profile, onClose }: { space: SpaceRecord; profile: UserProfile; onClose: () => void }) {
  const [code, setCode] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const make = async () => { setBusy(true); try { setCode((await createInvitation(space, profile.id)).code); } catch (cause) { setError(errorMessage(cause)); } finally { setBusy(false); } };
  return <div className="modal-card small-modal"><div className="form-heading"><div><p className="eyebrow">A low-pressure invitation</p><h2>Invite to {space.emoji} {space.name}</h2></div><button className="icon-button" onClick={onClose}><X /></button></div><p>Generate a code and send it however you normally talk. They can join after creating their own account.</p>{code ? <div className="invite-code"><small>Invitation code</small><strong>{code}</strong><button className="secondary" onClick={() => navigator.clipboard.writeText(code)}>Copy code</button></div> : <button className="primary" onClick={make} disabled={busy}>{busy ? "Creating…" : "Generate invitation code"}</button>}{error && <div className="error">{error}</div>}</div>;
}

function JoinPanel({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [code, setCode] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const join = async () => { setBusy(true); setError(""); try { await joinSpaceByCode(code, userId); onClose(); } catch (cause) { setError(errorMessage(cause)); } finally { setBusy(false); } };
  return <div className="modal-card small-modal"><div className="form-heading"><div><p className="eyebrow">Join someone’s SideQuest</p><h2>Enter invitation code</h2></div><button className="icon-button" onClick={onClose}><X /></button></div><label>Code<input value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={8} placeholder="AB12CD34" /></label>{error && <div className="error">{error}</div>}<button className="primary" disabled={busy || code.length < 6} onClick={join}>{busy ? "Joining…" : "Join Space"}</button></div>;
}

export default function App() {
  const [status, setStatus] = useState<"loading" | "signed-out" | "signed-in">("loading"); const [user, setUser] = useState<User | null>(null); const [profile, setProfile] = useState<UserProfile | null>(null);
  useEffect(() => observeAuth(async current => { if (!current) { setUser(null); setProfile(null); setStatus("signed-out"); return; } try { setUser(current); setProfile(await getUserProfile(current)); setStatus("signed-in"); } catch { setStatus("signed-out"); } }), []);
  if (status === "loading") return <Loading />;
  if (status === "signed-out" || !user || !profile) return <AuthGate onReady={(nextUser, nextProfile) => { setUser(nextUser); setProfile(nextProfile); setStatus("signed-in"); }} />;
  return <MainApp user={user} profile={profile} />;
}
