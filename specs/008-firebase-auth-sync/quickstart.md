# Quickstart: 008-firebase-auth-sync

## Prerequisites

- Firebase project created at https://console.firebase.google.com
- Authentication enabled: Google sign-in + Email/Password
- Firestore database created (production mode, then apply security rules below)

---

## 1. Install Firebase

```bash
npm install firebase
```

Firebase is loaded via dynamic `import()` at runtime (lazy), so it does not increase initial bundle size.

---

## 2. Create Firebase Config File

Create `src/auth/firebase-config.ts` (gitignored — add to `.gitignore`):

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

> **Note**: These keys are safe to expose in browser apps — Firestore security rules enforce access control.
> Do NOT commit this file to a public repository if your project ID is sensitive.

---

## 3. Apply Firestore Security Rules

In Firebase Console → Firestore → Rules, paste the contents of:

```
specs/008-firebase-auth-sync/contracts/firestore.rules
```

---

## 4. Environment Variables (Optional — for CI/CD)

If deploying via GitHub Actions (existing 007 workflow), add Firebase config as repository secrets
and generate `firebase-config.ts` at build time:

```yaml
# In .github/workflows/deploy.yml
- name: Write Firebase config
  run: |
    cat > src/auth/firebase-config.ts << EOF
    export const firebaseConfig = {
      apiKey: "${{ secrets.FIREBASE_API_KEY }}",
      authDomain: "${{ secrets.FIREBASE_AUTH_DOMAIN }}",
      projectId: "${{ secrets.FIREBASE_PROJECT_ID }}",
      storageBucket: "${{ secrets.FIREBASE_STORAGE_BUCKET }}",
      messagingSenderId: "${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}",
      appId: "${{ secrets.FIREBASE_APP_ID }}"
    };
    EOF
```

---

## 5. Vite Config Update

Update `vite.config.ts` to split the Firebase chunk for optimal loading:

```typescript
rollupOptions: {
  output: {
    manualChunks: {
      firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
    }
  }
}
```

---

## 6. Development

```bash
npm run dev
```

The app runs fully offline without any Firebase credentials. Sign-in UI appears in the header.
If `firebase-config.ts` is missing, auth initializes to `signed-out` state silently.

---

## 7. Verify Sync

1. Open app in Chrome, sign in with Google
2. Add a note for today's date
3. Open the app in Firefox (or incognito), sign in with the same account
4. Verify the note appears within ~2 seconds
5. Edit the note in Firefox; verify the change appears in Chrome

---

## 8. File Checklist

```
src/auth/
  firebase-config.ts    ← create manually (gitignored)
  auth-types.ts         ← created by this feature
  auth-service.ts       ← created by this feature
  auth-ui.ts            ← created by this feature
  auth-modal.ts         ← created by this feature

src/sync/
  sync-types.ts         ← created by this feature
  sync-service.ts       ← created by this feature
  sync-merge.ts         ← created by this feature

src/notes/notes-storage.ts    ← modified (sync hooks added)
src/challenges/challenges-storage.ts  ← modified (sync hooks added)
src/main.ts             ← modified (auth init call)
index.html              ← modified (auth button placeholder)
vite.config.ts          ← modified (manualChunks)
.gitignore              ← modified (add firebase-config.ts)
```
