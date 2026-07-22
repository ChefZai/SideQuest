# SideQuest

**Collect ideas today. Live them tomorrow.**

SideQuest is a private collaborative idea space. People collect inspiration, react on their own time, discuss possibilities without pressure, and keep completed Ideas as shared memories.

## Current MVP

- Email/password accounts and restored sessions
- Private multi-member Spaces
- Custom Space emoji, categories, and reaction language
- Realtime Ideas scoped to the active Space
- Permanent Firebase Storage photo uploads
- Realtime per-user reactions and comments
- Edit, delete, complete, and reopen Ideas
- Realtime Activity feed
- Invitation codes for joining a Space
- Responsive landing, onboarding, empty, loading, and error states

## Local development

Prerequisites:

- Node.js 22 LTS
- JDK 21 or newer (required by the Firebase emulators)
- Firebase CLI access through the project dependency (`npx firebase`)

```powershell
npm install
npm run dev
```

Quality check:

```powershell
npm run check
```

## Required Firebase setup

1. In Firebase Authentication, enable **Email/Password**.
2. Create Cloud Firestore and Firebase Storage.
3. Install the Firebase CLI and authenticate.
4. From this folder, deploy the included rules:

```powershell
npx firebase deploy --only firestore:rules,storage
```

The project is configured for Firebase project `sidequest-2e798` in `.firebaserc`.

## Data model

```text
users/{uid}
spaces/{spaceId}
ideas/{ideaId}
ideas/{ideaId}/reactions/{uid}
ideas/{ideaId}/comments/{commentId}
activity/{activityId}
invitations/{invitationId}
```

Space documents hold `memberIds`, custom category definitions, and custom reaction definitions. Firestore and Storage rules restrict Idea content and photos to authenticated Space members.

## Two-user verification

1. Create account A and a Space.
2. Generate an invitation code from Profile.
3. In a private browser, create account B and join using the code.
4. Add an Idea with account A.
5. Confirm it appears for B without a refresh.
6. React and comment as B.
7. Confirm both changes appear for A in realtime.
8. Complete the Idea and confirm it moves from Active to Completed for both accounts.

## Legacy prototype

The original Figma-generated application is preserved under `legacy/` for visual comparison. It is not part of the production build.
