# Online leaderboard and play counter: Firebase setup

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

**The `apiKey` is not a secret.** A Firebase web key only says which project to talk to, and it ends up in the published JavaScript either way. **The rules below are the only thing protecting the data.**

Tested on 2026-11-13, with step 6 applied:
- **Firestore's REST API ignores the key entirely.** Requests with no key, a bogus key, or any `Referer` header all succeed, subject to the rules. So the website restriction doesn't limit Firestore, and `localhost` works without being listed.
- **The API restriction does work.** The same key is refused (403) by other Google APIs, so nobody can spend it on anything but Firestore.

That's why step 6 is still worth doing, but a `Referer` header is trivially faked anyway.

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
          && d.name is string && d.name.matches('^[A-Z0-9]{1,10}$')
          && d.score is int && d.score >= 0 && d.score <= 200000
          && d.difficulty in ['easy', 'normal', 'hard']
          && d.missions is int && d.missions >= 0 && d.missions <= 13
          && d.updated == request.time;
      }
    }

    // 1.0: the anonymous play counter (src/core/Telemetry.ts), one document per visit
    match /sessions/{id} {
      allow read: if true;
      allow create: if id.matches('^[a-z0-9]{8,24}$')
        && request.resource.data.keys().hasOnly(['player', 'seconds', 'missions', 'touch', 'ver', 'started', 'updated'])
        && request.resource.data.player is string && request.resource.data.player.matches('^[a-z0-9]{8,24}$')
        && request.resource.data.seconds is int && request.resource.data.seconds >= 0 && request.resource.data.seconds <= 600
        && request.resource.data.missions is int && request.resource.data.missions >= 0 && request.resource.data.missions <= 13
        && request.resource.data.touch is bool
        && request.resource.data.ver is string && request.resource.data.ver.size() <= 12
        && request.resource.data.started == request.time
        && request.resource.data.updated == request.time;
      // only the time and the missions change; time can't grow faster than the clock; one update per 20 s
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['seconds', 'missions', 'updated'])
        && request.resource.data.seconds is int
        && request.resource.data.seconds >= resource.data.seconds
        && request.resource.data.seconds - resource.data.seconds <= (request.time.toMillis() - resource.data.updated.toMillis()) / 1000 + 10
        && request.resource.data.missions is int && request.resource.data.missions >= 0 && request.resource.data.missions <= 13
        && request.resource.data.updated == request.time
        && request.time > resource.data.updated + duration.value(20, 's');
      allow delete: if false;
    }
  }
}
```

## Republish the rules for 1.0

The rules above changed in 1.0, so paste and **Publish** them again:
- **The play counter** (`sessions`) is new. Nothing is counted until it's published.
- **Scores take 13 missions.** The game has 13, but the first rules capped `missions` at 12, so a finished game's final score was refused. Until you republish, the game retries a refused score with 12 (and with the name's first three letters if the long name was the problem).

## The play counter (1.0)

**It only starts counting once the rules above are published:** Firestore console > the `trashpanda-trow` project > Firestore Database > **Rules**, paste the whole block, **Publish**. Until then the game's writes are refused and nothing is counted (the game doesn't notice).

- **What it sends:** one document per visit in `sessions`:
  - `player`: a random number made on the first visit and kept in the browser, so a second visit counts as the same player
  - `seconds`: time actually played. That means the tab is visible and there was input in the last 90 s, so a paused, forgotten tab doesn't count.
  - `missions`: missions done in the current run
  - `touch`: phone or computer
  - `ver`: the game version
  - `started` / `updated`: server times
- **What it doesn't send:** names, cookies, the leaderboard name, anything typed. Firestore sees the visitor's IP address like any website request, as the leaderboard already does; the game never stores it.
- **When it writes:**
  - 5 s after the page opens (the visit)
  - at 1, 2, 5, 10, 15, 20, 30, 45 and 60 minutes played, then every 30 minutes
  - when the tab is hidden or closed

  A whole game is about 10 writes; 1,000 visits a day stays inside the free 20,000.
- **Never counted:** `?debug` sessions, automated browsers (the tests, the promo recorder), and browsers with Do Not Track or Global Privacy Control on.
- **It's disclosed** on the ABOUT page: "NO ADS, NO COOKIES. PLAYS AND MINUTES PLAYED ARE COUNTED ANONYMOUSLY; DO NOT TRACK TURNS IT OFF.".
- **Reading it:** `node tools/stats.mjs`, or `node tools/stats.mjs 7` for the last week. It prints:
  - visits (phones and computers), players, returning players
  - hours played, median minutes per visit and per player
  - how far players got
  - visits per day
- **Limits:** like the leaderboard, someone determined can send made-up visits. The rules cap the time at what the clock allows and allow no deletes. Treat the numbers as a good estimate, not an audit.

## Honest limits

- **It can't stop a determined cheater.** The game runs in the browser, so anyone can send a made-up score that stays inside the rules' limits.
- **The rules keep it sane:**
  - a name of 1 to 10 capital letters or digits (M4.5; it was three initials. Until these rules are republished, the game falls back to posting a long name's first three letters)
  - a score ceiling, and scores can only go up
  - a rate limit on updates
  - no deletes
- **Going further:**
  - Firebase **App Check** (reCAPTCHA) makes scripted submissions harder.
  - A Cloud Function that checks each run would make cheating much harder, but needs the paid Blaze plan.
- **Moderating:** delete a bad entry by hand in the Firestore console.
- **Free tier:** the Spark plan allows 50,000 document reads and 20,000 writes per day, with 1 GiB stored. One HIGH SCORES visit reads 10 documents and each mission won writes 1, so a hobby game stays far inside it. Sources: [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans), [Firestore quotas](https://docs.cloud.google.com/firestore/quotas).
