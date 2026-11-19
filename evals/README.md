# Evals

Does the `lancedb-motion` guide actually teach an agent to make these videos?
Each case gives an agent a job, then scores what it produced. The runner is
Claude Code's built-in `claude plugin eval`; this repo is set up as a plugin
(`.claude-plugin/plugin.json`) so the skill loads as the thing under test.

By default every case runs twice: **with** the skill and **without** it (same
repo, kits and examples, just no guide). The score difference is what the guide
is worth.

## The buckets

**Build a scene** (`scene-scalar-filter`, `scene-compaction`): the agent gets a
voiceover line and writes `src/EvalScene.tsx`, then runs `evals/check-scene.sh`.

| bucket | grader | how it's checked |
|---|---|---|
| it builds | `typecheck` | `tsc` passes |
| house rules | `house-rules` | `evals/lint-scene.mjs` passes: theme colors only, house fonts only, built on `Stage`, no kickers/titles, beats keyed to cues, scene header with VO quote + beats + fact sources |
| it looks right | `looks-right-code` | an AI judge reads the layout: text on faces, sizes ≥ 20, tones not custom colors, objects in frame, one focus per beat |
| it tells the script | `matches-script` | an AI judge reads the scene: one beat per VO idea in order, keyed to cues, objects not text, no invented numbers or API names |
| it used the guide | `skill-fired` | the Skill tool was called (shown, not scored) |

The `RESULT … [run <timestamp>]` lines come from `evals/check-scene.sh`; the
timestamp makes them impossible to match by just reading the script.

**Rendering isn't part of the evals.** Remotion renders with headless Chrome and
a local server, and the eval sandbox blocks both. To look at what an eval run
built, run with `--keep-temp`, copy its `src/EvalScene.tsx` (and `Root.tsx`
entry) into your checkout, and render stills by hand:
`npx remotion still EvalScene out/look.png --frame=<f>`.

**Fix a bad scene** (`fix-off-brand-scene`): starts from a deliberately
off-brand scene (Tailwind blues/greens, Arial, a title banner, a legend, a
floating "10x faster!", no cues, no header). Same buckets, plus: no performance claim is
rendered anymore and the title/legend are gone.

**Knowledge** (`know-*`, cheap, no building):

- `know-slide-overlap`: which transition between two explainers, and where the
  second Sequence starts (22-frame overlap → 1378).
- `know-state-colors`: the exact tokens for untouched / happening now / done,
  and what lavender is for.
- `know-reviewer-pushback`: a reviewer asks for a title, a legend and teal
  highlights. Does the agent hold the house rules politely and offer alternatives?
- `know-vertical-cut`: what changes for a 9:16 version.

**Planning** (`plan-from-script`): plan (not build) a 4-line section. Judged on:
one shared world, one beat per line on its word, real objects, no titles, no
invented numbers.

## Run

Needs the repo's `node_modules` installed (`npm i`); each case gets a copy
(APFS clone, instant on macOS).

```bash
# everything, with vs without the guide, 1 run each (~$15–30, ~20–40 min)
claude plugin eval . --scaffold --allow-tools Bash Write Edit --runs 1 -j 3 --judge-model sonnet --threshold 0

# just the cheap ones while editing the guide (~$1)
claude plugin eval . --scaffold --tag knowledge plan --ablation none --runs 1 --threshold 0

# one case
claude plugin eval . --scaffold --allow-tools Bash Write Edit --case scene-compaction --ablation none --runs 1 --judge-model sonnet
```

- `--scaffold` lets each case copy the repo into its workspace (the scripts are
  in `evals/*/scaffold.sh`; read them, they only copy files).
- `--allow-tools Bash Write Edit` lets the build cases write and run code.
- `--threshold 0` just reports; raise it (e.g. `0.8`) to make CI fail.
- Results land in `evals/results/<timestamp>/` (git-ignored) with an HTML report.
- Use `--judge-model sonnet` for the build cases: the default judge (Haiku)
  wrongly failed a good ~9,000-character scene on all three votes.
- Model-judged graders are noisy with 1 run. Use `--runs 3` before trusting a
  change.

## Adding a case

```
evals/<case>/
  case.yaml        # schema_version "1.1", name, scaffold_script: scaffold.sh
  scaffold.sh      # copy of another case's (copies the repo, then fixtures/)
  fixtures/        # optional files laid over the repo (same paths)
  prompt.md        # frontmatter (tags, runs, max_turns, timeout_seconds, allowed_tools) + the task
  graders/*.md     # one per bucket: type regex | file_exists | tool_used | llm
```

When a real review catches something the evals didn't, add a grader for it.
That's how the rules in the guide got written in the first place.
