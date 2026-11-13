# Online leaderboard: Firebase setup

**Status: live** since 2026-11-13, on the Firebase project `trashpanda-trow`. Without a configured project, the game keeps only a high-score table on each device (title screen > HIGH SCORES).

- **Code:** [src/core/Leaderboard.ts](../src/core/Leaderboard.ts) talks to Firestore's REST API. There's no Firebase SDK, so the bundle stays small.
- **Config:** [src/data/leaderboard.config.ts](../src/data/leaderboard.config.ts) holds the two values to fill in.
- **When it writes:** after every mission won, the run's entry is created or updated. There's one entry per run: initials, score, difficulty, missions done.
- **What never posts:** `?debug` sessions (they have cheat hooks) and automated browsers such as the Playwright tests (`navigator.webdriver`).
- **Where it shows:** HIGH SCORES displays "WORLD TOP 10" beside this device's table once it's configured.

## What you need to do (about 10 minutes)

1. Go to <https://console.firebase.google.com>, click **Add project**, and name it (e.g. `trashpanda-scores`). Google Analytics isn't needed.
2. **Build > Firestore Database > Create database.**
   - Pick a location; `northamerica-northeast2` is Toronto.
   - Start in **production mode**.
3. On the **Rules** tab, replace everything with the rules below and click **Publish**.
4. **Project settings** (the gear) > **General** > **Your apps** > the **Web** icon `</>`. Register an app (no Firebase Hosting needed) and copy `projectId` and `apiKey` out of the `firebaseConfig` it shows.
5. Send me those two values, or paste them into `src/data/leaderboard.config.ts` yourself. That's all it needs.
6. Recommended: in the [Google Cloud console](https://console.cloud.google.com/apis/credentials) for the same project, open the API key and limit where it can be used:
   - **Website restrictions:** `https://besit.github.io/*`, plus `http://localhost:*` for testing.
   - **API restrictions:** Cloud Firestore API only.

**The `apiKey` is not a secret.** A Firebase web key only says which project to talk to, and it ends up in the published JavaScript either way. What protects the data is the rules below plus the key restrictions in step 6.

## Firestore rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /scores/{runId} {
      allow read: if true;
      allow create: if valid(request.resource.data);
      // a run's score only goes up, a mission's worth at a time, at most once every 20 s
      allow update: if valid(request.resource.data)
        && request.resource.data.score >= resource.data.score
        && request.resource.data.score - resource.data.score <= 20000
        && request.time > resource.data.updated + duration.value(20, 's');
      allow delete: if false;

      function valid(d) {
        return d.keys().hasOnly(['name', 'score', 'difficulty', 'missions', 'updated'])
          && d.name is string && d.name.matches('^[A-Z]{1,3}$')
          && d.score is int && d.score >= 0 && d.score <= 200000
          && d.difficulty in ['easy', 'normal', 'hard']
          && d.missions is int && d.missions >= 0 && d.missions <= 12
          && d.updated == request.time;
      }
    }
  }
}
```

## Honest limits

- **It can't stop a determined cheater.** The game runs in the browser, so anyone can send a made-up score that stays inside the rules' limits.
- **The rules keep it sane:**
  - only three capital letters for initials
  - a score ceiling, and scores can only go up
  - a rate limit on updates
  - no deletes
- **Going further:**
  - Firebase **App Check** (reCAPTCHA) makes scripted submissions harder.
  - A Cloud Function that checks each run would make cheating much harder, but needs the paid Blaze plan.
- **Moderating:** delete a bad entry by hand in the Firestore console.
- **Free tier:** the Spark plan allows 50,000 document reads and 20,000 writes per day, with 1 GiB stored. One HIGH SCORES visit reads 10 documents and each mission won writes 1, so a hobby game stays far inside it. Sources: [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans), [Firestore quotas](https://docs.cloud.google.com/firestore/quotas).
