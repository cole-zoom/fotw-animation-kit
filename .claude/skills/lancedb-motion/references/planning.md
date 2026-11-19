# Planning the pictures

Most bad scenes come from skipping this step. The early versions of every video
in this repo were rejected for the same reasons: "scattered", "I keep getting
lost", "can't tell what the purpose is", "too much text". Every one of those was
fixed by planning, not by polishing.

Write the plan as a short markdown file next to the scenes (`ANIMATION_PLAN.md`)
before writing scene code.

## 1. Find the story in the script

Read the VO script and mark:

- **The promise**: the one thing the viewer should remember ("rows you write
  are readable by another client right away").
- **The problem**: why it was hard before (show it, briefly).
- **The mechanism**: how the feature works, in the order the code does it.
- **The proof**: real numbers, real result.

A launch video was restructured into exactly this order (promise → problem →
mechanism → proof) after the first cut confused people. Put the promise first.

## 2. One world for the whole video

Pick ONE layout that every scene shares, and keep objects where they are
between scenes. The viewer learns the map once.

- MemWAL launch: everything on one **left → right line**:
  app → engine node → `frames` table (+ `_mem_wal`) → workers. Each scene is a
  camera move along that line to the part the VO names.
- Pocket demo: one continuous 3D world; the camera travels from the robot →
  silos → one table → query → cluster.
- FOTW Ep. 07: the same rows and the same "BM25 machine" carry through the BM25
  scenes; slides push from one to the next like a filmstrip.

If two scenes need different layouts, make the transition explain it (the
object you were looking at becomes part of the next picture).

## 3. One beat per line

For every VO sentence, write:

| VO line | on screen | motion | lands on |
|---|---|---|---|
| "When you run a full-text query like big elephant," | search bar above the BM25 machine | "big" chip pops, then "elephant" | `big`, `elephant` |
| "BM25 gives every row a score" | rows pass through the machine, exit right with bars | one row every 16 f | `gives` |

Rules for beats:

- One new idea per beat. If a beat needs a label to explain it, the picture is
  wrong.
- The thing the VO names is what moves or lights up at that moment.
- Don't show something before it's said, and don't leave it up long after.
- Re-use the same object for the same thing (the same row, the same laptop).
  Never show the same row twice on screen at once.

## 4. Choose real objects, not symbols

Rejected: "a circle with a symbol is lazy", "a box with a label", "beams/lines
between things", "just a rectangle". Accepted:

| concept | draw it as |
|---|---|
| a client / app / process | a CSS-3D laptop whose screen shows what it's doing (`Laptop`, `ScreenRow`, `ScreenWait`) |
| a worker / service | a server rack with status lights (`Server`) |
| storage | the table itself, or `Drive`s |
| a table | real column heads + real rows with thumbnails (`TitleBar`, `Heads`, `Row`) |
| a query term | a `Chip` in its highlight color |
| a read / a hit | the row itself lights lavender (no beam to it) |
| work done / happening | `orange400` / `orange300` state, a `glow` |
| a score / a size | a `Bar` whose length is the real value |
| a commit / version | `VersionBadge` that pops and rolls |
| a PR | `PrPage3D` with data from the GitHub API |
| code | a code card with the verbatim snippet |

## 5. Pick a recipe per section

See `recipes.md`. Most explainers are one of: machine/process, two cases
side by side, real table on a line, benchmark bars, code card, PR page,
screenshot fly-through, continuous one-world short.

## 6. Get the plan checked

Before building, show the plan table (or rough stills) to whoever owns the
video. Changing a plan costs minutes; rebuilding a scene costs hours.
