# SideQuest Design System

SideQuest is a warm, calm, editorial product where photography and human stories lead while interface chrome stays quiet. The system must never make the product feel like project management software.

## Architecture

`src/v2/design-system.css` is the authoritative visual vocabulary and loads after all feature styles. `mobile-architecture.css` remains the source of truth for scroll roots, safe areas, dialog reachability, and mobile geometry. Feature styles may compose these tokens but should not redefine equivalent foundations.

Historical stylesheets remain active compatibility layers. They preserve authored layouts from Versions 5, 5.5, and 5.7 while the final design-system layer maps their public `--sq-*` variables to semantic roles. Removing them wholesale would be risky; migrate selectors when a component is already being changed.

## Tokens

Tokens have three levels:

1. Foundation: raw palette, spacing, type, radii, shadows, motion.
2. Semantic: canvas, surfaces, text, borders, actions, feedback, focus, overlays.
3. Component: page gutters, section gaps, card padding, control height, dialog geometry, navigation clearance.

Use semantic tokens in feature CSS. Raw palette values are reserved for defining a semantic role or an intentional illustration.

## Spacing

The scale is 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, and 80px. Common aliases are `--space-page-inline`, `--space-page-block`, `--space-section`, `--space-card`, `--space-control`, `--space-form`, and `--space-cluster`.

Editorial compositions may use fluid `clamp()` spacing when it creates intentional rhythm. Safe-area and bottom-navigation calculations are never replaced by fixed spacing.

## Typography

Fraunces carries emotional display roles; Inter carries body copy, metadata, forms, and controls. Use the documented display, page, section, card, body, label, caption, eyebrow, and button tokens. Body copy defaults to a comfortable 1.55 line height. Mobile controls remain at least 16px.

## Color

Warm cream is the canvas, paper white is the surface, evergreen is the primary action, and charcoal is primary text. Gold, peach, sky, and Space accents provide restrained emotional color. Semantic success, warning, error, and informational colors never borrow a Space accent.

## Shape and Elevation

Controls, inputs, chips, cards, editorial cards, dialogs, sheets, and pills each have a named radius. Shadows progress from subtle to card, floating, navigation, modal, and hero. Equivalent components use equivalent elevation; permanent heavy floating shadows are avoided.

## Buttons

Supported visual roles are primary, secondary, quiet/text, destructive, icon, floating, and success. Existing classes (`primary`, `secondary`, `link`, `danger`, `icon`, `fab`) map to these roles. Controls have a minimum 44px hit area, stable loading dimensions, aligned 18px icons, visible focus, pressed feedback, and readable disabled contrast.

## Cards

Hero Quest, Quest, Goal, Momentum, Memory, Collection, Chapter, Space, Inspiration, profile, and empty-state cards share the same surface, radius, depth, focus, and motion vocabulary. Image ratio and typography distinguish their emotional role. Photography uses centered cover cropping by default; intentional per-image positioning is allowed.

## Forms

Every field needs a visible label. Placeholders supplement rather than replace labels. Inputs share surface, border, radius, spacing, focus, invalid, and disabled states. Error language stays human. Mobile input, textarea, and select text is at least 16px to prevent Safari zoom.

## Dialogs and Sheets

The backdrop never scrolls. The direct modal child is the independent scroll root. Desktop uses a centered dialog; mobile uses sheet geometry with safe-area padding. Focus trapping, Escape handling, and focus restoration live in the App shell. Long Quest, Plan, and Memory detail content must never regain hidden overflow.

## Tabs, Chips, and Navigation

Tabs and segmented controls share height, padding, selected state, focus, and 320px horizontal behavior. Pills are reserved for compact metadata; interactive choices use chips; semantic lifecycle uses status styling. The fixed navigation honors Sprint 1 bottom clearance and safe areas.

## Motion and Focus

Version 5.7 timings remain canonical: 120ms instant feedback, 150ms quick feedback, 230ms standard transitions, and 330ms page emphasis, using the established easing curves. Reduced motion produces immediate equivalent state changes. Focus uses a high-contrast double ring that remains visible on paper, photography, and Memory surfaces.

## Feedback

Loading uses layout-shaped skeletons. Success, informational, warning, and error feedback share radius, spacing, elevation, safe placement, and announcements supplied by their React semantics. Disabled controls remain legible and explain inactivity through nearby copy when needed.

## Images

Primary Heroes may load eagerly. Below-fold imagery loads lazily with asynchronous decoding. Cards, Moments, Memories, Collections, Chapters, Inspiration, and onboarding imagery use cover cropping and stable containers. Meaningful images need descriptive alt text; decorative imagery uses empty alt text. Broken or missing images retain an intentional themed fallback.

## Responsive Behavior

Sprint 1 owns the 320–1440px geometry, dynamic viewport behavior, page scroll root, dialog scroll root, safe areas, and keyboard protection. Mobile uses one reading direction; tablet and desktop use space intentionally rather than stretching a phone layout.

## Accessibility

Touch targets are at least 44px. Focus is always visible. Color is never the sole state indicator. Heading order and labels remain semantic. Motion respects user preference. Contrast must remain readable over imagery and on dark Memory surfaces.

## Intentional Exceptions

- Hero and editorial cards may use larger radii and shadows than standard cards.
- Memories retain a darker, nostalgic surface treatment.
- Photography overlays may vary to preserve text contrast for a particular composition.
- Compact tab buttons may render visually below 44px only when their shared container and effective interactive area remain at least 44px.
- Legacy feature CSS remains until touched by feature work; new duplicate foundation tokens are not permitted.
