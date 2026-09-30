# Expert gesture elicitation study — static build

A web study in which experts judge, for 18 hands-busy situations, which micro-gesture an AR command should be
mapped to — and then compare their own choice with a system recommendation that was computed in advance.

This build is **entirely static**. There is no server, no database and no API key: the recommendations were
precomputed offline, and each participant's responses stay in their own browser until they are downloaded as CSV.
That is what makes it deployable to GitHub Pages, and it is also what the experimenter has to plan around
(see [Limitations](#limitations)).

```
participant's browser                                    repository
┌───────────────────────────────┐                        ┌──────────────────────────────┐
│ 9-stage flow (localStorage)   │  ← static HTML/JS ←     │ GitHub Pages (this repo)      │
│ Phase A lock → reveal → C → D │                        │ + data/seed/recommendations   │
│ CSV download at the end       │  ← .mp4 ←              │ video host (NOT this repo)    │
└───────────────────────────────┘                        └──────────────────────────────┘
```

## What a participant does

| # | Stage | |
|---|---|---|
| 1 | Landing | participant ID and the **command block** for the session (NAV or CTRL) |
| 2 | Consent | |
| 3 | Background | role, years of experience, expertise areas |
| 4 | Introduction | what the session asks for |
| 5 | Tutorial | the fixed catalog of 14 gestures (7 on-object thumb, 7 object-motion) |
| 6 | Practice | one full trial on a clip outside the study set |
| 7 | **18 trials** | one per situation, in a per-participant random order |
| 8 | Final questionnaire | |
| 9 | Completion | **download the responses as CSV** and send them to the experimenter |

Each trial runs four phases in a fixed order:

- **A — elicitation.** Watch the clip, pick every gesture that would work, name the best one, give the reason, and
  optionally mark gestures that must be excluded. Submitting **locks** this: it can never be edited afterwards.
- **B — reveal.** Only now does the stored system recommendation appear. The lock before the reveal is the point of
  the design: an expert who has already committed cannot be pulled toward the system's answer.
- **C — evaluation.** Four 7-point ratings (feasibility, task compatibility, safety, semantic compatibility) and a
  verdict (accept as is / usable with modification / reject).
- **D — reflection.** The same four open questions in every trial: why the system might have chosen that gesture,
  what in the scene supports it, how it compares with their own choice, and whether the criterion generalizes.

Both languages (EN / KOR) are available from the toggle in the header. Gesture *names* are deliberately untranslated.

## Command blocks

A participant runs **one** block across all 18 situations:

| Block | Commands |
|---|---|
| NAV | next step · previous step · replay instruction |
| CTRL | confirm done · undo / cancel · pause / resume |

Within each grasp type the block's three commands appear once each, rotated by grasp type, so every command is seen
6 times and every grasp type is seen with all three commands. That assignment is fixed data, identical for all
participants; only the **order** of the 18 situations is randomized, seeded from the participant ID so it is
reproducible.

## Where the recommendations come from

`data/seed/recommendations.json` holds 108 rows (18 scenes × 6 commands). Each is the **modal map of k = 5 repeated
runs** of the adopted v4 contract — one red-boxed target per call, the 5-rung decision ladder, and the code rules
applied afterwards — for the command set of that block. Nothing is computed at run time.

`provenance/recommendations.full.json` keeps the evidence behind every row (survival probabilities, the stable and
contested sets, modal-map frequency, which record it came from). It is committed for the record but deliberately
**not** under `public/`, so it is never served with the site.

Regenerate both from the research repository's records with:

```bash
npm run seed:build          # python scripts/build_seed.py
```

## Videos

The clips come from **Ego4D**, **EPIC-KITCHENS** and **HOT3D**, whose licenses do not allow redistribution, so they
are **not in this repository and never published with the site**. Host them somewhere you control and set:

```
NEXT_PUBLIC_VIDEO_BASE_URL = https://your-host/example/videos
```

Each scene is then loaded from `<base>/<scene id>.mp4` (ids in `data/scenes.ts`, plus `practice_mug.mp4`). The host
must send permissive CORS headers for the study's origin, and should be access-controlled rather than public.

If the variable is unset the app falls back to `/videos/<id>.mp4` from the site itself and shows the experimenter a
warning banner on every trial — useful only for a local run where you have put the files in `public/videos/`.

## Running it locally

```bash
npm install
npm run selftest     # drives a participant through both blocks end to end, no browser needed
npm run dev          # http://localhost:3000
```

To check exactly what will be deployed:

```bash
npm run build && npm run serve      # http://localhost:4321
```

## Deploying

1. Push this folder to a GitHub repository.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. **Settings → Secrets and variables → Actions → Variables**:

   | Variable | |
   |---|---|
   | `NEXT_PUBLIC_VIDEO_BASE_URL` | where the clips are hosted (required for the study to show anything) |
   | `NEXT_PUBLIC_RETURN_ADDRESS` | optional; shown on the completion page as where to send the CSV |
   | `NEXT_PUBLIC_STUDY_SALT` | optional; changes every participant's trial order |

4. Push to `main`. `.github/workflows/deploy.yml` typechecks, runs the self test, builds with the repository name as
   the base path, and publishes `out/`.

The site lands at `https://<user>.github.io/<repo>/`.

## Collecting the data

There is no server to collect anything, so **the export is the collection step**:

- A participant downloads their CSV on the completion page and sends it to the experimenter.
- On a shared lab machine, `/experimenter` lists every participant stored in that browser and can export them
  individually or as one combined CSV. It never displays the recommendations, because it is reachable without a
  password.

The CSV is one row per trial, with the participant's own columns repeated, so files from several participants can
simply be concatenated. It carries the Phase A selection and reason, the revealed gesture and whether it matched,
the four ratings and the verdict, all four Phase D answers, and per-phase durations.

## Limitations

These follow from having no server, and are worth deciding about before running the study:

- **The responses live in one browser.** Clearing site data, a different machine or a different browser profile
  loses them. Nothing is transmitted automatically — if a participant closes the tab at trial 12 and never returns,
  that data is only on their machine. Ask for the CSV at the end, and prefer a supervised session.
- **The recommendations ship in the JavaScript bundle.** The interface still reveals a gesture only after Phase A is
  locked, but a participant who opened the bundle could read the table beforehand. The server build withheld the
  values until the lock; this one enforces the order in the interface. For experts in a supervised session this is
  usually acceptable — decide explicitly whether it is for yours.
- **No live model call.** The admin "Call GPT" path of the server build does not exist here; every recommendation is
  the precomputed one. Regenerate the seed to change them.

## Layout

```
app/                 the 9 stages, pre-rendered; every page reads its state after mount
components/study/    trial runner, phase forms, gesture grid — unchanged from the server build
lib/local/           state.ts (localStorage), engine.ts (the state machine), recommendations.ts (the seed)
lib/client/api.ts    the same call signature the server build's components use, answered locally
lib/export/          CSV and JSON export
data/                scenes, gestures, commands, questionnaires, EN/KOR dictionaries, the seed
provenance/          per-row evidence for the recommendations (committed, never served)
scripts/             build_seed.py (regenerate the seed) · selftest.mts (end-to-end check)
```

`components/study/` and most of `data/` are the files from the server build of this study; keeping them identical is
deliberate, so the two cannot drift apart in what they show or record.
