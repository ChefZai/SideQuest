# SideQuest Mobile Architecture

SideQuest uses two deliberate scroll roots:

1. `.content` is the sole page scroll root below the app bar. It owns responsive page padding, safe-area bottom clearance, and bottom-navigation clearance.
2. `.modal` is the sole scroll root inside `.backdrop`. The backdrop locks background movement; each dialog scrolls independently to its final action.

The permanent layout tokens live in `mobile-architecture.css`: safe-area insets, app chrome heights, page width and padding, content rhythm, bottom clearance, and dialog geometry. New screens should use `.content`; new overlays should be a direct `.modal` child of `.backdrop` rather than introducing another viewport-height or overflow container.

Mobile form controls render at 16px or larger to avoid Safari zoom. Interactive controls must expose at least a 44px hit area. At 768px and above, the document remains the normal page scroll root while dialogs continue to scroll independently.

Keyboard-safe dialogs use dynamic viewport units, safe-area insets, and an internal scroll root. Sticky actions belong inside the modal and must not cover the final field. Reduced-motion mode disables smooth scrolling and nonessential movement without changing state feedback.
