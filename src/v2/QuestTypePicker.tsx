import { ArrowLeft, ArrowRight, X } from "lucide-react";
import {
  QUEST_TYPE_DEFINITIONS,
  type QuestType,
} from "../features/quests/questTypes";
import "./quest-foundation.css";

export function QuestTypePicker({
  onSelect,
  onClose,
  compact = false,
}: {
  onSelect: (type: QuestType) => void;
  onClose: () => void;
  compact?: boolean;
}) {
  return (
    <section className="modal panel quest-type-picker" aria-labelledby="quest-type-title">
      <header>
        <div>
          <p className="eyebrow">New Quest</p>
          <h2 id="quest-type-title">What kind of Quest is this?</h2>
          <p>Choose the shape that feels closest. You can keep every detail simple.</p>
        </div>
        <button type="button" className="icon" aria-label="Close Quest type picker" onClick={onClose}>
          {compact ? <ArrowLeft /> : <X />}
        </button>
      </header>
      <div className="quest-type-grid" role="list">
        {QUEST_TYPE_DEFINITIONS.map(type => (
          <button
            type="button"
            role="listitem"
            className={`quest-type-option quest-type-${type.id}`}
            key={type.id}
            style={{ "--quest-accent": type.accent } as React.CSSProperties}
            onClick={() => onSelect(type.id)}
            aria-label={`${type.label}. ${type.description}`}
          >
            <span className="quest-type-icon" aria-hidden="true">{type.emoji}</span>
            <span><b>{type.label}</b><small>{type.description}</small></span>
            <ArrowRight aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}
