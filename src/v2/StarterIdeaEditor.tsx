import { X } from "lucide-react";
import type { StarterIdeaDraft } from "../features/templates/starterIdeas";
import "./starter-ideas.css";

export function updateStarterIdea(
  ideas: readonly StarterIdeaDraft[],
  id: string,
  patch: Partial<Pick<StarterIdeaDraft, "title" | "description">>,
): StarterIdeaDraft[] {
  return ideas.map(idea => idea.id === id ? { ...idea, ...patch } : { ...idea });
}

export function removeStarterIdea(ideas: readonly StarterIdeaDraft[], id: string): StarterIdeaDraft[] {
  return ideas.filter(idea => idea.id !== id).map(idea => ({ ...idea }));
}

export function starterIdeaIssue(enabled: boolean, ideas: readonly StarterIdeaDraft[], categoryCount: number): string {
  if (!enabled) return "";
  if (ideas.some(idea => !idea.title.trim())) return "Every starter Idea needs a title.";
  if (ideas.length > 0 && categoryCount === 0) return "Keep or add at least one category to use starter Ideas.";
  return "";
}

export function StarterIdeaEditor({
  available,
  enabled,
  ideas,
  categoryCount,
  onEnabled,
  onChange,
}: {
  available: boolean;
  enabled: boolean;
  ideas: StarterIdeaDraft[];
  categoryCount: number;
  onEnabled: (enabled: boolean) => void;
  onChange: (ideas: StarterIdeaDraft[]) => void;
}) {
  if (!available) return <section className="starter-idea-editor starter-idea-empty">
    <div><h3>Start completely open</h3><p>Blank Spaces do not add starter Ideas. You can create anything after the Space opens.</p></div>
  </section>;
  const issue = starterIdeaIssue(enabled, ideas, categoryCount);
  return <section className="starter-idea-editor" aria-labelledby="starter-idea-title">
    <label className="toggle starter-idea-toggle">
      <input type="checkbox" checked={enabled} onChange={event => onEnabled(event.target.checked)} />
      <span><b id="starter-idea-title">Add a few Ideas to help us get started</b><small>They are ordinary Ideas created by you. Edit or remove them anytime.</small></span>
    </label>
    {enabled && <div className="starter-idea-list">
      {ideas.map(idea => <article key={idea.id}>
        <span aria-hidden="true">✨</span>
        <div>
          <label><span className="sr-only">Starter Idea title</span><input aria-label={`Starter Idea title: ${idea.title}`} maxLength={100} value={idea.title} onChange={event => onChange(updateStarterIdea(ideas, idea.id, { title: event.target.value }))} /></label>
          <label><span className="sr-only">Starter Idea note</span><textarea aria-label={`Starter Idea note for ${idea.title}`} maxLength={500} value={idea.description} onChange={event => onChange(updateStarterIdea(ideas, idea.id, { description: event.target.value }))} /></label>
        </div>
        <button type="button" className="icon" aria-label={`Remove starter Idea ${idea.title}`} onClick={() => onChange(removeStarterIdea(ideas, idea.id))}><X /></button>
      </article>)}
      {!ideas.length && <p className="starter-idea-none">No starter Ideas selected. Your Space will still be created normally.</p>}
    </div>}
    {issue && <p className="category-pack-warning" role="alert">{issue}</p>}
  </section>;
}
