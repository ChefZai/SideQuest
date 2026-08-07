# Sprint 4 Runtime Audit

## Startup sequence

SideQuest loads HTML and the shared CSS first, then the React shell and Firebase vendor chunk. Firebase restores authentication before authenticated subscriptions mount. Once a profile is available, the Space listener resolves the last still-accessible Space, then the selected Space's Quests and Space-scoped Activity listeners populate Home. Layout-shaped skeletons remain visible while content and imagery decode; below-the-fold card images load lazily.

The application does not expose authenticated content before auth resolution. The primary remaining startup constraint is the Firebase vendor chunk and network-dependent Google Fonts. Fraunces and Inter use sensible local fallbacks, but both should be bundled locally before an offline-first Capacitor release, subject to font licensing and asset review.

## Real-time listener inventory

| Feature | Scope | Mount condition | Cleanup | Notes |
| --- | --- | --- | --- | --- |
| Spaces | `memberIds array-contains uid` | authenticated shell | effect unsubscribe | establishes accessible Spaces |
| Quests | selected `spaceId` | active Space | effect unsubscribe | one selected Space at a time |
| Activity/Home | one `spaceId ==` query per accessible Space, limit 50 each | authenticated shell | aggregate unsubscribe | replaces the rules-incompatible multi-Space `in` query; results merge and cap at 50 |
| Quest Journey | `spaceId` + `targetId`, limit 100 | open Quest | effect unsubscribe | meaningful timeline only |
| Reactions | open Quest subcollection | open Quest | effect unsubscribe | collaborative real time |
| Comments | open Quest subcollection | open Quest | effect unsubscribe | collaborative real time |
| Plan | one plan document | Plan tab | effect unsubscribe | initialized once through a shared in-flight guard |
| Memory | one memory document | Memory tab | effect unsubscribe | legacy values normalized on read |
| Reflections | one Memory subcollection | Memory tab | effect unsubscribe | only while Memory is open |

The older `src/services/data.ts` adapter is not imported by the active Version 2 application. It remains for compatibility and should be removed only in a dedicated dead-code audit.

## Read impact

Before Sprint 4, the global Activity listener used one `in` query across as many as ten Spaces. Firestore rules could not safely prove membership for every candidate record, causing emulator permission failures and leaving the feed empty. Sprint 4 uses one explicitly authorized, limited listener per accessible Space and merges results deterministically. This can use more listener handles for multi-Space accounts, but prevents repeated failing reads and preserves collaboration correctness. Detail-only listeners remain unmounted until their corresponding Quest tab opens.

## Reliability findings

- Missing `photoUrls` on legacy Memory records crashed the entire authenticated tree. Memory input is now normalized and Story readiness independently tolerates malformed optional values.
- Overlapping browser View Transitions could reject with `InvalidStateError`. Aborted visual transitions now degrade silently while the state update remains authoritative.
- React Strict Mode could race Plan or Memory initialization. Module-level in-flight guards now coalesce the same initialization request.
- Upload processing, upload completion, Firestore writes, and cleanup are bounded. Unsupported HEIC/HEIF and oversized files receive explicit human messages.
- Image failure retains an intentional visual fallback instead of a broken-image glyph.
- The app shell has a human error boundary with Retry and Reload actions; diagnostics contain only structured feature, operation, category, recoverability, and optional error code.

## Authenticated QA fixtures

`.env.qa` connects only to localhost Auth, Firestore, and Storage emulators. `scripts/qa-fixtures.mjs` resets and recreates deterministic new-user, first-use, populated solo, shared, and edge-case states. It never writes to production. See `AUTHENTICATED_QA.md` for commands and credentials.

## Image limitations

Browser `sizes`, lazy loading, decode-aware reveal, client compression, and stable aspect ratios reduce avoidable transfer and layout shift. Firebase Storage currently provides only the uploaded rendition, so the browser cannot choose truly resized card variants. A future server-side resize pipeline or native image pipeline should generate durable responsive renditions. Full HEIC/HEIF decoding is not claimed.

## Native-readiness blockers

- Google OAuth popup/redirect behavior requires device verification and likely native provider integration.
- Invitation, password-reset, and verification links need iOS Universal Links and Android App Links.
- Remote Google Fonts should be packaged locally for reliable offline native startup.
- Photo capture should use a Capacitor Camera abstraction; current file selection is WebView-dependent.
- External maps and links should move through Capacitor Browser/App APIs.
- `localStorage`, online state, browser history, share, and clipboard abstractions require device lifecycle testing.
- Google Maps key restrictions must include native application identifiers before native distribution.

## Security assessment

QA credentials and fixture data are local-only and contain no secrets. Production Firebase configuration and rules are unchanged. Diagnostics intentionally exclude titles, comments, reflections, images, locations, tokens, and credentials. Production dependency reachability is assessed separately through `npm audit --omit=dev`.
