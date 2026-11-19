# FOTW Remotion kit

The motion graphics for LanceDB's **Feature of the Week** videos, as plain
[Remotion](https://www.remotion.dev) code: brand colors and fonts, the scene
kits, the intro/outro, and every graphic from Ep. 07 (BM25F) as working
examples.

![Rank machine](docs/stills/rank-machine.png)

## Start

```bash
npm i
npm run dev          # Remotion Studio: scrub every composition
```

Render:

```bash
npx remotion render StarterScene out/starter.mp4
npx remotion still Ep07-RankMachine out/rank.png --frame=700
```

If you use Claude Code, open it in this folder. The skill in
`.claude/skills/fotw-animations/SKILL.md` gives it the show's rules (colors,
type, motion, transitions, fact-checking, sound). It's also the best
human-readable style guide, so read it.

## What's where (`src/`)

| file | what |
|---|---|
| `lanceTheme.ts`, `lanceFonts.ts` | **the** colors and fonts. Nothing else defines a color. |
| `boldKit.tsx` | the current explainer kit: CSS 3D stage, camera paths, slabs with text on their faces, springs |
| `StarterScene.tsx` | template, copy it to start a new scene |
| `RankMachine.tsx` … `Reqs.tsx` | Ep. 07's ten explainers (real, shipped scenes) |
| `cues.ts` | Ep. 07's word cues: the frame each VO word lands on, per scene |
| `ftsData.ts` | the toy table + real BM25 bar lengths those scenes use |
| `Ep07Reel.tsx` | every Ep. 07 graphic at its real frame, how an episode is sequenced |
| `Intro.tsx`, `Outro.tsx` | show open / sign-off. Only change the episode number and text. |
| `sceneTransition.ts`, `WhooshStreaks.tsx`, `retro.tsx` | transitions, motion blur, the scanline/fringe grade |
| `NameCard`, `ContribIdent`, `CaptionLine`, `GlitchGrade` | host name cards, contributor idents, captions, seams |
| `stickerKit`, `gagKit`, `Confetti`, `*Gag.tsx` | the sticker/stamp gags |
| `diagramKit`, `readKit`, `ftsKit`, `PrPage3D` | older three.js kits. Only the PR page still uses one. |
| `kinoCompat.d.ts` | types for two attributes the files carry from the editor they were built in; harmless |

## Other LanceDB videos (`src/examples/`)

Built with the same kits, each in its own self-contained folder (its own copy
of the kit files, so you can see exactly what each video shipped with). They're
in the **Examples** folder in Studio. Graphics and captions only: camera
footage, voiceover, music and SFX are left out.

| composition | what |
|---|---|
| `MemWAL-RealtimeEngine-Launch` | LanceDB Realtime Engine / MemWAL launch video (3:32): real-table explainers, rollout flow, results |
| `Lance-PocketDemo-16x9` / `-9x16` | ~47 s Lance pocket demo on real DROID robot data (MIT), horizontal and vertical |
| `Docs-Tour` | ~48 s versioned docs tour: 3D flight through docs.lancedb.com screenshots, CRT TV open/close |

The vertical one is the reference for 9:16: same kits, 1080×1920.

![MemWAL launch](docs/stills/memwal-launch.png)

`docs/ep07-DECISIONS.md` is the full production log of a real episode (takes,
cuts, fact-check notes, SFX). `docs/SFX-GUIDE.md` is the sound recipe.

## Assets

- `public/lancedb-logo-offwhite.png`: used by the outro.
- `public/avatar-placeholder.svg`: drop a contributor's GitHub avatar in
  `public/` and pass it as `avatar={staticFile("name.png")}` to `ContribIdent`.
- Fonts load at render time from LanceDB's website CDN (needs network).

Pinned to Remotion 4.0.540. Check Remotion's license terms for company use.
