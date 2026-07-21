import { useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import type { UserProfile } from "../types/domain";
import { DEFAULT_REACTIONS } from "../config/defaults";
import { getCategoryPack } from "../features/templates/categoryPacks";
import { SPACE_TEMPLATE_DEFINITIONS, getSpaceTemplateDefinition } from "../features/templates/spaceTemplates";
import {
  ACCENT_THEMES,
  CURRENT_SPACE_TEMPLATE_VERSION,
  type AccentTheme,
  type SpaceTemplateId,
} from "../features/templates/templateTypes";
import { addSpace, changeSpace } from "./data";
import { applyStarterIdeas } from "./starter-idea-data";
import { getStarterIdeas, shouldDefaultStarterIdeas, type StarterIdeaDraft } from "../features/templates/starterIdeas";
import { StarterIdeaEditor, starterIdeaIssue } from "./StarterIdeaEditor";
import type { CategoryDef, ReactionDef, Space } from "./domain";
import { messageFor } from "./reliability";
import { CategoryPackEditor, categoryPackIssue } from "./CategoryPackEditor";
import "./space-templates.css";

export interface SpaceTemplateDraft {
  step: "template" | "customize";
  templateId: SpaceTemplateId | null;
  name: string;
  emoji: string;
  accentTheme: AccentTheme;
  categories: CategoryDef[];
  reactions: ReactionDef[];
  inviteAfter: boolean;
  addStarterIdeas: boolean;
  starterIdeas: StarterIdeaDraft[];
}

export const initialSpaceTemplateDraft = (addStarterIdeas = false): SpaceTemplateDraft => ({
  step: "template",
  templateId: null,
  name: "",
  emoji: "✨",
  accentTheme: "teal",
  categories: [],
  reactions: DEFAULT_REACTIONS.map(reaction => ({ ...reaction })),
  inviteAfter: false,
  addStarterIdeas,
  starterIdeas: [],
});

export function selectSpaceTemplate(draft: SpaceTemplateDraft, templateId: SpaceTemplateId): SpaceTemplateDraft {
  const template = getSpaceTemplateDefinition(templateId);
  return {
    ...draft,
    step: "customize",
    templateId,
    emoji: template.emoji,
    accentTheme: template.accentTheme,
    categories: getCategoryPack(templateId),
    addStarterIdeas: templateId === "blank" ? false : draft.addStarterIdeas,
    starterIdeas: getStarterIdeas(templateId),
  };
}

export function createSpaceTemplatePayload(draft: SpaceTemplateDraft, profile: UserProfile): Omit<Space, "id" | "createdAt" | "updatedAt"> {
  const template = getSpaceTemplateDefinition(draft.templateId);
  return {
    name: draft.name.trim(),
    emoji: draft.emoji.trim() || template.emoji,
    type: template.name,
    ownerId: profile.id,
    adminIds: [],
    memberIds: [profile.id],
    memberNames: { [profile.id]: profile.displayName },
    categories: draft.categories.map(category => ({ ...category })),
    reactionDefs: draft.reactions.map(reaction => ({ ...reaction })),
    templateId: template.id,
    templateVersion: CURRENT_SPACE_TEMPLATE_VERSION,
    accentTheme: draft.accentTheme,
    starterPackApplied: template.id !== "blank" && draft.categories.length > 0,
    starterIdeasApplied: !draft.addStarterIdeas || draft.starterIdeas.length === 0,
    deletedAt: null,
    purgeAfter: null,
  };
}

const ACCENT_LABELS: Record<AccentTheme, string> = {
  teal: "Fresh teal",
  sky: "Open sky",
  peach: "Warm peach",
  yellow: "Sunny yellow",
  lavender: "Soft lavender",
  forest: "Trail green",
};

export function SpaceTemplateCreator({
  profile,
  onClose,
  onSaved,
  onboarding = false,
}: {
  profile: UserProfile;
  onClose?: () => void;
  onSaved: (id: string, inviteAfter?: boolean) => void;
  onboarding?: boolean;
}) {
  const [draft, setDraft] = useState(() => initialSpaceTemplateDraft(shouldDefaultStarterIdeas(profile)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [createdSpaceId, setCreatedSpaceId] = useState("");
  const [failedStarterTitles, setFailedStarterTitles] = useState<string[]>([]);
  const submitting = useRef(false);
  const selected = draft.templateId ? getSpaceTemplateDefinition(draft.templateId) : null;

  const choose = (templateId: SpaceTemplateId) => setDraft(current => selectSpaceTemplate(current, templateId));
  const starterInputs = (spaceId: string) => draft.starterIdeas.map(idea => ({ spaceId, profile, categories: draft.categories, idea }));
  const finishStarterIdeas = async (spaceId: string) => {
    const result = await applyStarterIdeas(starterInputs(spaceId));
    if (result.failed.length) {
      setCreatedSpaceId(spaceId);
      setFailedStarterTitles(result.failed.map(failure => failure.title));
      setError(`${result.failed.length} starter ${result.failed.length === 1 ? "Idea" : "Ideas"} could not be added. Your Space is safe.`);
      return false;
    }
    await changeSpace(spaceId, { starterIdeasApplied: true });
    return true;
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current || !draft.templateId) return;
    if (!draft.name.trim()) {
      setError("Give this Space a name before creating it.");
      return;
    }
    const categoriesError = categoryPackIssue(draft.categories);
    const startersError = starterIdeaIssue(draft.addStarterIdeas, draft.starterIdeas, draft.categories.length);
    if (categoriesError || startersError) {
      setError(categoriesError || startersError);
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await addSpace(createSpaceTemplatePayload(draft, profile), onboarding ? `onboarding-${profile.id}` : undefined);
      const complete = !draft.addStarterIdeas || !draft.starterIdeas.length || await finishStarterIdeas(result.id);
      if (complete) onSaved(result.id, draft.inviteAfter);
      else submitting.current = false;
    } catch (reason) {
      setError(messageFor(reason));
      submitting.current = false;
    } finally {
      setBusy(false);
    }
  };
  const retryStarterIdeas = async () => {
    if (!createdSpaceId || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      if (await finishStarterIdeas(createdSpaceId)) onSaved(createdSpaceId, draft.inviteAfter);
      else submitting.current = false;
    } catch (reason) {
      setError(messageFor(reason));
      submitting.current = false;
    } finally {
      setBusy(false);
    }
  };

  if (createdSpaceId && failedStarterTitles.length) return <section className="modal panel starter-partial" aria-labelledby="starter-partial-title">
    <p className="eyebrow">Your Space is safe</p>
    <h2 id="starter-partial-title">A few starting Ideas need another try</h2>
    <p>The Space was created successfully. These Ideas are still waiting: {failedStarterTitles.join(", ")}.</p>
    {error && <div className="error" role="alert">{error}</div>}
    <div className="starter-partial-actions">
      <button type="button" className="secondary" disabled={busy} onClick={() => onSaved(createdSpaceId, draft.inviteAfter)}>Continue without them</button>
      <button type="button" className="primary" disabled={busy} onClick={retryStarterIdeas}>{busy ? "Trying again..." : "Retry starter Ideas"}</button>
    </div>
  </section>;
  if (draft.step === "template") return <section className="modal panel template-space-flow" aria-labelledby="space-template-title">
    <header>
      <div>
        <p className="eyebrow">A starting point, never a limitation</p>
        <h2 id="space-template-title">What kind of adventures are you planning together?</h2>
        <p className="template-space-lead">Choose the closest fit. You can personalize everything before the Space is created.</p>
      </div>
      {onClose && <button type="button" className="icon" aria-label="Close Space creation" onClick={onClose}><X /></button>}
    </header>
    <div className="space-template-grid" role="radiogroup" aria-label="Space templates">
      {SPACE_TEMPLATE_DEFINITIONS.map(template => <button
        key={template.id}
        type="button"
        role="radio"
        aria-checked={draft.templateId === template.id}
        className={`space-template-card accent-${template.accentTheme}`}
        onClick={() => choose(template.id)}
      >
        <span className="space-template-icon" aria-hidden="true">{template.emoji}</span>
        <span className="space-template-copy"><b>{template.name}</b><small>{template.description}</small></span>
        <span className="space-template-examples" aria-label={`Example categories for ${template.name}`}>
          {getCategoryPack(template.id).slice(0, 3).map(category => <i key={category.id}>{category.emoji} {category.label}</i>)}
          {template.id === "blank" && <i>Choose every detail yourself</i>}
        </span>
      </button>)}
    </div>
  </section>;

  return <form className="modal panel template-space-flow template-space-customize" onSubmit={submit}>
    <header>
      <div>
        <p className="eyebrow">Make the starting point yours</p>
        <h2>Shape your {selected?.name} Space</h2>
        <p className="template-space-lead">Nothing is saved until you choose Create Space.</p>
      </div>
      {onClose && <button type="button" className="icon" aria-label="Close Space creation" onClick={onClose}><X /></button>}
    </header>

    <div className={`space-template-selected accent-${draft.accentTheme}`}>
      <span aria-hidden="true">{draft.emoji}</span>
      <div><small>Selected template</small><b>{selected?.name}</b><p>{selected?.description}</p></div>
      <Check aria-hidden="true" />
    </div>

    <div className="twocol template-space-fields">
      <label>Space emoji<input aria-label="Space emoji" value={draft.emoji} maxLength={8} onChange={event => setDraft(current => ({ ...current, emoji: event.target.value }))} /></label>
      <label>Space name<input autoFocus required maxLength={80} value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} placeholder="Our next adventures" /></label>
    </div>

    <fieldset className="template-accent-picker">
      <legend>Accent theme</legend>
      <div role="radiogroup" aria-label="Space accent theme">
        {ACCENT_THEMES.map(accent => <button
          key={accent}
          type="button"
          role="radio"
          aria-checked={draft.accentTheme === accent}
          className={`accent-choice accent-${accent}${draft.accentTheme === accent ? " selected" : ""}`}
          onClick={() => setDraft(current => ({ ...current, accentTheme: accent }))}
        ><span aria-hidden="true" />{ACCENT_LABELS[accent]}{draft.accentTheme === accent && <Check aria-hidden="true" />}</button>)}
      </div>
    </fieldset>

    <CategoryPackEditor categories={draft.categories} onChange={categories => setDraft(current => ({ ...current, categories }))} />

    <StarterIdeaEditor available={draft.templateId !== "blank"} enabled={draft.addStarterIdeas} ideas={draft.starterIdeas} categoryCount={draft.categories.length} onEnabled={addStarterIdeas => setDraft(current => ({ ...current, addStarterIdeas }))} onChange={starterIdeas => setDraft(current => ({ ...current, starterIdeas }))} />

    {!onboarding && <label className="toggle invite-later"><input type="checkbox" checked={draft.inviteAfter} onChange={event => setDraft(current => ({ ...current, inviteAfter: event.target.checked }))} /><span><b>Invite someone next</b><small>You can also invite people later from Space settings.</small></span></label>}
    {error && <div className="error" role="alert">{error}</div>}
    <footer className="template-space-actions">
      <button type="button" className="secondary" disabled={busy} onClick={() => setDraft(current => ({ ...current, step: "template" }))}><ArrowLeft />Back</button>
      <button className="primary" disabled={busy || !draft.name.trim()}>{busy ? "Creating Space…" : "Create Space"}</button>
    </footer>
  </form>;
}
