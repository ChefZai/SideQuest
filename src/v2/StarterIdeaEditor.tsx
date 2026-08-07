import { useState } from "react";
import { Plus, Settings2, X } from "lucide-react";
import type { StarterIdeaDraft } from "../features/templates/starterIdeas";
import type { CategoryDef } from "./domain";
import "./starter-ideas.css";

export function updateStarterIdea(ideas: readonly StarterIdeaDraft[], id: string, patch: Partial<Pick<StarterIdeaDraft, "title" | "description">>): StarterIdeaDraft[] {
  return ideas.map(idea => idea.id === id ? { ...idea, ...patch } : { ...idea });
}

export function removeStarterIdea(ideas: readonly StarterIdeaDraft[], id: string): StarterIdeaDraft[] {
  return ideas.filter(idea => idea.id !== id).map(idea => ({ ...idea }));
}

export function starterIdeaIssue(enabled: boolean, ideas: readonly StarterIdeaDraft[], categoryCount: number): string {
  if (!enabled) return "";
  if (ideas.some(idea => !idea.title.trim())) return "Every starter Quest needs a title.";
  if (ideas.length > 0 && categoryCount === 0) return "Keep or add at least one category to use starter Quests.";
  return "";
}

export function StarterIdeaEditor({ available, enabled, ideas, categories, onEnabled, onChange }: {
  available: boolean;
  enabled: boolean;
  ideas: StarterIdeaDraft[];
  categories: CategoryDef[];
  onEnabled: (enabled: boolean) => void;
  onChange: (ideas: StarterIdeaDraft[]) => void;
}) {
  const [editingId, setEditingId] = useState("");
  if (!available) return <section className="starter-idea-editor starter-idea-empty"><div><h3>Start completely open</h3><p>Blank Spaces do not add starter Quests. You can create anything after the Space opens.</p></div></section>;
  const issue = starterIdeaIssue(enabled, ideas, categories.length);
  const addStarter = () => {
    const id = `custom-${crypto.randomUUID()}`;
    onChange([...ideas, { id, title: "A new possibility", description: "", templateId: "custom", categoryId: categories[0]?.id || "possibility" }]);
    setEditingId(id);
  };
  return <section className="starter-idea-editor" aria-labelledby="starter-idea-title">
    <label className="toggle starter-idea-toggle"><input type="checkbox" checked={enabled} onChange={event => onEnabled(event.target.checked)} /><span><b id="starter-idea-title">Add a few Quests to help us begin</b><small>They become normal editable Quests after this Space opens.</small></span></label>
    {enabled && <><div className="starter-idea-toolbar"><button type="button" className="secondary small" onClick={addStarter}><Plus aria-hidden="true" />Add Quest</button><button type="button" className="link" onClick={() => onEnabled(false)}>Disable all</button></div><div className="starter-idea-list">
      {ideas.map(idea => <article key={idea.id}>
        <span aria-hidden="true">✨</span>
        <div><label><span className="sr-only">Starter Quest title</span><input aria-label={`Starter Quest title: ${idea.title}`} maxLength={100} value={idea.title} onChange={event => onChange(updateStarterIdea(ideas, idea.id, { title: event.target.value }))} /></label>{editingId === idea.id && <label><span className="sr-only">Starter Quest note</span><textarea autoFocus aria-label={`Starter Quest note for ${idea.title}`} maxLength={500} value={idea.description} onChange={event => onChange(updateStarterIdea(ideas, idea.id, { description: event.target.value }))} /></label>}</div>
        <div className="starter-idea-actions"><button type="button" className="icon" aria-label={`Edit starter Quest ${idea.title}`} aria-pressed={editingId === idea.id} onClick={() => setEditingId(current => current === idea.id ? "" : idea.id)}><Settings2 /></button><button type="button" className="icon" aria-label={`Remove starter Quest ${idea.title}`} onClick={() => onChange(removeStarterIdea(ideas, idea.id))}><X /></button></div>
      </article>)}
      {!ideas.length && <p className="starter-idea-none">No starter Quests selected. Your Space will still be created normally.</p>}
    </div></>}
    {issue && <p className="category-pack-warning" role="alert">{issue}</p>}
  </section>;
}
