import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera, MapPin, Plus, Check, Hash, ChevronLeft, ChevronRight,
  Heart, Share2, LogOut, Compass, User, Home, LayoutGrid,
  Activity, UserCircle, X, MessageCircle, Send, Trash2, Edit3,
  Users, CheckCircle2
} from "lucide-react";

// ─── Tokens ──────────────────────────────────────────────────────────────────

const SERIF  = "'Playfair Display', Georgia, serif";
const SANS   = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const BG     = "#0F0E0D";
const CARD   = "#1C1B18";
const TEAL   = "#3D9B89";
const FG     = "#F0EEE8";
const MUTED  = "rgba(240,238,232,0.4)";
const BORDER = "rgba(255,255,255,0.07)";

const SPRING = { type: "spring", damping: 22, stiffness: 300 } as const;

const GLOBALS = `
  * { -webkit-tap-highlight-color: transparent; -webkit-font-smoothing: antialiased; scrollbar-width: none; box-sizing: border-box; }
  ::-webkit-scrollbar { display: none; }
  input, textarea { outline: none; background: transparent; border: none; width: 100%; color: inherit; }
  @keyframes btnGlow {
    0%, 100% { box-shadow: 0 4px 26px rgba(61,155,137,0.30); }
    50% { box-shadow: 0 6px 46px rgba(61,155,137,0.62); }
  }
  @keyframes camPulse {
    0%, 100% { opacity: 0.45; transform: scale(1); }
    50% { opacity: 0.88; transform: scale(1.1); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(var(--rot)); }
    50% { transform: translateY(-8px) rotate(var(--rot)); }
  }
`;

// ─── Photo Helper ─────────────────────────────────────────────────────────────

const PH = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format`;

const ZOE_PH  = PH("photo-1669844444850-5acd7e8c71c5", 64, 64);
const ISA_PH  = PH("photo-1607031542107-f6f46b5d54e9", 64, 64);
const MAYA_PH = PH("photo-1662850886700-4ec19bd30d11", 64, 64);
const SAM_PH  = PH("photo-1489278353717-f64c6ee8a4d2", 64, 64);
const RAMEN   = PH("photo-1526318896980-cf78c088247c", 800, 600);

// ─── Types ────────────────────────────────────────────────────────────────────

type ReactionType = "love" | "down" | "maybe" | "pass";

interface Comment {
  id: number;
  author: string;
  text: string;
  time: string;
}

interface Idea {
  id: number;
  firestoreId?: string;
  spaceId: number;
  title: string;
  category: string;
  categoryEmoji: string;
  accent: string;
  description: string;
  location: string;
  tags: string[];
  photo: string;
  addedBy: string;
  addedAt: string;
  done: boolean;
  completedAt?: string;
  reactions: Partial<Record<string, ReactionType>>;
  comments: Comment[];
}

interface SpaceData {
  id: number;
  name: string;
  emoji: string;
  type: string;
  members: string[];
  ideaCount: number;
  completedCount: number;
  coverPhoto?: string;
}

type Route = "landing" | "auth" | "signin" | "ob_welcome" | "ob_cats" | "ob_name" | "ob_invite" | "inv_landing" | "inv_join" | "app";

// ─── Data ─────────────────────────────────────────────────────────────────────

const IDEAS_INITIAL: Idea[] = [
  {
    id: 1, spaceId: 1, title: "Amalfi Coast Drive", category: "Travel", categoryEmoji: "✈️", accent: "40,110,220",
    description: "Drive the coastal road before we turn 35. Stay in Positano for 3 nights. Sunset dinner at La Tagliata.",
    location: "Positano, Italy", tags: ["bucket-list", "romantic"],
    photo: "photo-1781147049036-385ae99b9aaa", addedBy: "Isaiah", addedAt: "2 days ago",
    done: false,
    reactions: { Isaiah: "down", Zoe: "love" },
    comments: [{ id: 1, author: "Zoe", text: "September is perfect — off-peak crowds, still warm 🌊", time: "1 day ago" }]
  },
  {
    id: 2, spaceId: 1, title: "Hidden Ramen Bar, Tokyo", category: "Food", categoryEmoji: "🍜", accent: "230,118,38",
    description: "That tiny place in Shibuya with the 30-minute wait. So worth it. Cash only, 8 seats.",
    location: "Shibuya, Tokyo", tags: ["japan", "ramen"],
    photo: "photo-1526318896980-cf78c088247c", addedBy: "Zoe", addedAt: "5 days ago",
    done: false,
    reactions: { Isaiah: "down", Zoe: "love" },
    comments: [
      { id: 1, author: "Isaiah", text: "Found they take reservations now via a secret booking page 🍜", time: "4 days ago" },
      { id: 2, author: "Zoe", text: "Adding this to our Japan itinerary for sure!", time: "3 days ago" }
    ]
  },
  {
    id: 3, spaceId: 1, title: "Sunrise at the Arch", category: "Adventure", categoryEmoji: "🏕️", accent: "60,148,90",
    description: "Watch the sunrise through Delicate Arch. Leave camp by 3am. Bring headlamps and a flask.",
    location: "Arches NP, Utah", tags: ["sunrise", "hiking"],
    photo: "photo-1763793927384-6cb47be5b820", addedBy: "Isaiah", addedAt: "1 week ago",
    done: false,
    reactions: { Zoe: "maybe" },
    comments: []
  },
  {
    id: 4, spaceId: 1, title: "Jazz Night, Blue Note", category: "Concert", categoryEmoji: "🎵", accent: "148,68,220",
    description: "Catch a late set at the Blue Note. Dress up. Make it a whole evening — dinner at the bar upstairs first.",
    location: "Greenwich Village, NYC", tags: ["jazz", "date-night"],
    photo: "photo-1470229722913-7c0e2dbbafd3", addedBy: "Zoe", addedAt: "2 weeks ago",
    done: true, completedAt: "Last Thursday",
    reactions: { Isaiah: "love", Zoe: "love" },
    comments: [{ id: 1, author: "Isaiah", text: "That was the best night we've had in months 🎷", time: "Last Thursday" }]
  },
  {
    id: 5, spaceId: 1, title: "Sakura Season, Kyoto", category: "Travel", categoryEmoji: "✈️", accent: "40,110,220",
    description: "Philosopher's Path during peak bloom. Book accommodation 8 months ahead — sells out every year.",
    location: "Kyoto, Japan", tags: ["japan", "spring"],
    photo: "photo-1522547902298-51566e4fb383", addedBy: "Isaiah", addedAt: "3 weeks ago",
    done: false,
    reactions: { Zoe: "down" },
    comments: []
  },
  {
    id: 6, spaceId: 1, title: "Rooftop Cinema Night", category: "Together", categoryEmoji: "❤️", accent: "190,60,80",
    description: "Find a rooftop movie screening this summer. Bring wine and blankets. Dress for cold.",
    location: "New York City", tags: ["summer", "movies"],
    photo: "photo-1663791562062-1f6c26f83d4c", addedBy: "Zoe", addedAt: "1 month ago",
    done: false,
    reactions: { Isaiah: "love" },
    comments: [{ id: 1, author: "Isaiah", text: "Found one in Brooklyn this August — Moonrise Kingdom showing 🎬", time: "3 weeks ago" }]
  },
  {
    id: 7, spaceId: 1, title: "Milky Way Camping", category: "Adventure", categoryEmoji: "🏕️", accent: "60,148,90",
    description: "Dark sky camping. Zero light pollution. Long exposure photography all night.",
    location: "Big Bend, Texas", tags: ["camping", "stars"],
    photo: "photo-1506475043624-3f8371a12b33", addedBy: "Isaiah", addedAt: "1 month ago",
    done: false,
    reactions: { Zoe: "maybe" },
    comments: []
  },
];

const SPACES_INITIAL: SpaceData[] = [
  { id: 1, name: "Isaiah & Zoe", emoji: "❤️", type: "Partner", members: ["Isaiah","Zoe"], ideaCount: 7, completedCount: 1, coverPhoto: "photo-1781147049036-385ae99b9aaa" },
  { id: 2, name: "Solo Adventures", emoji: "🧭", type: "Solo", members: ["Isaiah"], ideaCount: 0, completedCount: 0 },
];

const ACTIVITY_DATA = [
  { id: 1, userName: "Zoe", userPhoto: ZOE_PH, action: "added", targetTitle: "Sakura Season, Kyoto", targetEmoji: "✈️", time: "2h ago" },
  { id: 2, userName: "You", userPhoto: ISA_PH, action: "completed", targetTitle: "Jazz Night, Blue Note", targetEmoji: "🎵", time: "Yesterday" },
  { id: 3, userName: "Zoe", userPhoto: ZOE_PH, action: "loved", targetTitle: "Amalfi Coast Drive", targetEmoji: "✈️", time: "2 days ago" },
  { id: 4, userName: "You", userPhoto: ISA_PH, action: "added", targetTitle: "Sunrise at the Arch", targetEmoji: "🏕️", time: "1 week ago" },
  { id: 5, userName: "Zoe", userPhoto: ZOE_PH, action: "added", targetTitle: "Hidden Ramen Bar, Tokyo", targetEmoji: "🍜", time: "1 week ago" },
];

const CATS_DATA = [
  { emoji: "🍜", label: "Food",      accent: "230,118,38" },
  { emoji: "✈️", label: "Travel",    accent: "40,110,220" },
  { emoji: "🎵", label: "Concert",   accent: "148,68,220" },
  { emoji: "🏕️", label: "Adventure", accent: "60,148,90"  },
  { emoji: "🎁", label: "Gift",      accent: "210,148,40" },
  { emoji: "❤️", label: "Together",  accent: "190,60,80"  },
];

const SPACE_EMOJIS = ["❤️", "🧭", "✨", "🌍", "🎯", "🔥", "🏔️", "🎪"];

const REACTION_DEFS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "love",  emoji: "❤️",  label: "Love"  },
  { type: "down",  emoji: "👍",  label: "Down"  },
  { type: "maybe", emoji: "🤔", label: "Maybe" },
  { type: "pass",  emoji: "👎",  label: "Pass"  },
];

// ─── Shared Components ────────────────────────────────────────────────────────

function CompassLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="17" stroke={TEAL} strokeWidth="1.5" />
      <circle cx="18" cy="18" r="2" fill={TEAL} />
      <polygon points="18,4 20,18 18,16 16,18" fill={TEAL} />
      <polygon points="18,32 20,18 18,20 16,18" fill={FG} opacity="0.5" />
      <polygon points="4,18 18,16 16,18 18,20" fill={FG} opacity="0.5" />
      <polygon points="32,18 18,16 20,18 18,20" fill={FG} opacity="0.3" />
      <line x1="18" y1="2" x2="18" y2="6" stroke={TEAL} strokeWidth="1" />
      <line x1="18" y1="30" x2="18" y2="34" stroke={FG} strokeWidth="1" opacity="0.5" />
      <line x1="2" y1="18" x2="6" y2="18" stroke={FG} strokeWidth="1" opacity="0.5" />
      <line x1="30" y1="18" x2="34" y2="18" stroke={FG} strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function StatusBar() {
  return (
    <div style={{ height: 48, background: BG, display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
      <span style={{ fontFamily: SANS, fontSize: 13, color: FG, fontWeight: 600 }}>9:41</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <svg width="17" height="12" viewBox="0 0 17 12" fill={FG}>
          <rect x="0" y="4" width="3" height="8" rx="1" />
          <rect x="4.5" y="2.5" width="3" height="9.5" rx="1" />
          <rect x="9" y="1" width="3" height="11" rx="1" />
          <rect x="13.5" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill={FG}>
          <path d="M8 2.4C5.6 2.4 3.4 3.4 1.8 5L0 3.2C2.2 1.2 5 0 8 0s5.8 1.2 8 3.2L14.2 5C12.6 3.4 10.4 2.4 8 2.4z" />
          <path d="M8 6.6c-1.4 0-2.6.6-3.4 1.4L3 6.4C4.2 5.2 6 4.4 8 4.4s3.8.8 5 2L11.4 8C10.6 7.2 9.4 6.6 8 6.6z" />
          <circle cx="8" cy="11" r="1.5" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke={FG} strokeOpacity="0.35" />
          <rect x="2" y="2" width="16" height="8" rx="2" fill={FG} />
          <path d="M23 4v4a2 2 0 000-4z" fill={FG} fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
}

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 24 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6, height: 6,
          borderRadius: 3, background: i === current ? TEAL : "rgba(255,255,255,0.2)",
          transition: "all 0.3s ease"
        }} />
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color: MUTED, marginBottom: 12 }}>
      {children}
    </div>
  );
}

function TealButton({ children, onClick, disabled, style }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; style?: React.CSSProperties;
}) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} disabled={disabled}
      style={{ width: "100%", padding: "16px", borderRadius: 16, border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? "rgba(61,155,137,0.3)" : `linear-gradient(135deg, ${TEAL}, #2d7a6a)`,
        color: disabled ? "rgba(255,255,255,0.4)" : FG, fontFamily: SANS, fontSize: 16, fontWeight: 600,
        animation: disabled ? "none" : "btnGlow 3s ease infinite", ...style }}>
      {children}
    </motion.button>
  );
}

function Avatar({ src, size = 36, style }: { src: string; size?: number; style?: React.CSSProperties }) {
  return (
    <img src={src} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover",
      border: `2px solid ${CARD}`, ...style }} />
  );
}

function memberPhoto(name: string) {
  if (name === "Zoe") return ZOE_PH;
  if (name === "Maya") return MAYA_PH;
  if (name === "Sam") return SAM_PH;
  return ISA_PH;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -50, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: -50, opacity: 0, x: "-50%" }}
          transition={SPRING}
          style={{ position: "absolute", top: 56, left: "50%", zIndex: 200,
            background: CARD, border: `1px solid rgba(61,155,137,0.5)`, borderRadius: 24,
            padding: "10px 20px", display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)", whiteSpace: "nowrap" }}>
          <CheckCircle2 size={16} color={TEAL} />
          <span style={{ fontFamily: SANS, fontSize: 14, color: FG, fontWeight: 600 }}>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Idea Card ────────────────────────────────────────────────────────────────

function IdeaCard({ idea, onPress }: { idea: Idea; onPress: () => void }) {
  const totalReactions = Object.keys(idea.reactions).length;
  return (
    <motion.div whileTap={{ scale: 0.98 }} onClick={onPress}
      style={{ background: CARD, borderRadius: 20, overflow: "hidden", marginBottom: 16,
        border: `1px solid ${BORDER}`, cursor: "pointer" }}>
      <div style={{ position: "relative", height: 180 }}>
        <img src={PH(idea.photo, 800, 600)} alt={idea.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {idea.done && (
          <div style={{ position: "absolute", bottom: 10, left: 10, background: TEAL, color: FG,
            borderRadius: 20, padding: "4px 12px", fontFamily: SANS, fontSize: 12, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 4 }}>
            <Check size={12} /> Completed
          </div>
        )}
        <div style={{ position: "absolute", top: 10, left: 10,
          background: `rgba(${idea.accent},0.85)`, borderRadius: 20, padding: "4px 10px",
          fontFamily: SANS, fontSize: 11, fontWeight: 600, color: FG,
          backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: 4 }}>
          {idea.categoryEmoji} {idea.category}
        </div>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ fontFamily: SERIF, fontSize: 18, color: FG, marginBottom: 6, lineHeight: 1.3 }}>
          {idea.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
          <MapPin size={12} color={TEAL} />
          <span style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>{idea.location}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 14 }}>
            {totalReactions > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 13 }}>❤️</span>
                <span style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>{totalReactions}</span>
              </div>
            )}
            {idea.comments.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <MessageCircle size={13} color={MUTED} />
                <span style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>{idea.comments.length}</span>
              </div>
            )}
          </div>
          <Avatar src={memberPhoto(idea.addedBy)} size={28} style={{ border: `2px solid ${BORDER}` }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────

function BottomNav({ active, onNav, onAdd }: {
  active: number; onNav: (tab: number) => void; onAdd: () => void;
}) {
  const items = [
    { tab: 0, icon: Home, label: "Home" },
    { tab: 1, icon: LayoutGrid, label: "Spaces" },
    { tab: -1, icon: Plus, label: "Add", special: true },
    { tab: 3, icon: Activity, label: "Activity" },
    { tab: 4, icon: UserCircle, label: "Profile" },
  ];
  return (
    <div style={{ height: 64, background: CARD, borderTop: `1px solid ${BORDER}`,
      display: "flex", alignItems: "center", justifyContent: "space-around",
      padding: "0 8px", flexShrink: 0 }}>
      {items.map((item) => {
        const Icon = item.icon;
        if ((item as any).special) {
          return (
            <motion.button key="add" whileTap={{ scale: 0.9 }} onClick={onAdd}
              style={{ width: 48, height: 48, borderRadius: "50%", background: TEAL, border: "none",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(61,155,137,0.4)" }}>
              <Plus size={22} color={FG} />
            </motion.button>
          );
        }
        const isActive = active === item.tab;
        return (
          <motion.button key={item.tab} whileTap={{ scale: 0.9 }} onClick={() => onNav(item.tab)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}>
            <Icon size={22} color={isActive ? TEAL : MUTED} />
            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: isActive ? 600 : 400,
              color: isActive ? TEAL : MUTED }}>{item.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── App Header ───────────────────────────────────────────────────────────────

function AppHeader({ activeSpace, onOpenSwitcher, onOpenProfile }: {
  activeSpace: SpaceData; onOpenSwitcher: () => void; onOpenProfile: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 20px 12px" }}>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onOpenSwitcher}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)",
          borderRadius: 20, padding: "6px 14px 6px 10px", border: `1px solid ${BORDER}`,
          cursor: "pointer" }}>
        <span style={{ fontSize: 14 }}>{activeSpace.emoji}</span>
        <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: FG }}>{activeSpace.name}</span>
        <ChevronRight size={14} color={MUTED} />
      </motion.button>
      <motion.button whileTap={{ scale: 0.9 }} onClick={onOpenProfile}
        style={{ width: 36, height: 36, borderRadius: "50%", background: TEAL,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "none", cursor: "pointer" }}>
        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: FG }}>IA</span>
      </motion.button>
    </div>
  );
}

// ─── Space Switcher Modal ─────────────────────────────────────────────────────

function SpaceSwitcherModal({ spaces, activeSpaceId, onSwitch, onClose }: {
  spaces: SpaceData[]; activeSpaceId: number; onSwitch: (id: number) => void; onClose: () => void;
}) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 58 }} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={SPRING}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: CARD,
          borderRadius: "20px 20px 0 0", zIndex: 59, border: `1px solid ${BORDER}`,
          paddingBottom: "env(safe-area-inset-bottom, 16px)" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: BORDER }} />
        </div>
        <div style={{ padding: "4px 20px 28px" }}>
          <SectionLabel>Switch Space</SectionLabel>
          {spaces.map(space => {
            const isActive = space.id === activeSpaceId;
            return (
              <motion.button key={space.id} whileTap={{ scale: 0.97 }}
                onClick={() => { onSwitch(space.id); onClose(); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 14, marginBottom: 8,
                  background: isActive ? "rgba(61,155,137,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${isActive ? TEAL : BORDER}`, cursor: "pointer" }}>
                <span style={{ fontSize: 20 }}>{space.emoji}</span>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: FG }}>{space.name}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED }}>
                    {space.type} · {space.members.length} {space.members.length === 1 ? "member" : "members"}
                  </div>
                </div>
                {isActive && <CheckCircle2 size={18} color={TEAL} />}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}

// ─── Landing Screen ───────────────────────────────────────────────────────────

function LandingScreen({ setRoute }: { setRoute: (r: Route) => void }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: BG, overflow: "hidden" }}>
      <StatusBar />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 20px" }}>
        <CompassLogo size={32} />
        <span style={{ fontFamily: SERIF, fontSize: 24, color: FG, fontWeight: 700, letterSpacing: "-0.02em" }}>
          SideQuest
        </span>
      </div>
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <svg viewBox="0 0 375 320" style={{ width: "100%", position: "absolute", bottom: 0 }}>
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a0a2e" />
              <stop offset="60%" stopColor="#2d1b4e" />
              <stop offset="100%" stopColor="#7c3a2a" />
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="60%" r="40%">
              <stop offset="0%" stopColor="#ff9060" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ff9060" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="375" height="320" fill="url(#sky)" />
          <ellipse cx="188" cy="195" rx="160" ry="80" fill="url(#glow)" />
          <polygon points="0,240 80,100 160,200 240,80 320,160 375,120 375,320 0,320" fill="#1a1520" />
          <polygon points="0,280 60,160 140,240 200,140 280,220 375,170 375,320 0,320" fill="#231d2a" />
          <rect x="0" y="290" width="375" height="30" fill="#2a2030" />
          <circle cx="155" cy="270" r="6" fill="#F0EEE8" />
          <line x1="155" y1="276" x2="155" y2="292" stroke="#F0EEE8" strokeWidth="2" />
          <line x1="145" y1="282" x2="165" y2="282" stroke="#F0EEE8" strokeWidth="2" />
          <line x1="155" y1="292" x2="148" y2="304" stroke="#F0EEE8" strokeWidth="2" />
          <line x1="155" y1="292" x2="162" y2="304" stroke="#F0EEE8" strokeWidth="2" />
          <circle cx="220" cy="270" r="6" fill={TEAL} />
          <line x1="220" y1="276" x2="220" y2="292" stroke={TEAL} strokeWidth="2" />
          <line x1="210" y1="282" x2="230" y2="282" stroke={TEAL} strokeWidth="2" />
          <line x1="220" y1="292" x2="213" y2="304" stroke={TEAL} strokeWidth="2" />
          <line x1="220" y1="292" x2="227" y2="304" stroke={TEAL} strokeWidth="2" />
          {[[30,40],[80,25],[140,35],[260,20],[310,45],[350,30],[50,70],[290,65]].map(([x,y],i) => (
            <circle key={i} cx={x} cy={y} r="1.5" fill={FG} opacity="0.6" />
          ))}
        </svg>
        <div style={{ position: "absolute", top: 20, left: 16, zIndex: 2,
          "--rot": "-4deg", animation: "float 4s ease-in-out infinite"
        } as React.CSSProperties}>
          <FloatingIdeaCard photo={RAMEN} title="Hidden Ramen Bar" category="🍜 Food" accent="230,118,38" rotation="-4deg" />
        </div>
        <div style={{ position: "absolute", top: 40, right: 16, zIndex: 2,
          "--rot": "5deg", animation: "float 5s ease-in-out infinite 1s"
        } as React.CSSProperties}>
          <FloatingIdeaCard photo={PH("photo-1781147049036-385ae99b9aaa", 200, 140)} title="Amalfi Coast Drive" category="✈️ Travel" accent="40,110,220" rotation="5deg" />
        </div>
      </div>
      <div style={{ padding: "24px 24px 32px", display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontFamily: SERIF, fontSize: 22, color: FG, textAlign: "center",
          margin: "0 0 8px", fontStyle: "italic", lineHeight: 1.4 }}>
          Collect ideas today.<br />Live them tomorrow.
        </p>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setRoute("app")}
          style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", cursor: "pointer",
            background: FG, color: "#0F0E0D", fontFamily: SANS, fontSize: 16, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 0C4.03 0 0 4.03 0 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 2c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.14-7-7 3.14-7 7-7z" fill="#0F0E0D" />
          </svg>
          Continue with Apple
        </motion.button>
        <TealButton onClick={() => setRoute("auth")}>Create Account</TealButton>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setRoute("signin")}
          style={{ background: "none", border: "none", color: MUTED, fontFamily: SANS,
            fontSize: 14, cursor: "pointer", padding: "6px" }}>
          Sign in
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setRoute("inv_landing")}
          style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 12,
            color: MUTED, fontFamily: SANS, fontSize: 13, cursor: "pointer", padding: "10px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          📨 Demo: Open invite from Isaiah →
        </motion.button>
      </div>
    </div>
  );
}

function FloatingIdeaCard({ photo, title, category, accent, rotation }: {
  photo: string; title: string; category: string; accent: string; rotation: string;
}) {
  return (
    <div style={{ width: 140, borderRadius: 14, overflow: "hidden", background: CARD,
      border: `1px solid ${BORDER}`, transform: `rotate(${rotation})`,
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <img src={photo} alt="" style={{ width: "100%", height: 80, objectFit: "cover" }} />
      <div style={{ padding: "8px 10px" }}>
        <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 600, color: `rgb(${accent})`, marginBottom: 3 }}>{category}</div>
        <div style={{ fontFamily: SERIF, fontSize: 11, color: FG, lineHeight: 1.3 }}>{title}</div>
      </div>
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────

function AuthScreen({ mode, setRoute }: { mode: "create" | "signin"; setRoute: (r: Route) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    if (mode === "create") {
      setRoute("ob_welcome");
    } else {
      setRoute("app");
    }
  };

  const isSignIn = mode === "signin";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: BG }}>
      <StatusBar />
      <div style={{ padding: "16px 24px 24px" }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setRoute("landing")}
          style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12,
            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", marginBottom: 32 }}>
          <ChevronLeft size={20} color={FG} />
        </motion.button>
        <h1 style={{ fontFamily: SERIF, fontSize: 28, color: FG, margin: "0 0 8px", fontWeight: 700 }}>
          {isSignIn ? "Welcome back" : "Create your account"}
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, margin: "0 0 36px" }}>
          {isSignIn ? "Sign in to pick up where you left off." : "Start collecting adventure ideas with someone you love."}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "14px 16px" }}>
            <div style={{ fontFamily: SANS, fontSize: 11, color: MUTED, fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Email</div>
            <input value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
              type="email" placeholder="you@example.com"
              style={{ fontFamily: SANS, fontSize: 16, color: FG }} />
          </div>
          <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "14px 16px" }}>
            <div style={{ fontFamily: SANS, fontSize: 11, color: MUTED, fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Password</div>
            <input value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
              type="password" placeholder="••••••••"
              style={{ fontFamily: SANS, fontSize: 16, color: FG }} />
          </div>
          {error && (
            <div style={{ fontFamily: SANS, fontSize: 13, color: "#e55", padding: "8px 12px",
              background: "rgba(220,80,80,0.1)", borderRadius: 10, border: "1px solid rgba(220,80,80,0.2)" }}>
              {error}
            </div>
          )}
        </div>
        <div style={{ marginTop: 24 }}>
          <TealButton onClick={handleContinue}>{isSignIn ? "Sign In →" : "Continue →"}</TealButton>
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          {isSignIn ? (
            <>
              <span style={{ fontFamily: SANS, fontSize: 14, color: MUTED }}>New here? </span>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setRoute("auth")}
                style={{ background: "none", border: "none", color: TEAL, fontFamily: SANS,
                  fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Create account</motion.button>
            </>
          ) : (
            <>
              <span style={{ fontFamily: SANS, fontSize: 14, color: MUTED }}>Already have an account? </span>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setRoute("signin")}
                style={{ background: "none", border: "none", color: TEAL, fontFamily: SANS,
                  fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Sign in</motion.button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Onboarding: Welcome ──────────────────────────────────────────────────────

function OnbWelcome({ setRoute }: { setRoute: (r: Route) => void }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: BG }}>
      <StatusBar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setRoute("auth")}
            style={{ background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4, color: MUTED, fontFamily: SANS, fontSize: 14, padding: 0 }}>
            <ChevronLeft size={18} color={MUTED} /> Back
          </motion.button>
        </div>
        <ProgressDots total={4} current={0} />
        <h1 style={{ fontFamily: SERIF, fontSize: 28, color: FG, margin: "0 0 12px", fontWeight: 700 }}>
          Welcome, Isaiah 👋
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 15, color: MUTED, margin: "0 0 40px", lineHeight: 1.6 }}>
          SideQuest helps you collect ideas with someone you love — and actually live them.
        </p>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative", width: 260, height: 120 }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 140, height: 120, borderRadius: "50%",
              background: "rgba(61,155,137,0.2)", border: "2px solid rgba(61,155,137,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ marginRight: 40 }}>
                <Avatar src={ISA_PH} size={44} style={{ border: `3px solid ${TEAL}` }} />
                <div style={{ fontFamily: SANS, fontSize: 11, color: MUTED, textAlign: "center", marginTop: 4 }}>Isaiah</div>
              </div>
            </div>
            <div style={{ position: "absolute", right: 0, top: 0, width: 140, height: 120, borderRadius: "50%",
              background: "rgba(220,80,100,0.15)", border: "2px solid rgba(220,80,100,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ marginLeft: 40 }}>
                <Avatar src={ZOE_PH} size={44} style={{ border: "3px solid #dc5064" }} />
                <div style={{ fontFamily: SANS, fontSize: 11, color: MUTED, textAlign: "center", marginTop: 4 }}>Zoe</div>
              </div>
            </div>
            <div style={{ position: "absolute", left: "50%", top: "50%",
              transform: "translate(-50%, -50%)", fontSize: 24, zIndex: 2 }}>❤️</div>
          </div>
        </div>
        <TealButton onClick={() => setRoute("ob_cats")}>Let's get started →</TealButton>
      </div>
    </div>
  );
}

// ─── Onboarding: Categories ───────────────────────────────────────────────────

function OnbCategories({ setRoute }: { setRoute: (r: Route) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (label: string) =>
    setSelected(s => s.includes(label) ? s.filter(x => x !== label) : [...s, label]);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: BG }}>
      <StatusBar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setRoute("ob_welcome")}
            style={{ background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4, color: MUTED, fontFamily: SANS, fontSize: 14, padding: 0 }}>
            <ChevronLeft size={18} color={MUTED} /> Back
          </motion.button>
        </div>
        <ProgressDots total={4} current={1} />
        <h1 style={{ fontFamily: SERIF, fontSize: 26, color: FG, margin: "0 0 8px", fontWeight: 700 }}>
          What do you like to plan?
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, margin: "0 0 28px" }}>
          Select all that apply. You can change this later.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 }}>
          {CATS_DATA.map(cat => {
            const isSelected = selected.includes(cat.label);
            return (
              <motion.button key={cat.label} whileTap={{ scale: 0.93 }} onClick={() => toggle(cat.label)}
                style={{ background: isSelected ? `rgba(${cat.accent},0.2)` : CARD,
                  border: `2px solid ${isSelected ? `rgb(${cat.accent})` : BORDER}`,
                  borderRadius: 16, padding: "16px 8px", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 28 }}>{cat.emoji}</span>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600,
                  color: isSelected ? `rgb(${cat.accent})` : MUTED }}>{cat.label}</span>
              </motion.button>
            );
          })}
        </div>
        <TealButton onClick={() => setRoute("ob_name")} disabled={selected.length === 0}>
          Continue
        </TealButton>
      </div>
    </div>
  );
}

// ─── Onboarding: Name Space ───────────────────────────────────────────────────

function OnbNameSpace({ setRoute }: { setRoute: (r: Route) => void }) {
  const [name, setName] = useState("Isaiah & Zoe");
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: BG }}>
      <StatusBar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setRoute("ob_cats")}
            style={{ background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4, color: MUTED, fontFamily: SANS, fontSize: 14, padding: 0 }}>
            <ChevronLeft size={18} color={MUTED} /> Back
          </motion.button>
        </div>
        <ProgressDots total={4} current={2} />
        <h1 style={{ fontFamily: SERIF, fontSize: 26, color: FG, margin: "0 0 8px", fontWeight: 700 }}>
          Name your space
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, margin: "0 0 28px" }}>
          This is where your ideas will live.
        </p>
        <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`,
          padding: "14px 16px", marginBottom: 24 }}>
          <div style={{ fontFamily: SANS, fontSize: 11, color: MUTED, fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Space Name</div>
          <input value={name} onChange={e => setName(e.target.value)}
            style={{ fontFamily: SERIF, fontSize: 18, color: FG }} />
        </div>
        <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "16px",
          display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <span style={{ fontSize: 24 }}>❤️</span>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 16, color: FG, fontWeight: 600 }}>{name || "Your Space"}</div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED }}>2 members</div>
          </div>
        </div>
        <TealButton onClick={() => setRoute("ob_invite")}>Continue</TealButton>
      </div>
    </div>
  );
}

// ─── Onboarding: Invite ───────────────────────────────────────────────────────

function OnbInvite({ setRoute }: { setRoute: (r: Route) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const contacts = [
    { name: "Zoe Martinez", handle: "@zoe", photo: ZOE_PH },
    { name: "Maya Chen", handle: "@maya", photo: MAYA_PH },
    { name: "Sam Rivers", handle: "@sam", photo: SAM_PH },
  ];
  const toggle = (name: string) =>
    setSelected(s => s.includes(name) ? s.filter(x => x !== name) : [...s, name]);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: BG }}>
      <StatusBar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setRoute("ob_name")}
            style={{ background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4, color: MUTED, fontFamily: SANS, fontSize: 14, padding: 0 }}>
            <ChevronLeft size={18} color={MUTED} /> Back
          </motion.button>
        </div>
        <ProgressDots total={4} current={3} />
        <h1 style={{ fontFamily: SERIF, fontSize: 26, color: FG, margin: "0 0 8px", fontWeight: 700 }}>
          Invite your adventure partner
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, margin: "0 0 28px" }}>
          Choose someone to share ideas with.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
          {contacts.map(c => {
            const isSelected = selected.includes(c.name);
            return (
              <motion.button key={c.name} whileTap={{ scale: 0.97 }} onClick={() => toggle(c.name)}
                style={{ background: isSelected ? "rgba(61,155,137,0.1)" : CARD,
                  border: `1.5px solid ${isSelected ? TEAL : BORDER}`,
                  borderRadius: 16, padding: "14px 16px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                <Avatar src={c.photo} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: FG }}>{c.name}</div>
                  <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>{c.handle}</div>
                </div>
                {isSelected && (
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: TEAL,
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={14} color={FG} />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
        <TealButton onClick={() => setRoute("app")} disabled={selected.length === 0}>
          Send Invite & Continue
        </TealButton>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setRoute("app")}
          style={{ background: "none", border: "none", color: MUTED, fontFamily: SANS,
            fontSize: 14, cursor: "pointer", padding: "14px", marginTop: 4 }}>
          Skip for now
        </motion.button>
      </div>
    </div>
  );
}

// ─── Invite Landing Screen ────────────────────────────────────────────────────

function InviteLandingScreen({ setRoute }: { setRoute: (r: Route) => void }) {
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: BG, overflow: "hidden" }}>
      <StatusBar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px", overflowY: "auto" }}>
        {/* Back */}
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setRoute("landing")}
          style={{ background: "none", border: "none", cursor: "pointer", alignSelf: "flex-start",
            display: "flex", alignItems: "center", gap: 4, color: MUTED, fontFamily: SANS, fontSize: 14,
            padding: 0, marginBottom: 32 }}>
          <ChevronLeft size={18} color={MUTED} /> Back
        </motion.button>

        {/* Inviter */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <Avatar src={ISA_PH} size={80} style={{ border: `3px solid ${TEAL}` }} />
            <div style={{ position: "absolute", bottom: 0, right: -4, width: 28, height: 28,
              background: TEAL, borderRadius: "50%", border: `2px solid ${BG}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              📨
            </div>
          </div>
          <span style={{ fontFamily: SANS, fontSize: 15, color: MUTED, marginBottom: 6 }}>
            <span style={{ color: FG, fontWeight: 600 }}>Isaiah Johnson</span> invited you to join
          </span>
        </div>

        {/* Space Card */}
        <div style={{ background: CARD, borderRadius: 24, border: `1px solid ${BORDER}`,
          padding: "24px", marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>❤️</div>
          <div style={{ fontFamily: SERIF, fontSize: 24, color: FG, fontWeight: 700, marginBottom: 6 }}>
            Isaiah & Zoe
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED, marginBottom: 20 }}>
            Partner Space · collecting adventures together
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Avatar src={ISA_PH} size={40} style={{ border: `2px solid ${TEAL}` }} />
              <div style={{ width: 40, height: 40, borderRadius: "50%",
                border: `2px dashed ${TEAL}`, background: "rgba(61,155,137,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 18 }}>?</span>
              </div>
            </div>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED, marginTop: 8 }}>
            Isaiah is waiting for you
          </div>
        </div>

        {!showAuth ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setRoute("inv_join")}
              style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", cursor: "pointer",
                background: FG, color: "#0F0E0D", fontFamily: SANS, fontSize: 16, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 0C4.03 0 0 4.03 0 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 2c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.14-7-7 3.14-7 7-7z" fill="#0F0E0D" />
              </svg>
              Continue with Apple
            </motion.button>
            <TealButton onClick={() => setShowAuth(true)}>Create Account</TealButton>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setRoute("inv_join")}
              style={{ background: "none", border: "none", color: MUTED, fontFamily: SANS,
                fontSize: 14, cursor: "pointer", padding: "6px" }}>
              Already have an account? Sign in
            </motion.button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "14px 16px" }}>
              <div style={{ fontFamily: SANS, fontSize: 11, color: MUTED, fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Email</div>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com"
                style={{ fontFamily: SANS, fontSize: 16, color: FG }} />
            </div>
            <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "14px 16px" }}>
              <div style={{ fontFamily: SANS, fontSize: 11, color: MUTED, fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Password</div>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••"
                style={{ fontFamily: SANS, fontSize: 16, color: FG }} />
            </div>
            <TealButton onClick={() => setRoute("inv_join")}>Create Account & Join →</TealButton>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Invite Join Screen ───────────────────────────────────────────────────────

function InviteJoinScreen({ setRoute }: { setRoute: (r: Route) => void }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: BG }}>
      <StatusBar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "32px 24px" }}>
        {/* Success animation area */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 16, stiffness: 200 }}
          style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>🎉</div>
        </motion.div>

        <h1 style={{ fontFamily: SERIF, fontSize: 28, color: FG, margin: "0 0 12px",
          fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>
          You're in!
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 15, color: MUTED, textAlign: "center",
          lineHeight: 1.6, margin: "0 0 36px" }}>
          You've joined <span style={{ color: FG, fontWeight: 600 }}>Isaiah & Zoe</span>.
          Time to start planning your next adventure together.
        </p>

        {/* Space card */}
        <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`,
          padding: "20px 24px", width: "100%", marginBottom: 36, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 36 }}>❤️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: SERIF, fontSize: 18, color: FG, fontWeight: 600, marginBottom: 4 }}>Isaiah & Zoe</div>
            <div style={{ display: "flex" }}>
              <Avatar src={ISA_PH} size={24} style={{ border: `2px solid ${CARD}` }} />
              <Avatar src={ZOE_PH} size={24} style={{ marginLeft: -8, border: `2px solid ${CARD}` }} />
              <span style={{ fontFamily: SANS, fontSize: 12, color: MUTED, marginLeft: 8, alignSelf: "center" }}>
                Isaiah & Zoe
              </span>
            </div>
          </div>
          <CheckCircle2 size={22} color={TEAL} />
        </div>

        <TealButton onClick={() => setRoute("app")}>Open our Space →</TealButton>
      </div>
    </div>
  );
}

// ─── Home Feed ────────────────────────────────────────────────────────────────

function HomeFeed({ ideas, activeSpace, spaces, onIdeaPress, onOpenSwitcher, onOpenProfile }: {
  ideas: Idea[]; activeSpace: SpaceData; spaces: SpaceData[];
  onIdeaPress: (idea: Idea) => void; onOpenSwitcher: () => void; onOpenProfile: () => void;
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const spaceIdeas = ideas.filter(i => i.spaceId === activeSpace.id && !i.done);
  const categories = Array.from(new Set(spaceIdeas.map(i => i.category)));
  const filters = ["All", ...categories];
  const filtered = activeFilter === "All" ? spaceIdeas : spaceIdeas.filter(i => i.category === activeFilter);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <AppHeader activeSpace={activeSpace} onOpenSwitcher={onOpenSwitcher} onOpenProfile={onOpenProfile} />
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 20px 14px",
        scrollbarWidth: "none", flexShrink: 0 }}>
        {filters.map(f => (
          <motion.button key={f} whileTap={{ scale: 0.93 }} onClick={() => setActiveFilter(f)}
            style={{ flexShrink: 0, padding: "7px 16px", borderRadius: 20, border: "none",
              cursor: "pointer", fontFamily: SANS, fontSize: 13, fontWeight: activeFilter === f ? 600 : 400,
              background: activeFilter === f ? TEAL : CARD, color: activeFilter === f ? FG : MUTED }}>
            {f}
          </motion.button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}>
        {filtered.length === 0 && spaceIdeas.length > 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <div style={{ fontFamily: SERIF, fontSize: 18, color: FG, marginBottom: 8 }}>No {activeFilter} ideas yet</div>
            <div style={{ fontFamily: SANS, fontSize: 14, color: MUTED }}>Add your first {activeFilter.toLowerCase()} idea with the + button.</div>
          </div>
        )}
        {spaceIdeas.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <CompassLogo size={52} />
            <div style={{ fontFamily: SERIF, fontSize: 20, color: FG, margin: "20px 0 8px" }}>No ideas yet</div>
            <div style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
              Tap + to add your first idea to {activeSpace.name}.
            </div>
          </div>
        )}
        {filtered.map(idea => (
          <IdeaCard key={idea.id} idea={idea} onPress={() => onIdeaPress(idea)} />
        ))}
      </div>
    </div>
  );
}

// ─── Spaces Screen ────────────────────────────────────────────────────────────

function SpacesScreen({ spaces, ideas, onSpacePress, onCreateSpace }: {
  spaces: SpaceData[]; ideas: Idea[]; onSpacePress: (s: SpaceData) => void; onCreateSpace: () => void;
}) {
  return (
    <div style={{ height: "100%", overflowY: "auto" }}>
      <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 26, color: FG, margin: 0, fontWeight: 700 }}>Spaces</h1>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onCreateSpace}
          style={{ width: 36, height: 36, borderRadius: "50%", background: TEAL,
            border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Plus size={18} color={FG} />
        </motion.button>
      </div>
      <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        {spaces.map(space => {
          const spaceActiveIdeas = ideas.filter(i => i.spaceId === space.id && !i.done);
          const spaceCompletedIdeas = ideas.filter(i => i.spaceId === space.id && i.done);
          const coverIdeas = ideas.filter(i => i.spaceId === space.id).slice(0, 4);
          return (
            <motion.div key={space.id} whileTap={{ scale: 0.97 }} onClick={() => onSpacePress(space)}
              style={{ background: CARD, borderRadius: 20, overflow: "hidden",
                border: `1px solid ${BORDER}`, cursor: "pointer" }}>
              {coverIdeas.length >= 4 ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: 130 }}>
                  {coverIdeas.map((idea, i) => (
                    <img key={i} src={PH(idea.photo, 200, 130)} alt=""
                      style={{ width: "100%", height: 65, objectFit: "cover" }} />
                  ))}
                </div>
              ) : coverIdeas.length > 0 ? (
                <img src={PH(coverIdeas[0].photo, 800, 300)} alt=""
                  style={{ width: "100%", height: 100, objectFit: "cover" }} />
              ) : (
                <div style={{ height: 100, background: `linear-gradient(135deg, ${TEAL}33, ${TEAL}11)`,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 40 }}>{space.emoji}</span>
                </div>
              )}
              <div style={{ padding: "14px 16px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{space.emoji}</span>
                  <span style={{ fontFamily: SERIF, fontSize: 18, color: FG, fontWeight: 600 }}>{space.name}</span>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED, marginBottom: 12 }}>{space.type} Space</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>
                    {spaceActiveIdeas.length} active
                    {spaceCompletedIdeas.length > 0 ? ` · ${spaceCompletedIdeas.length} completed` : ""}
                  </div>
                  <div style={{ display: "flex" }}>
                    {space.members.map((m, i) => (
                      <Avatar key={m} src={memberPhoto(m)} size={28}
                        style={{ marginLeft: i > 0 ? -8 : 0, border: `2px solid ${CARD}`, zIndex: space.members.length - i }} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Activity Screen ──────────────────────────────────────────────────────────

function ActivityScreen() {
  return (
    <div style={{ height: "100%", overflowY: "auto" }}>
      <div style={{ padding: "16px 20px 12px" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 26, color: FG, margin: 0, fontWeight: 700 }}>Activity</h1>
      </div>
      <div style={{ padding: "0 20px" }}>
        {ACTIVITY_DATA.map((item, i) => (
          <div key={item.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0" }}>
              <Avatar src={item.userPhoto} size={36} />
              <div style={{ flex: 1 }}>
                <span style={{ fontFamily: SANS, fontSize: 14, color: FG, fontWeight: 600 }}>{item.userName} </span>
                <span style={{ fontFamily: SANS, fontSize: 14, color: MUTED }}>{item.action} </span>
                <span style={{ fontSize: 14 }}>{item.targetEmoji} </span>
                <span style={{ fontFamily: SANS, fontSize: 14, color: FG }}>{item.targetTitle}</span>
              </div>
              <span style={{ fontFamily: SANS, fontSize: 12, color: MUTED, flexShrink: 0 }}>{item.time}</span>
            </div>
            {i < ACTIVITY_DATA.length - 1 && <div style={{ height: 1, background: BORDER }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings: Notifications ─────────────────────────────────────────────────

function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const prefs = [
    { label: "New ideas", desc: "When a member adds an idea to a shared Space" },
    { label: "Comments", desc: "When someone comments on an idea" },
    { label: "Space invitations", desc: "When someone invites you to join a Space" },
    { label: "Completed ideas", desc: "When a member marks an idea as completed" },
  ];
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    "New ideas": true, "Comments": true, "Space invitations": true, "Completed ideas": false,
  });

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={SPRING}
      style={{ position: "absolute", inset: 0, background: BG, zIndex: 50, overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px",
        borderBottom: `1px solid ${BORDER}` }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12,
            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", marginRight: 12 }}>
          <ChevronLeft size={20} color={FG} />
        </motion.button>
        <h1 style={{ fontFamily: SERIF, fontSize: 20, color: FG, margin: 0, fontWeight: 700 }}>
          Notifications
        </h1>
      </div>
      <div style={{ padding: "24px 20px" }}>
        <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.7,
          margin: "0 0 28px" }}>
          Choose how SideQuest keeps you updated about the people and Spaces you care about.
        </p>
        <div style={{ background: CARD, borderRadius: 16, overflow: "hidden", border: `1px solid ${BORDER}` }}>
          {prefs.map((pref, i) => (
            <div key={pref.label}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: FG, marginBottom: 2 }}>
                    {pref.label}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
                    {pref.desc}
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => setEnabled(prev => ({ ...prev, [pref.label]: !prev[pref.label] }))}
                  style={{ width: 44, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
                    background: enabled[pref.label] ? TEAL : "rgba(255,255,255,0.12)",
                    position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
                  <motion.div
                    animate={{ x: enabled[pref.label] ? 20 : 2 }}
                    transition={{ type: "spring", damping: 20, stiffness: 400 }}
                    style={{ position: "absolute", top: 3, width: 20, height: 20,
                      borderRadius: "50%", background: FG }} />
                </motion.button>
              </div>
              {i < prefs.length - 1 && <div style={{ height: 1, background: BORDER, marginLeft: 16 }} />}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Settings: Privacy ────────────────────────────────────────────────────────

function PrivacyScreen({ onBack }: { onBack: () => void }) {
  const rows = [
    { label: "Profile visibility", value: "Members only" },
    { label: "Space privacy", value: "Invite only" },
    { label: "Blocked users", value: "0 blocked" },
  ];

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={SPRING}
      style={{ position: "absolute", inset: 0, background: BG, zIndex: 50, overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px",
        borderBottom: `1px solid ${BORDER}` }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12,
            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", marginRight: 12 }}>
          <ChevronLeft size={20} color={FG} />
        </motion.button>
        <h1 style={{ fontFamily: SERIF, fontSize: 20, color: FG, margin: 0, fontWeight: 700 }}>
          Privacy
        </h1>
      </div>
      <div style={{ padding: "24px 20px" }}>
        {/* Privacy statement */}
        <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`,
          padding: "18px", marginBottom: 28, display: "flex", gap: 14 }}>
          <div style={{ fontSize: 24, flexShrink: 0 }}>🔒</div>
          <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.7, margin: 0 }}>
            SideQuest Spaces are <span style={{ color: FG, fontWeight: 600 }}>completely private</span>.
            {" "}Your ideas, comments, and reactions are visible only to the members you personally invite.
            We never share your content with anyone outside your Spaces.
          </p>
        </div>
        <SectionLabel>Privacy Controls</SectionLabel>
        <div style={{ background: CARD, borderRadius: 16, overflow: "hidden", border: `1px solid ${BORDER}` }}>
          {rows.map((row, i) => (
            <div key={row.label}>
              <motion.button whileTap={{ scale: 0.98 }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: FG }}>{row.label}</div>
                </div>
                <span style={{ fontFamily: SANS, fontSize: 13, color: MUTED, marginRight: 6 }}>{row.value}</span>
                <ChevronRight size={16} color={MUTED} />
              </motion.button>
              {i < rows.length - 1 && <div style={{ height: 1, background: BORDER, marginLeft: 16 }} />}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Settings: About SideQuest ────────────────────────────────────────────────

function AboutScreen({ onBack }: { onBack: () => void }) {
  const links = [
    { label: "Send Feedback", icon: "💬" },
    { label: "Terms of Service", icon: "📄" },
    { label: "Privacy Policy", icon: "🔒" },
  ];

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={SPRING}
      style={{ position: "absolute", inset: 0, background: BG, zIndex: 50, overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px",
        borderBottom: `1px solid ${BORDER}` }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12,
            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", marginRight: 12 }}>
          <ChevronLeft size={20} color={FG} />
        </motion.button>
        <h1 style={{ fontFamily: SERIF, fontSize: 20, color: FG, margin: 0, fontWeight: 700 }}>
          About SideQuest
        </h1>
      </div>
      <div style={{ padding: "40px 24px 32px", display: "flex", flexDirection: "column",
        alignItems: "center" }}>
        {/* Logo + name */}
        <CompassLogo size={56} />
        <div style={{ fontFamily: SERIF, fontSize: 26, color: FG, fontWeight: 700,
          letterSpacing: "-0.02em", marginTop: 14, marginBottom: 8 }}>
          SideQuest
        </div>
        {/* Mission */}
        <p style={{ fontFamily: SERIF, fontSize: 16, color: MUTED, fontStyle: "italic",
          textAlign: "center", lineHeight: 1.6, margin: "0 0 28px" }}>
          "Collect ideas today. Live them tomorrow."
        </p>
        {/* Description */}
        <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`,
          padding: "20px", width: "100%", marginBottom: 28 }}>
          <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.75, margin: 0,
            textAlign: "center" }}>
            SideQuest is a private shared place to collect ideas, collaborate on your own time,
            plan experiences, and turn inspiration into memories.
          </p>
        </div>
        {/* Version */}
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED, marginBottom: 32 }}>
          Version 0.1
        </div>
        {/* Links */}
        <div style={{ background: CARD, borderRadius: 16, overflow: "hidden",
          border: `1px solid ${BORDER}`, width: "100%" }}>
          {links.map((link, i) => (
            <div key={link.label}>
              <motion.button whileTap={{ scale: 0.98 }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 16 }}>{link.icon}</span>
                <span style={{ flex: 1, fontFamily: SANS, fontSize: 14, color: FG }}>{link.label}</span>
                <ChevronRight size={16} color={MUTED} />
              </motion.button>
              {i < links.length - 1 && <div style={{ height: 1, background: BORDER, marginLeft: 16 }} />}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Profile Screen ───────────────────────────────────────────────────────────

function ProfileScreen({ spaces, ideas, setRoute, onSpacePress }: {
  spaces: SpaceData[]; ideas: Idea[]; setRoute: (r: Route) => void; onSpacePress: (s: SpaceData) => void;
}) {
  const [settingsView, setSettingsView] = useState<"notifications" | "privacy" | "about" | null>(null);
  const totalIdeas = ideas.filter(i => i.addedBy === "Isaiah").length;
  const totalDone = ideas.filter(i => i.addedBy === "Isaiah" && i.done).length;
  const settingsItems: { icon: React.ComponentType<{size?: number; color?: string}>; label: string; key: "notifications" | "privacy" | "about" }[] = [
    { icon: Bell2, label: "Notifications", key: "notifications" },
    { icon: User, label: "Privacy", key: "privacy" },
    { icon: Compass, label: "About SideQuest", key: "about" },
  ];
  return (
    <div style={{ height: "100%", position: "relative", overflow: "hidden" }}>
    <div style={{ height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px 24px" }}>
        <Avatar src={ISA_PH} size={80} style={{ border: `3px solid ${TEAL}`, marginBottom: 12 }} />
        <h2 style={{ fontFamily: SERIF, fontSize: 22, color: FG, margin: "0 0 4px", fontWeight: 700 }}>
          Isaiah Johnson
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, margin: "0 0 20px" }}>@isaiah</p>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: SANS, fontSize: 14, color: MUTED }}>
          <span style={{ color: FG, fontWeight: 600 }}>{totalIdeas}</span> Ideas
          <span style={{ margin: "0 8px" }}>·</span>
          <span style={{ color: FG, fontWeight: 600 }}>{totalDone}</span> Completed
        </div>
      </div>
      <div style={{ padding: "0 20px 24px" }}>
        <SectionLabel>Spaces</SectionLabel>
        <div style={{ background: CARD, borderRadius: 16, overflow: "hidden", border: `1px solid ${BORDER}`, marginBottom: 24 }}>
          {spaces.map((s, i) => (
            <div key={s.id}>
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => onSpacePress(s)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 18 }}>{s.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: FG }}>{s.name}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED }}>
                    {ideas.filter(idea => idea.spaceId === s.id && !idea.done).length} active ideas
                  </div>
                </div>
                <ChevronRight size={16} color={MUTED} />
              </motion.button>
              {i < spaces.length - 1 && <div style={{ height: 1, background: BORDER, marginLeft: 16 }} />}
            </div>
          ))}
        </div>
        <SectionLabel>Settings</SectionLabel>
        <div style={{ background: CARD, borderRadius: 16, overflow: "hidden", border: `1px solid ${BORDER}`, marginBottom: 24 }}>
          {settingsItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.label}>
                <motion.button whileTap={{ scale: 0.98 }}
                  onClick={() => setSettingsView(item.key)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <Icon size={18} color={MUTED} />
                  <span style={{ flex: 1, fontFamily: SANS, fontSize: 14, color: FG }}>{item.label}</span>
                  <ChevronRight size={16} color={MUTED} />
                </motion.button>
                {i < settingsItems.length - 1 && <div style={{ height: 1, background: BORDER, marginLeft: 16 }} />}
              </div>
            );
          })}
        </div>
        <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}` }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setRoute("landing")}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px", background: "none", border: "none", cursor: "pointer" }}>
            <LogOut size={18} color="#e55" />
            <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: "#e55" }}>Sign Out</span>
          </motion.button>
        </div>
      </div>
    </div>
    {/* Settings overlays */}
    <AnimatePresence>
      {settingsView === "notifications" && (
        <NotificationsScreen key="notifications" onBack={() => setSettingsView(null)} />
      )}
      {settingsView === "privacy" && (
        <PrivacyScreen key="privacy" onBack={() => setSettingsView(null)} />
      )}
      {settingsView === "about" && (
        <AboutScreen key="about" onBack={() => setSettingsView(null)} />
      )}
    </AnimatePresence>
    </div>
  );
}

// Bell placeholder for settings (ActivityIcon reused for notifications)
function Bell2({ size, color }: { size?: number; color?: string }) {
  return (
    <svg width={size || 18} height={size || 18} viewBox="0 0 24 24" fill="none"
      stroke={color || MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

// ─── Add Idea Overlay ─────────────────────────────────────────────────────────

function AddIdeaOverlay({ spaces, defaultSpaceId, editIdea, onSave, onClose }: {
  spaces: SpaceData[]; defaultSpaceId: number; editIdea?: Idea | null;
  onSave: (idea: Idea) => void; onClose: () => void;
}) {
  const [showPhoto, setShowPhoto] = useState(editIdea ? !!editIdea.photo : false);
  const fileInputRef = useRef<HTMLInputElement>(null);

const [selectedPhoto, setSelectedPhoto] = useState<string | null>(
  editIdea?.photo || null
);
  const [selectedCat, setSelectedCat] = useState(editIdea?.category || "");
  const [title, setTitle] = useState(editIdea?.title || "");
  const [desc, setDesc] = useState(editIdea?.description || "");
  const [location, setLocation] = useState(editIdea?.location || "");
  const [tags, setTags] = useState(editIdea?.tags.join(", ") || "");
  const [targetSpaceId, setTargetSpaceId] = useState(defaultSpaceId);
  const [showSpacePicker, setShowSpacePicker] = useState(false);
  const [error, setError] = useState("");

  const targetSpace = spaces.find(s => s.id === targetSpaceId) || spaces[0];

  const handleSave = () => {
    if (!title.trim()) { setError("Please give your idea a name."); return; }
    if (!selectedCat) { setError("Please select a category."); return; }
    setError("");
    const cat = CATS_DATA.find(c => c.label === selectedCat)!;
    const parsedTags = tags.split(",").map(t => t.trim()).filter(Boolean);
    const savedIdea: Idea = editIdea ? {
      ...editIdea,
      title: title.trim(),
      category: selectedCat,
      categoryEmoji: cat?.emoji || "💡",
      accent: cat?.accent || "100,100,100",
      description: desc.trim(),
      location: location.trim(),
      tags: parsedTags,
      spaceId: targetSpaceId,
    } : {
      id: Date.now(),
      spaceId: targetSpaceId,
      title: title.trim(),
      category: selectedCat,
      categoryEmoji: cat?.emoji || "💡",
      accent: cat?.accent || "100,100,100",
      description: desc.trim(),
      location: location.trim(),
      tags: parsedTags,
      photo: "photo-1526318896980-cf78c088247c",
      addedBy: "Isaiah",
      addedAt: "Just now",
      done: false,
      reactions: {},
      comments: [],
    };
    onSave(savedIdea);
  };

  return (
    <motion.div
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      transition={SPRING}
      style={{ position: "absolute", inset: 0, background: BG, zIndex: 60,
        display: "flex", flexDirection: "column", overflowY: "auto" }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px", flexShrink: 0 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
          style={{ background: "none", border: "none", color: MUTED, fontFamily: SANS,
            fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <ChevronLeft size={18} /> Cancel
        </motion.button>
        <span style={{ fontFamily: SERIF, fontSize: 17, color: FG, fontWeight: 600 }}>
          {editIdea ? "Edit Idea" : "New Idea"}
        </span>
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleSave}
          style={{ background: TEAL, border: "none", color: FG, fontFamily: SANS, fontSize: 14,
            fontWeight: 700, borderRadius: 20, padding: "8px 18px", cursor: "pointer" }}>
          {editIdea ? "Update" : "Save"}
        </motion.button>
      </div>
      {/* Photo area */}
      <motion.div whileTap={{ scale: 0.99 }} onClick={() => setShowPhoto(v => !v)}
        style={{ height: 220, background: CARD, cursor: "pointer", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        {/* Photo area */}
<motion.div
  whileTap={{ scale: 0.99 }}
  onClick={() => fileInputRef.current?.click()}
  style={{
    height: 220,
    background: CARD,
    cursor: "pointer",
    flexShrink: 0,
    position: "relative",
    overflow: "hidden",
  }}
>
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    style={{ display: "none" }}
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (!file) return;

      const imageUrl = URL.createObjectURL(file);
      setSelectedPhoto(imageUrl);
    }}
  />

  {selectedPhoto ? (
    <img
      src={selectedPhoto}
      alt="Selected idea"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  ) : (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <div style={{ animation: "camPulse 2s ease infinite" }}>
        <Camera size={36} color={MUTED} />
      </div>

      <span
        style={{
          fontFamily: SANS,
          fontSize: 14,
          color: MUTED,
        }}
      >
        Tap to add photo
      </span>
    </div>
  )}
</motion.div>
      </motion.div>
      <div style={{ padding: "20px 20px 40px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Error */}
        {error && (
          <div style={{ fontFamily: SANS, fontSize: 13, color: "#e55", padding: "8px 12px",
            background: "rgba(220,80,80,0.1)", borderRadius: 10, border: "1px solid rgba(220,80,80,0.2)" }}>
            {error}
          </div>
        )}
        {/* Category chips */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {CATS_DATA.map(cat => {
            const isSel = selectedCat === cat.label;
            return (
              <motion.button key={cat.label} whileTap={{ scale: 0.9 }}
                onClick={() => { setSelectedCat(isSel ? "" : cat.label); setError(""); }}
                style={{ flexShrink: 0, border: `1.5px solid ${isSel ? `rgb(${cat.accent})` : BORDER}`,
                  background: isSel ? `rgba(${cat.accent},0.2)` : CARD,
                  borderRadius: 20, padding: "7px 14px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  fontFamily: SANS, fontSize: 13, color: isSel ? `rgb(${cat.accent})` : MUTED, fontWeight: isSel ? 700 : 400 }}>
                {isSel && <Check size={12} />}
                {cat.emoji} {cat.label}
              </motion.button>
            );
          })}
        </div>
        {/* Title */}
        <input value={title} onChange={e => { setTitle(e.target.value); setError(""); }}
          placeholder="Give it a name..."
          style={{ fontFamily: SERIF, fontSize: 26, color: FG,
            borderBottom: `1px solid ${title ? TEAL : BORDER}`, paddingBottom: 12 }} />
        {/* Description */}
        <textarea value={desc} onChange={e => setDesc(e.target.value)}
          placeholder="What's the idea? Why does it matter?" rows={3}
          style={{ fontFamily: SANS, fontSize: 15, color: desc ? FG : MUTED, resize: "none",
            borderBottom: `1px solid ${BORDER}`, paddingBottom: 12, lineHeight: 1.6 }} />
        {/* Location + Tags */}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`,
            borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 6 }}>
            <MapPin size={14} color={TEAL} />
            <input value={location} onChange={e => setLocation(e.target.value)}
              placeholder="Add location" style={{ fontFamily: SANS, fontSize: 14, color: FG }} />
          </div>
          <div style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`,
            borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 6 }}>
            <Hash size={14} color={MUTED} />
            <input value={tags} onChange={e => setTags(e.target.value)}
              placeholder="Tags, comma separated" style={{ fontFamily: SANS, fontSize: 14, color: FG }} />
          </div>
        </div>
        {/* Space picker */}
        <div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED, marginBottom: 8 }}>Adding to:</div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowSpacePicker(v => !v)}
            style={{ background: CARD, border: `1.5px solid ${showSpacePicker ? TEAL : BORDER}`,
              borderRadius: 20, padding: "8px 14px 8px 10px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>{targetSpace?.emoji}</span>
            <span style={{ fontFamily: SANS, fontSize: 14, color: FG, fontWeight: 600 }}>{targetSpace?.name}</span>
            <ChevronRight size={14} color={MUTED} style={{ transform: showSpacePicker ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
          </motion.button>
          <AnimatePresence>
            {showSpacePicker && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                <div style={{ paddingTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  {spaces.map(space => (
                    <motion.button key={space.id} whileTap={{ scale: 0.97 }}
                      onClick={() => { setTargetSpaceId(space.id); setShowSpacePicker(false); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                        borderRadius: 14, cursor: "pointer",
                        background: space.id === targetSpaceId ? "rgba(61,155,137,0.12)" : "rgba(255,255,255,0.03)",
                        border: `1.5px solid ${space.id === targetSpaceId ? TEAL : BORDER}` }}>
                      <span style={{ fontSize: 16 }}>{space.emoji}</span>
                      <span style={{ flex: 1, fontFamily: SANS, fontSize: 14, color: FG, textAlign: "left" }}>{space.name}</span>
                      {space.id === targetSpaceId && <CheckCircle2 size={16} color={TEAL} />}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Save button */}
        <TealButton onClick={handleSave} style={{ marginTop: 8 }}>
          {editIdea ? "Update Idea" : "Save Idea"}
        </TealButton>
      </div>
    </motion.div>
  );
}

// ─── Idea Detail Overlay ──────────────────────────────────────────────────────

function IdeaDetailOverlay({ ideaId, ideas, spaces, currentUser, onClose, onMarkDone, onDelete, onEdit, onUpdateReaction, onAddComment }: {
  ideaId: number; ideas: Idea[]; spaces: SpaceData[]; currentUser: string;
  onClose: () => void;
  onMarkDone: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (idea: Idea) => void;
  onUpdateReaction: (ideaId: number, member: string, reaction: ReactionType | null) => void;
  onAddComment: (ideaId: number, text: string) => void;
}) {
  const idea = ideas.find(i => i.id === ideaId);
  const [commentText, setCommentText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const commentRef = useRef<HTMLInputElement>(null);

  if (!idea) return null;

  const space = spaces.find(s => s.id === idea.spaceId);
  const isCreator = idea.addedBy === currentUser;
  const isSpaceOwner = space?.members[0] === currentUser;
  const canDelete = isCreator || isSpaceOwner;
  const myReaction = idea.reactions[currentUser] || null;

  const handleReaction = (type: ReactionType) => {
    if (myReaction === type) {
      onUpdateReaction(idea.id, currentUser, null);
    } else {
      onUpdateReaction(idea.id, currentUser, type);
    }
  };

  const handleSubmitComment = () => {
    const text = commentText.trim();
    if (!text) return;
    onAddComment(idea.id, text);
    setCommentText("");
  };

  const reactionCounts = REACTION_DEFS.map(r => ({
    ...r,
    count: Object.values(idea.reactions).filter(v => v === r.type).length,
    members: Object.entries(idea.reactions).filter(([, v]) => v === r.type).map(([k]) => k),
  }));

  return (
    <motion.div
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={SPRING}
      style={{ position: "absolute", inset: 0, background: BG, zIndex: 55, overflowY: "auto" }}>
      {/* Photo hero */}
      <div style={{ position: "relative", height: 260, flexShrink: 0 }}>
        <img src={PH(idea.photo, 800, 600)} alt={idea.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(15,14,13,0.4) 0%, transparent 50%)" }} />
        <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
          style={{ position: "absolute", top: 16, left: 16, background: "rgba(15,14,13,0.65)",
            backdropFilter: "blur(12px)", border: "none", borderRadius: 20,
            padding: "8px 14px 8px 10px", display: "flex", alignItems: "center", gap: 4,
            color: FG, fontFamily: SANS, fontSize: 14, cursor: "pointer" }}>
          <ChevronLeft size={16} /> Back
        </motion.button>
        {/* Action buttons top right */}
        <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8 }}>
          {isCreator && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => onEdit(idea)}
              style={{ background: "rgba(15,14,13,0.65)", backdropFilter: "blur(12px)", border: "none",
                borderRadius: 20, width: 38, height: 38, display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer" }}>
              <Edit3 size={15} color={FG} />
            </motion.button>
          )}
          {canDelete && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowDeleteConfirm(true)}
              style={{ background: "rgba(15,14,13,0.65)", backdropFilter: "blur(12px)", border: "none",
                borderRadius: 20, width: 38, height: 38, display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer" }}>
              <Trash2 size={15} color="#e55" />
            </motion.button>
          )}
          <motion.button whileTap={{ scale: 0.9 }}
            style={{ background: "rgba(15,14,13,0.65)", backdropFilter: "blur(12px)", border: "none",
              borderRadius: 20, width: 38, height: 38, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer" }}>
            <Share2 size={15} color={FG} />
          </motion.button>
        </div>
        {idea.done && (
          <div style={{ position: "absolute", bottom: 14, left: 16, background: TEAL,
            color: FG, borderRadius: 20, padding: "5px 14px",
            fontFamily: SANS, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
            <Check size={12} /> Completed {idea.completedAt ? `· ${idea.completedAt}` : ""}
          </div>
        )}
      </div>

      {/* Delete confirm banner */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ background: "rgba(220,80,80,0.12)", border: `1px solid rgba(220,80,80,0.3)`,
              overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, fontFamily: SANS, fontSize: 14, color: FG }}>
                Delete "<span style={{ fontWeight: 600 }}>{idea.title}</span>"? This can't be undone.
              </div>
              <motion.button whileTap={{ scale: 0.93 }} onClick={() => setShowDeleteConfirm(false)}
                style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "7px 14px",
                  fontFamily: SANS, fontSize: 13, color: MUTED, cursor: "pointer" }}>
                Cancel
              </motion.button>
              <motion.button whileTap={{ scale: 0.93 }} onClick={() => onDelete(idea.id)}
                style={{ background: "rgba(220,80,80,0.2)", border: "1px solid rgba(220,80,80,0.4)",
                  borderRadius: 10, padding: "7px 14px",
                  fontFamily: SANS, fontSize: 13, color: "#e55", fontWeight: 700, cursor: "pointer" }}>
                Delete
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div style={{ padding: "20px 20px 40px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5,
          background: `rgba(${idea.accent},0.18)`, borderRadius: 20, padding: "5px 12px", marginBottom: 12 }}>
          <span>{idea.categoryEmoji}</span>
          <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: `rgb(${idea.accent})` }}>
            {idea.category}
          </span>
        </div>
        <h1 style={{ fontFamily: SERIF, fontSize: 26, color: FG, margin: "0 0 12px", lineHeight: 1.3, fontWeight: 700 }}>
          {idea.title}
        </h1>
        <p style={{ fontFamily: SANS, fontSize: 15, color: MUTED, lineHeight: 1.7, margin: "0 0 20px" }}>
          {idea.description}
        </p>
        {idea.location && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <MapPin size={14} color={TEAL} />
            <span style={{ fontFamily: SANS, fontSize: 14, color: MUTED }}>{idea.location}</span>
          </div>
        )}
        {idea.tags.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {idea.tags.map(tag => (
              <div key={tag} style={{ background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: 20, padding: "5px 12px", display: "flex", alignItems: "center", gap: 4 }}>
                <Hash size={11} color={MUTED} />
                <span style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>{tag}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ height: 1, background: BORDER, marginBottom: 16 }} />
        {/* Added by + date */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <Avatar src={memberPhoto(idea.addedBy)} size={32} />
          <div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>
              Added by <span style={{ color: FG, fontWeight: 600 }}>{idea.addedBy}</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED }}>{idea.addedAt}</div>
          </div>
        </div>

        {/* Member reactions summary */}
        {Object.keys(idea.reactions).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionLabel>Member Reactions</SectionLabel>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {Object.entries(idea.reactions).map(([member, reaction]) => {
                const def = REACTION_DEFS.find(r => r.type === reaction);
                return (
                  <div key={member} style={{ display: "flex", alignItems: "center", gap: 6,
                    background: CARD, borderRadius: 24, padding: "6px 12px 6px 8px",
                    border: `1px solid ${BORDER}` }}>
                    <Avatar src={memberPhoto(member)} size={22} />
                    <span style={{ fontFamily: SANS, fontSize: 13, color: FG, fontWeight: 500 }}>{member}</span>
                    <span style={{ fontSize: 14 }}>{def?.emoji}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reaction buttons */}
        {!idea.done && (
          <>
            <SectionLabel>Your Reaction</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              {reactionCounts.map(r => {
                const isSelected = myReaction === r.type;
                return (
                  <motion.button key={r.type} whileTap={{ scale: 0.93 }} onClick={() => handleReaction(r.type)}
                    style={{ display: "flex", alignItems: "center", gap: 8,
                      background: isSelected ? "rgba(61,155,137,0.12)" : CARD,
                      border: `1.5px solid ${isSelected ? TEAL : BORDER}`, borderRadius: 14,
                      padding: "11px 14px", cursor: "pointer" } as React.CSSProperties}>
                    <span style={{ fontSize: 18 }}>{r.emoji}</span>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600,
                        color: isSelected ? TEAL : FG }}>{r.label}</div>
                      {r.count > 0 && (
                        <div style={{ fontFamily: SANS, fontSize: 11, color: MUTED }}>
                          {r.members.join(", ")}
                        </div>
                      )}
                    </div>
                    {r.count > 0 && (
                      <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700,
                        color: isSelected ? TEAL : MUTED }}>{r.count}</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </>
        )}

        {/* Comments */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>Comments {idea.comments.length > 0 ? `(${idea.comments.length})` : ""}</SectionLabel>
          {idea.comments.length === 0 && (
            <div style={{ fontFamily: SANS, fontSize: 14, color: MUTED, marginBottom: 16 }}>
              No comments yet. Be the first!
            </div>
          )}
          {idea.comments.map(comment => (
            <div key={comment.id} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <Avatar src={memberPhoto(comment.author)} size={32} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, background: CARD, borderRadius: 14, padding: "10px 14px",
                border: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: FG }}>{comment.author}</span>
                  <span style={{ fontFamily: SANS, fontSize: 11, color: MUTED }}>{comment.time}</span>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.5 }}>{comment.text}</div>
              </div>
            </div>
          ))}
          {/* Add comment */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <Avatar src={ISA_PH} size={32} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`,
              padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <input ref={commentRef} value={commentText} onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleSubmitComment(); } }}
                style={{ flex: 1, fontFamily: SANS, fontSize: 14, color: FG }} />
              {commentText.trim() && (
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleSubmitComment}
                  style={{ background: TEAL, border: "none", width: 28, height: 28, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  <Send size={13} color={FG} />
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Mark as done / completed state */}
        {idea.done ? (
          <div style={{ width: "100%", padding: "15px", borderRadius: 16, border: `2px solid ${TEAL}`,
            color: TEAL, fontFamily: SANS, fontSize: 16, fontWeight: 700, textAlign: "center",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <CheckCircle2 size={18} /> Completed {idea.completedAt ? `· ${idea.completedAt}` : ""}
          </div>
        ) : (
          <TealButton onClick={() => onMarkDone(idea.id)}>
            ✓ Mark as Completed
          </TealButton>
        )}
      </div>
    </motion.div>
  );
}

// ─── Space Detail Overlay ─────────────────────────────────────────────────────

function SpaceDetailOverlay({ space, ideas, onClose, onAddIdea, onIdeaPress }: {
  space: SpaceData; ideas: Idea[]; onClose: () => void;
  onAddIdea: () => void; onIdeaPress: (idea: Idea) => void;
}) {
  const [view, setView] = useState<"active" | "completed">("active");
  const activeIdeas = ideas.filter(i => i.spaceId === space.id && !i.done);
  const completedIdeas = ideas.filter(i => i.spaceId === space.id && i.done);
  const isEmpty = activeIdeas.length === 0 && completedIdeas.length === 0;

  return (
    <motion.div
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={SPRING}
      style={{ position: "absolute", inset: 0, background: BG, zIndex: 50,
        display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px",
        borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
          style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 12,
            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", marginRight: 12 }}>
          <ChevronLeft size={20} color={FG} />
        </motion.button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>{space.emoji}</span>
            <div style={{ fontFamily: SERIF, fontSize: 18, color: FG, fontWeight: 600 }}>{space.name}</div>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED }}>{space.members.length} members · {space.type}</div>
        </div>
        {/* Members */}
        <div style={{ display: "flex" }}>
          {space.members.slice(0, 3).map((m, i) => (
            <Avatar key={m} src={memberPhoto(m)} size={28}
              style={{ marginLeft: i > 0 ? -8 : 0, border: `2px solid ${BG}`, zIndex: space.members.length - i }} />
          ))}
        </div>
      </div>

      {isEmpty ? (
        /* Empty state */
        <div style={{ flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: "32px" }}>
          <CompassLogo size={60} />
          <h2 style={{ fontFamily: SERIF, fontSize: 22, color: FG, margin: "24px 0 10px",
            fontWeight: 700, textAlign: "center" }}>No ideas yet</h2>
          <p style={{ fontFamily: SANS, fontSize: 15, color: MUTED, textAlign: "center",
            lineHeight: 1.6, margin: "0 0 32px" }}>
            {space.type === "Solo" ? "Your solo adventures begin here." : "Start collecting ideas together."}
          </p>
          <TealButton onClick={onAddIdea} style={{ marginBottom: 12 }}>Add your first idea →</TealButton>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Active / Completed tabs */}
          <div style={{ display: "flex", padding: "12px 20px 0", gap: 4, flexShrink: 0 }}>
            {(["active", "completed"] as const).map(v => (
              <motion.button key={v} whileTap={{ scale: 0.95 }} onClick={() => setView(v)}
                style={{ padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer",
                  fontFamily: SANS, fontSize: 13, fontWeight: view === v ? 600 : 400,
                  background: view === v ? TEAL : CARD, color: view === v ? FG : MUTED }}>
                {v === "active" ? `Active · ${activeIdeas.length}` : `Completed · ${completedIdeas.length}`}
              </motion.button>
            ))}
          </div>
          {/* Idea list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px 100px" }}>
            {view === "active" && activeIdeas.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontFamily: SANS, fontSize: 14, color: MUTED }}>All ideas completed! 🎉</div>
              </div>
            )}
            {view === "completed" && completedIdeas.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontFamily: SANS, fontSize: 14, color: MUTED }}>No completed ideas yet.</div>
              </div>
            )}
            {(view === "active" ? activeIdeas : completedIdeas).map(idea => (
              <IdeaCard key={idea.id} idea={idea} onPress={() => onIdeaPress(idea)} />
            ))}
          </div>
        </div>
      )}
      {/* FAB */}
      {!isEmpty && (
        <motion.button whileTap={{ scale: 0.9 }} onClick={onAddIdea}
          style={{ position: "absolute", bottom: 24, right: 24, width: 56, height: 56,
            borderRadius: "50%", background: TEAL, border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 6px 24px rgba(61,155,137,0.5)", zIndex: 10 }}>
          <Plus size={24} color={FG} />
        </motion.button>
      )}
    </motion.div>
  );
}

// ─── Create Space Overlay ─────────────────────────────────────────────────────

function CreateSpaceOverlay({ spaces, onSave, onClose }: {
  spaces: SpaceData[]; onSave: (s: SpaceData) => void; onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [selected, setSelected] = useState<string[]>([]);

  const SPACE_TYPES = [
    { type: "Partner", emoji: "❤️", desc: "Just the two of you. For couples, close friends." },
    { type: "Solo",    emoji: "🧭", desc: "Your personal ideas. Just for you." },
    { type: "Group",   emoji: "👥", desc: "Three or more people. Friends, family, crew." },
  ];
  const contacts = [
    { name: "Zoe Martinez", handle: "@zoe", photo: ZOE_PH },
    { name: "Maya Chen", handle: "@maya", photo: MAYA_PH },
    { name: "Sam Rivers", handle: "@sam", photo: SAM_PH },
  ];
  const toggleContact = (n: string) =>
    setSelected(s => s.includes(n) ? s.filter(x => x !== n) : [...s, n]);

  const handleFinalSave = () => {
    const newSpace: SpaceData = {
      id: Math.max(...spaces.map(s => s.id)) + 1,
      name: name.trim() || "New Space",
      emoji,
      type,
      members: ["Isaiah", ...selected.map(n => n.split(" ")[0])],
      ideaCount: 0,
      completedCount: 0,
    };
    onSave(newSpace);
  };

  return (
    <motion.div
      initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
      transition={SPRING}
      style={{ position: "absolute", inset: 0, background: BG, zIndex: 50,
        display: "flex", flexDirection: "column", overflowY: "auto" }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px", flexShrink: 0 }}>
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
          style={{ background: "none", border: "none", color: MUTED, fontFamily: SANS,
            fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <ChevronLeft size={18} /> {step === 0 ? "Cancel" : "Back"}
        </motion.button>
        <span style={{ fontFamily: SERIF, fontSize: 17, color: FG, fontWeight: 600 }}>New Space</span>
        <div style={{ width: 60 }} />
      </div>
      <div style={{ padding: "0 24px 40px" }}>
        <ProgressDots total={3} current={step} />

        {step === 0 && (
          <div>
            <h2 style={{ fontFamily: SERIF, fontSize: 24, color: FG, margin: "0 0 8px", fontWeight: 700 }}>
              Choose a type
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, margin: "0 0 28px" }}>
              What kind of space are you creating?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {SPACE_TYPES.map(st => {
                const isSelected = type === st.type;
                return (
                  <motion.button key={st.type} whileTap={{ scale: 0.97 }}
                    onClick={() => { setType(st.type); setEmoji(st.emoji); }}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 16px",
                      borderRadius: 18, cursor: "pointer",
                      background: isSelected ? "rgba(61,155,137,0.12)" : CARD,
                      border: `2px solid ${isSelected ? TEAL : BORDER}`, textAlign: "left" }}>
                    <span style={{ fontSize: 32 }}>{st.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700,
                        color: isSelected ? TEAL : FG, marginBottom: 4 }}>{st.type}</div>
                      <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>{st.desc}</div>
                    </div>
                    {isSelected && <CheckCircle2 size={20} color={TEAL} />}
                  </motion.button>
                );
              })}
            </div>
            <div style={{ marginTop: 28 }}>
              <TealButton onClick={() => setStep(1)} disabled={!type}>Continue</TealButton>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: SERIF, fontSize: 24, color: FG, margin: "0 0 8px", fontWeight: 700 }}>
              Name your space
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, margin: "0 0 24px" }}>
              Pick an emoji and give it a name.
            </p>
            {/* Emoji row */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {SPACE_EMOJIS.map(e => (
                <motion.button key={e} whileTap={{ scale: 0.85 }} onClick={() => setEmoji(e)}
                  style={{ width: 44, height: 44, borderRadius: 12, border: `2px solid ${emoji === e ? TEAL : BORDER}`,
                    background: emoji === e ? "rgba(61,155,137,0.15)" : CARD,
                    fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {e}
                </motion.button>
              ))}
            </div>
            {/* Name input */}
            <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`,
              padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontFamily: SANS, fontSize: 11, color: MUTED, fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Space Name</div>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Road Trip Crew"
                style={{ fontFamily: SERIF, fontSize: 18, color: FG }} />
            </div>
            {/* Preview */}
            <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`,
              padding: "16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <span style={{ fontSize: 28 }}>{emoji}</span>
              <div>
                <div style={{ fontFamily: SERIF, fontSize: 16, color: FG, fontWeight: 600 }}>
                  {name || "Your Space"}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED }}>{type} Space</div>
              </div>
            </div>
            <TealButton onClick={() => setStep(2)} disabled={!name.trim()}>Continue</TealButton>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: SERIF, fontSize: 24, color: FG, margin: "0 0 8px", fontWeight: 700 }}>
              Invite members
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 14, color: MUTED, margin: "0 0 24px" }}>
              Optional — you can do this later.
            </p>
            {type !== "Solo" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {contacts.map(c => {
                  const isSelected = selected.includes(c.name);
                  return (
                    <motion.button key={c.name} whileTap={{ scale: 0.97 }} onClick={() => toggleContact(c.name)}
                      style={{ background: isSelected ? "rgba(61,155,137,0.1)" : CARD,
                        border: `1.5px solid ${isSelected ? TEAL : BORDER}`,
                        borderRadius: 16, padding: "12px 16px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                      <Avatar src={c.photo} size={40} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: FG }}>{c.name}</div>
                        <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED }}>{c.handle}</div>
                      </div>
                      {isSelected && (
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: TEAL,
                          display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Check size={13} color={FG} />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
            {type === "Solo" && (
              <div style={{ background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`,
                padding: "16px", marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>🧭</span>
                <div style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.5 }}>
                  Solo spaces are private to you. No invites needed.
                </div>
              </div>
            )}
            <TealButton onClick={handleFinalSave}>
              {selected.length > 0 ? `Create Space & Invite ${selected.length}` : "Create Space"}
            </TealButton>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────

function AppShell({ setRoute }: { setRoute: (r: Route) => void }) {
  const [ideas, setIdeas] = useState<Idea[]>(IDEAS_INITIAL);
  const [spaces, setSpaces] = useState<SpaceData[]>(SPACES_INITIAL);
  const [activeSpaceId, setActiveSpaceId] = useState(1);
  const [appTab, setAppTab] = useState(0);
  const [modal, setModal] = useState<"add_idea" | "create_space" | "space_switcher" | null>(null);
  const [detailIdeaId, setDetailIdeaId] = useState<number | null>(null);
  const [detailSpace, setDetailSpace] = useState<SpaceData | null>(null);
  const [editIdea, setEditIdea] = useState<Idea | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const activeSpace = spaces.find(s => s.id === activeSpaceId) || spaces[0];
  const showBottomNav = detailIdeaId === null && detailSpace === null && modal === null;
  const addDefaultSpaceId = detailSpace?.id || activeSpaceId;

  const flashToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

 const handleSaveIdea = async (saved: Idea) => {
  try {
    if (editIdea) {
      setIdeas(prev =>
        prev.map(i => (i.id === saved.id ? saved : i))
      );

      flashToast("Idea updated ✓");
    } else {
      const docRef = await addDoc(collection(db, "ideas"), {
        spaceId: saved.spaceId,
        title: saved.title,
        category: saved.category,
        categoryEmoji: saved.categoryEmoji,
        accent: saved.accent,
        description: saved.description,
        location: saved.location,
        tags: saved.tags,
        photo: saved.photo,
        addedBy: saved.addedBy,
        addedAt: saved.addedAt,
        createdAt: serverTimestamp(),
        done: saved.done,
        completedAt: saved.completedAt ?? null,
        reactions: saved.reactions,
        comments: saved.comments,
      });

      const savedWithFirestoreId: Idea = {
        ...saved,
        firestoreId: docRef.id,
      };

      setIdeas(prev => [savedWithFirestoreId, ...prev]);
      setActiveSpaceId(saved.spaceId);

      console.log("Idea saved to Firestore:", docRef.id);
      flashToast("Idea saved ✓");
    }

    setModal(null);
    setEditIdea(null);
  } catch (error) {
    console.error("Failed to save idea to Firestore:", error);
    flashToast("Could not save idea");
  }
};

  const handleMarkDone = (ideaId: number) => {
    setIdeas(prev => prev.map(i =>
      i.id === ideaId ? { ...i, done: true, completedAt: "Just now" } : i
    ));
    setDetailIdeaId(null);
    flashToast("Marked as completed ✓");
  };

  const handleDelete = (ideaId: number) => {
    setIdeas(prev => prev.filter(i => i.id !== ideaId));
    setDetailIdeaId(null);
    flashToast("Idea deleted");
  };

  const handleEdit = (idea: Idea) => {
    setEditIdea(idea);
    setDetailIdeaId(null);
    setModal("add_idea");
  };

  const handleUpdateReaction = (ideaId: number, member: string, reaction: ReactionType | null) => {
    setIdeas(prev => prev.map(i => {
      if (i.id !== ideaId) return i;
      const newReactions = { ...i.reactions };
      if (reaction === null) delete newReactions[member];
      else newReactions[member] = reaction;
      return { ...i, reactions: newReactions };
    }));
  };

  const handleAddComment = (ideaId: number, text: string) => {
    const newComment: Comment = { id: Date.now(), author: "Isaiah", text, time: "Just now" };
    setIdeas(prev => prev.map(i =>
      i.id === ideaId ? { ...i, comments: [...i.comments, newComment] } : i
    ));
  };

  const handleCreateSpace = (newSpace: SpaceData) => {
    setSpaces(prev => [...prev, newSpace]);
    setModal(null);
    setDetailSpace(newSpace);
    flashToast(`${newSpace.name} created ✓`);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <StatusBar />
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Tab screens */}
        <AnimatePresence mode="wait">
          {appTab === 0 && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              <HomeFeed
                ideas={ideas}
                activeSpace={activeSpace}
                spaces={spaces}
                onIdeaPress={idea => setDetailIdeaId(idea.id)}
                onOpenSwitcher={() => setModal("space_switcher")}
                onOpenProfile={() => setAppTab(4)}
              />
            </motion.div>
          )}
          {appTab === 1 && (
            <motion.div key="spaces" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              <SpacesScreen
                spaces={spaces}
                ideas={ideas}
                onSpacePress={setDetailSpace}
                onCreateSpace={() => setModal("create_space")}
              />
            </motion.div>
          )}
          {appTab === 3 && (
            <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              <ActivityScreen />
            </motion.div>
          )}
          {appTab === 4 && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              <ProfileScreen
                spaces={spaces}
                ideas={ideas}
                setRoute={setRoute}
                onSpacePress={space => { setDetailSpace(space); setAppTab(1); }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlays */}
        <AnimatePresence>
          {detailSpace && (
            <SpaceDetailOverlay
              key="space-detail"
              space={detailSpace}
              ideas={ideas}
              onClose={() => setDetailSpace(null)}
              onAddIdea={() => setModal("add_idea")}
              onIdeaPress={idea => setDetailIdeaId(idea.id)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {detailIdeaId !== null && (
            <IdeaDetailOverlay
              key="idea-detail"
              ideaId={detailIdeaId}
              ideas={ideas}
              spaces={spaces}
              currentUser="Isaiah"
              onClose={() => setDetailIdeaId(null)}
              onMarkDone={handleMarkDone}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onUpdateReaction={handleUpdateReaction}
              onAddComment={handleAddComment}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modal === "add_idea" && (
            <AddIdeaOverlay
              key="add-idea"
              spaces={spaces}
              defaultSpaceId={addDefaultSpaceId}
              editIdea={editIdea}
              onSave={handleSaveIdea}
              onClose={() => { setModal(null); setEditIdea(null); }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modal === "create_space" && (
            <CreateSpaceOverlay
              key="create-space"
              spaces={spaces}
              onSave={handleCreateSpace}
              onClose={() => setModal(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modal === "space_switcher" && (
            <SpaceSwitcherModal
              key="space-switcher"
              spaces={spaces}
              activeSpaceId={activeSpaceId}
              onSwitch={id => { setActiveSpaceId(id); setAppTab(0); }}
              onClose={() => setModal(null)}
            />
          )}
        </AnimatePresence>

        {/* Toast */}
        <Toast message={toastMsg} visible={showToast} />
      </div>

      <AnimatePresence>
        {showBottomNav && (
          <motion.div key="bottom-nav"
            initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}>
            <BottomNav active={appTab} onNav={setAppTab} onAdd={() => setModal("add_idea")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [route, setRoute] = useState<Route>("landing");

  return (
    <>
      <style>{GLOBALS}</style>
      <div style={{ width: "100%", height: "100vh", background: BG, overflow: "hidden",
        display: "flex", flexDirection: "column", fontFamily: SANS, color: FG }}>
        <AnimatePresence mode="wait">
          {route === "landing" && (
            <motion.div key="landing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              style={{ flex: 1, overflow: "hidden" }}>
              <LandingScreen setRoute={setRoute} />
            </motion.div>
          )}
          {route === "auth" && (
            <motion.div key="auth" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              style={{ flex: 1, overflow: "hidden" }}>
              <AuthScreen mode="create" setRoute={setRoute} />
            </motion.div>
          )}
          {route === "signin" && (
            <motion.div key="signin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              style={{ flex: 1, overflow: "hidden" }}>
              <AuthScreen mode="signin" setRoute={setRoute} />
            </motion.div>
          )}
          {route === "ob_welcome" && (
            <motion.div key="ob_welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              style={{ flex: 1, overflow: "hidden" }}>
              <OnbWelcome setRoute={setRoute} />
            </motion.div>
          )}
          {route === "ob_cats" && (
            <motion.div key="ob_cats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              style={{ flex: 1, overflow: "hidden" }}>
              <OnbCategories setRoute={setRoute} />
            </motion.div>
          )}
          {route === "ob_name" && (
            <motion.div key="ob_name" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              style={{ flex: 1, overflow: "hidden" }}>
              <OnbNameSpace setRoute={setRoute} />
            </motion.div>
          )}
          {route === "ob_invite" && (
            <motion.div key="ob_invite" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              style={{ flex: 1, overflow: "hidden" }}>
              <OnbInvite setRoute={setRoute} />
            </motion.div>
          )}
          {route === "inv_landing" && (
            <motion.div key="inv_landing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              style={{ flex: 1, overflow: "hidden" }}>
              <InviteLandingScreen setRoute={setRoute} />
            </motion.div>
          )}
          {route === "inv_join" && (
            <motion.div key="inv_join" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              style={{ flex: 1, overflow: "hidden" }}>
              <InviteJoinScreen setRoute={setRoute} />
            </motion.div>
          )}
          {route === "app" && (
            <motion.div key="app" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              style={{ flex: 1, overflow: "hidden" }}>
              <AppShell setRoute={setRoute} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
