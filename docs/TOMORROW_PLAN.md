# SideQuest — Tomorrow Plan

## Objective

Turn the working MVP into a safer, easier-to-maintain product without changing the approved visual experience or breaking Firebase data.

## Work order

1. **Add automated regression coverage**
   - Configure Vitest and React Testing Library.
   - Cover authentication helpers, invite-link parsing, calendar generation, data normalization, and Maps URL generation.
   - Add a single command that runs typecheck, tests, and the production build.

2. **Split the application into maintainable modules**
   - Extract Authentication, Ideas, Maps, Spaces, Planner, Memories, and Invitations from `AppV2.tsx`.
   - Extract shared modal, empty-state, and form components.
   - Format source files normally so code review and future UI changes are safe.
   - Preserve all current Firestore document fields and user-facing behavior.

3. **Harden invitations**
   - Add expiration and revocation.
   - Prevent stale or reused links from failing silently.
   - Show a clear invite preview and success/error state.
   - Narrow Firestore access to invitation data as far as the client architecture permits.

4. **Improve performance**
   - Lazy-load Google Maps only when the Map tab or location picker is opened.
   - Split large feature bundles.
   - Remove unused imports, legacy defaults, and inactive source files from the production path.
   - Target a materially smaller initial JavaScript download.

5. **Replace temporary browser dialogs**
   - Replace category `prompt()` dialogs with a SideQuest-styled modal.
   - Replace completed-Idea `confirm()` with an accessible confirmation dialog.
   - Add consistent loading, success, retry, and error feedback.

6. **Final verification and deployment**
   - Test desktop and phone layouts.
   - Test two-account collaboration and deep-link invitations.
   - Test offline/retry behavior, Maps, photos, Planner, Memories, and permissions.
   - Run the full diagnostic command, deploy, and create a clean Git checkpoint.

## Definition of done

- Existing user data remains compatible.
- Current MVP flows still pass manually.
- Automated tests protect the highest-risk logic.
- No production dependency vulnerabilities.
- Initial bundle is smaller than today's 942.67 KB uncompressed JavaScript bundle.
- Git working tree is clean and the deployed version matches the committed code.

## Diagnostic baseline

- TypeScript: passing
- Production build: passing
- Production dependency audit: 0 known vulnerabilities
- Current JavaScript bundle: 942.67 KB (247.44 KB gzip)
- Current CSS bundle: 16.17 KB
- Runtime source/config physical lines: 611
- Active project physical lines excluding generated lockfile: 813
- Archived legacy physical lines: 10,517

Physical line counts understate complexity because several active UI and CSS files are compressed onto very long lines.
