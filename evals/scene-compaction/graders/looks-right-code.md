---
type: llm
focus: {source: file, path: src/EvalScene.tsx}
weight: 2
---
This Remotion scene uses a CSS-3D kit: `<Stage>` is the world, `<At p={[x, y, z]}>` places an object (x right, y DOWN, origin at frame centre, 1 unit = 1 px of a 1920×1080 frame at z = 0), and `<Slab>`, `<Chip>`, `<RowCard>`, `<Bar>` are objects whose `tone` prop picks a house color (idle, card, dim, hit, live, big, paper).

PASS only if ALL hold:
1. Text is drawn through `<Chip text=…>`, `<RowCard text=…>`, or a `<Label>` inside a `<Slab>`; no text element is placed in the world on its own.
2. Font sizes for on-screen text are at least 20.
3. Object colors come from `tone` props (or LANCE tokens); no `style={{ background: … }}` overrides with other colors.
4. Placements look like they stay in frame: x within about ±900 and y within about ±480 at z near 0 (a camera move may justify more; judge reasonably), and objects meant to be side by side aren't placed at the same position.
5. It's a small number of objects with one clear focus per beat (not dozens of labelled things at once).

Answer PASS or FAIL and name the rule(s) that fail.
