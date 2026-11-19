# Fact-checking

These videos are made by the company that builds the product, for engineers who
use it. A wrong signature or an invented number on screen is worse than no
graphic. Reviewers do catch them.

## Before you design

1. **Pin a commit.** Clone `lance-format/lance` and/or `lancedb/lancedb` and check
   out a commit that contains the feature (HEAD is fine). Write the hash in the
   scene header.
2. **Read the source.** For a feature: the PR (`gh pr view <n> --repo lance-format/lance`),
   its diff, and its tests (tests are the best source for real usage). For a
   general concept with no single PR: the format docs and the code that
   implements it.
3. **List every claim** you might put on screen: names, signatures, argument
   order, defaults, constants, formulas, limits, numbers. Next to each, the file
   and line it comes from.

## While designing

- **Use the code's words**: if the code says `shard`, don't draw "region"; if it's
  `MemTable`, `WAL`, `SSTable gen N`, use those.
- **Don't simplify labels.** Show the real identifiers.
- **Draw the mechanism in the order the code does it** (e.g. memtable → WAL batch
  lands → visible → ack). If the code batches, don't draw one file per write.
- **Quantities must add up.** If one drawn row stands for 32 real rows, the
  totals on screen must equal drawn × 32. Every drawn cell means one stated thing.
- **Claims that only hold sometimes** (e.g. only for some index types): first make
  the picture specific enough to be true (label the object: `BITMAP` index, not
  just "index"); if that isn't possible, change the VO; only as a last resort add
  one small note on screen (this is the one exception to "no notes").
- **Numbers**: from the source (constants), the PR (stats from the GitHub API),
  or a published benchmark (blog chart), with what they were measured on. A toy
  example's values come from running the real formula (keep the script, e.g.
  `bm25_toy.py`). If a value depends on settings you can't pin down, show bars
  without numbers.
- **Some things are not for screen**: ask the feature owner. (Examples from real
  reviews: an internal index type not named on screen; no read-latency numbers
  framed as benchmarks; no roadmap claims.)
- **Mocked material** (an edited screenshot, an illustrative table) is labelled
  `MOCK` in file and clip names and called out to the reviewer.

## Before render

Grep every scene for on-screen strings and check each one against the source
again: code, identifiers, numbers, names, PR numbers, handles. Scene edits made
after the first check are where errors slip in.

Record what you checked, against which commit, in a `DECISIONS.md` next to the
video (see `docs/ep07-DECISIONS.md` → "Fact check").
