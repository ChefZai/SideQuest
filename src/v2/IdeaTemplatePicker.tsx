import { ArrowLeft, ChevronRight, X } from "lucide-react";
import { IDEA_TEMPLATE_DEFINITIONS, getSuggestedIdeaTemplates } from "../features/templates/ideaTemplates";
import type { IdeaTemplateDefinition, IdeaTemplateId } from "../features/templates/templateTypes";
import type { Space } from "./domain";
import "./idea-template-picker.css";

const POPULAR_IDS: readonly IdeaTemplateId[] = ["restaurant", "activity", "event", "trip", "movie", "custom"];

export function suggestedTemplateIds(space: Pick<Space, "templateId">): IdeaTemplateId[] {
  const suggested = getSuggestedIdeaTemplates(space.templateId ?? "blank").map(template => template.id);
  return [...new Set(suggested.length ? suggested : POPULAR_IDS)];
}

function TemplateCard({ template, onSelect }: {
  template: IdeaTemplateDefinition;
  onSelect: (id: IdeaTemplateId) => void;
}) {
  return <button
    type="button"
    className="idea-template-card"
    aria-label={`${template.name}. ${template.description}. Example fields: ${template.exampleFields.join(", ")}`}
    onClick={() => onSelect(template.id)}
  >
    <span className="idea-template-icon" aria-hidden="true">{template.emoji}</span>
    <span><b>{template.name}</b><small>{template.description}</small><i>{template.exampleFields.join(" · ")}</i></span>
    <ChevronRight aria-hidden="true" />
  </button>;
}

function TemplateSection({ title, copy, templates, onSelect }: {
  title: string;
  copy: string;
  templates: IdeaTemplateDefinition[];
  onSelect: (id: IdeaTemplateId) => void;
}) {
  return <section className="idea-template-section" aria-labelledby={`idea-template-${title.replaceAll(" ", "-").toLowerCase()}`}>
    <header><div><h3 id={`idea-template-${title.replaceAll(" ", "-").toLowerCase()}`}>{title}</h3><p>{copy}</p></div></header>
    <div className="idea-template-grid">{templates.map(template => <TemplateCard key={`${title}-${template.id}`} template={template} onSelect={onSelect} />)}</div>
  </section>;
}

export function IdeaTemplatePicker({ space, onSelect, onBack }: {
  space: Space;
  onSelect: (id: IdeaTemplateId) => void;
  onBack: () => void;
}) {
  const popular = POPULAR_IDS.map(id => IDEA_TEMPLATE_DEFINITIONS.find(template => template.id === id)!);
  const suggestedIds = suggestedTemplateIds(space);
  const suggested = suggestedIds.map(id => IDEA_TEMPLATE_DEFINITIONS.find(template => template.id === id)!).filter(Boolean);
  return <div className="modal panel idea-template-picker" aria-labelledby="idea-template-picker-title">
    <header>
      <button type="button" className="icon" aria-label="Back from Idea templates" onClick={onBack}><ArrowLeft /></button>
      <div><p className="eyebrow">{space.emoji} {space.name}</p><h2 id="idea-template-picker-title">What are you thinking?</h2><p>Start with a template or create something completely custom.</p></div>
      <button type="button" className="icon" aria-label="Close Idea template picker" onClick={onBack}><X /></button>
    </header>
    <TemplateSection title="Popular" copy="Easy places to begin when inspiration just arrived." templates={popular} onSelect={onSelect} />
    <TemplateSection title="Suggested for this Space" copy={`Starting points that fit ${space.name}. These are template suggestions, not personal recommendations.`} templates={suggested} onSelect={onSelect} />
    <TemplateSection title="All templates" copy="Every available shape, including a completely open Idea." templates={[...IDEA_TEMPLATE_DEFINITIONS]} onSelect={onSelect} />
  </div>;
}
