# Installment Calculator – Desktop (Electron)

Desktop version of the Android app. It uses the **same Firebase / Firestore project**,
so calculations saved on the phone appear here and vice versa.

## Run in VS Code

1. Install **Node.js 18+** (https://nodejs.org).
2. Open this folder in VS Code (`File > Open Folder`).
3. Open the terminal (`Ctrl + ` `) and run:

```bash
npm install
npm run dev
```

The app window opens with hot reload (edit a file, the window updates).

## Other commands

| Command | What it does |
|---|---|
| `npm run dev` | Development mode with hot reload + DevTools |
| `npm start` | Build, then run the production build in Electron |
| `npm run typecheck` | TypeScript check |
| `npm run dist` | Create an installer in `release/` (Windows `.exe`, macOS `.dmg`, Linux `.AppImage` – build on the OS you target) |

## Project layout

```
electron/main.js        Electron main process (window, single-instance lock)
index.html              Vite entry
src/
  domain/               Calculator math            (copied unchanged from the Android app)
  data/entities.ts      Types                      (copied unchanged)
  data/repository/      planRepository (Firestore) (copied unchanged)
  data/firebase/        Firebase config            (same project; long-polling enabled for desktop)
  hooks/useCalculator   View-model                 (copied unchanged)
  ui/                   React DOM screens + CSS     (rewritten for desktop)
```

Anything you change in `domain/`, `data/` or `hooks/` can be copied back to the
Android project, because those folders have no React Native dependencies.

## Notes

- Needs an internet connection (data lives in Firestore).
- The Firebase config in `src/data/firebase/firebase.ts` is a public web config, which is
  normal. What actually protects your data are your **Firestore security rules** in the
  Firebase console. Since neither app has login, the rules currently must allow open
  read/write, so consider adding Firebase Authentication later.
- To add an app icon for installers, put `icon.png` (512x512) in a `build/` folder.
