import { Plus, X } from "lucide-react";
import type { CategoryDef } from "./domain";
import "./category-pack.css";

export function categoryPackIssue(categories: readonly CategoryDef[]): string {
  const labels = new Set<string>();
  const ids = new Set<string>();
  for (const category of categories) {
    const id = category.id.trim();
    const label = category.label.trim();
    if (!id || !label) return "Every category needs a name.";
    if (ids.has(id)) return "Each category needs a unique internal ID.";
    if (labels.has(label.toLocaleLowerCase())) return `“${label}” appears more than once. Give each category a distinct name.`;
    ids.add(id);
    labels.add(label.toLocaleLowerCase());
  }
  return "";
}

export function addCustomCategory(categories: readonly CategoryDef[], id = crypto.randomUUID()): CategoryDef[] {
  return [...categories.map(category => ({ ...category })), {
    id: `custom-${id}`,
    emoji: "✨",
    label: "New category",
    accent: "32,181,155",
  }];
}

export function updateCategory(
  categories: readonly CategoryDef[],
  id: string,
  patch: Partial<Pick<CategoryDef, "emoji" | "label">>,
): CategoryDef[] {
  return categories.map(category => category.id === id ? { ...category, ...patch } : { ...category });
}

export function removeCategory(categories: readonly CategoryDef[], id: string): CategoryDef[] {
  return categories.filter(category => category.id !== id).map(category => ({ ...category }));
}

export function CategoryPackEditor({ categories, onChange }: {
  categories: CategoryDef[];
  onChange: (categories: CategoryDef[]) => void;
}) {
  const issue = categoryPackIssue(categories);
  return <section className="category-pack-editor" aria-labelledby="template-category-title">
    <div className="category-pack-heading">
      <div>
        <h3 id="template-category-title">Your starting categories</h3>
        <p>{categories.length ? "Keep what helps, rename anything, or add your own." : "Start blank or add a category now."}</p>
      </div>
      <button type="button" className="secondary small" onClick={() => onChange(addCustomCategory(categories))}><Plus />Add category</button>
    </div>
    {categories.length > 0 && <div className="category-pack-rows">
      {categories.map(category => <div className="category-pack-row" key={category.id}>
        <label><span className="sr-only">Emoji for {category.label}</span><input aria-label={`Emoji for ${category.label}`} maxLength={8} value={category.emoji} onChange={event => onChange(updateCategory(categories, category.id, { emoji: event.target.value }))} /></label>
        <label><span className="sr-only">Category name</span><input aria-label={`Category name for ${category.label}`} maxLength={60} value={category.label} onChange={event => onChange(updateCategory(categories, category.id, { label: event.target.value }))} /></label>
        <button type="button" className="icon" aria-label={`Remove ${category.label || "category"}`} onClick={() => onChange(removeCategory(categories, category.id))}><X /></button>
      </div>)}
    </div>}
    {issue && <p className="category-pack-warning" role="alert">{issue}</p>}
  </section>;
}
