# SideQuest authenticated QA

This workflow uses disposable local Firebase emulators. It never reads or writes production data.

## Start

1. Run `npx firebase emulators:start --only auth,firestore,storage --project sidequest-2e798`.
2. In another terminal run `npm run qa:seed`.
3. Run `npm run dev:qa`.
4. Sign in with one of the accounts printed by the seed command.

Fixtures cover a new user, first use, populated solo use, shared collaboration, and malformed/legacy edge cases. Document IDs are stable so screenshots and assertions remain repeatable.

## Reset

Run `npm run qa:reset` while the emulators are running, then run `npm run qa:seed` again.

The seed script is hard-coded to localhost emulator ports and refuses non-local Firestore hosts. Do not add production credentials to this workflow.

## Visual QA

Use the owner account for populated screens, the member account for shared behavior, and the new-user account for onboarding. Verify 320, 375, 390, 430, 768, 1024, and 1440 pixel layouts. Reset after any test that mutates fixture state.
