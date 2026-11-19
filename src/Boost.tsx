import React from "react";
import { useCurrentFrame } from "remotion";
import { LANCE } from "./lanceTheme";
import { SceneTransition } from "./sceneTransition";
import { Stage, At, Slab, Chip, Label, camPath, ramp, pop, glide, mix, chipW } from "./boldKit";
import { CUES } from "./cues";

/**
 * "You can still give a column more weight with a boost. A title boost of 2
 * counts every title word twice."
 * Slide in from CombinedFields, slide out into CodeCards.
 *
 *   1  one row, its title words and body words as chips under their columns
 *   2  a boost dial lands under "title": ×1, then it flips to ×2 on "2"
 *   3  "every title word twice": each title chip clones itself, a second copy
 *      stacked on top — the body chips stay single
 *
 * Code facts (lance 84d1681e0, combined.rs): with boost w, tf' = Σ w·tf and
 * dl' = Σ w·dl, so a title boost of 2 counts each title term twice (and the
 * title's length twice). query.rs MIN_BOOST = 1.0 (the cut line "Boosts have
 * to be 1 or higher" is not shown).
 *
 * CUE frames are LOCAL, from cues.ts.
 */
const C = CUES.boost;
const TITLE = ["Zoo", "update", "elephant"];
const BODY = ["The", "zoo", "opened", "a", "new", "cafe"];
const SZ = 46;
const G = 14;
const groupW = (ws: string[]) => ws.reduce((a, w) => a + chipW(w, SZ), 0) + G * (ws.length - 1);
const TWW = groupW(TITLE);
const BWW = groupW(BODY);
const SPLIT = 130;
const T0 = -(TWW + SPLIT + BWW) / 2; // title group's left edge
const B0 = T0 + TWW + SPLIT;
const ROW_Y = 40;
const xs = (ws: string[], x0: number) => {
  let x = x0;
  return ws.map((w) => {
    const c = x + chipW(w, SZ) / 2;
    x += chipW(w, SZ) + G;
    return c;
  });
};
const TX = xs(TITLE, T0);
const BX = xs(BODY, B0);
const tone = (w: string) => (w === "elephant" ? "hit" : "idle") as "hit" | "idle";

export const Boost: React.FC<{ enter?: SceneTransition; exit?: SceneTransition }> = ({ enter = "slide", exit = "slide" }) => {
  const f = useCurrentFrame();
  const chipIn = (k: number) => pop(f, 6 + k * 4);
  const dial = pop(f, C.boost - 8, 160, 12);
  const flip = glide(f, C.two - 8, 160); // ×1 → ×2
  const clone = (k: number) => pop(f, C.every + 4 + k * 9, 150, 11);
  const shine = ramp(f, C.twice - 6, C.twice + 10);

  const cam = camPath(f, [
    [0, { x: 0, y: -40, z: 260, rx: -14, ry: 10 }],
    [C.boost, { x: -60, y: -70, z: 160, rx: -14, ry: 4 }],
    [C.every, { x: -40, y: -90, z: 200, rx: -16, ry: -6 }],
    [C.twice + 50, { x: -20, y: -100, z: 240, rx: -18, ry: -10 }],
  ]);

  const headY = ROW_Y - 150;
  return (
    <Stage name="Boost" cam={cam} enter={enter} exit={exit} floorY={260}>
      {/* column plates under the chips */}
      <At p={[T0 + TWW / 2, ROW_Y, -40]} o={ramp(f, 0, 14)} name="Title plate">
        <Slab w={TWW + 60} h={240} d={14} tone="dim" radius={20} glow={0.35 * shine} />
      </At>
      <At p={[B0 + BWW / 2, ROW_Y, -40]} o={ramp(f, 0, 14)} name="Body plate">
        <Slab w={BWW + 60} h={140} d={14} tone="dim" radius={20} />
      </At>
      <At p={[T0 + 10, headY, 0]} anchor="left" o={ramp(f, 4, 18)} name="Head · title">
        <Label size={34} color={LANCE.dark200}>title</Label>
      </At>
      <At p={[B0 + 10, headY, 0]} anchor="left" o={ramp(f, 4, 18)} name="Head · body">
        <Label size={34} color={LANCE.dark200}>body</Label>
      </At>

      {/* the boost dial */}
      {dial > 0.01 && (
        <At p={[T0 + TWW - 90, headY, 30]} s={dial} name="Boost dial">
          <div style={{ display: "flex", alignItems: "center", gap: 14, transformStyle: "preserve-3d" }}>
            <Label size={30} color={LANCE.dark200}>boost</Label>
            <div style={{ position: "relative", width: 120, height: 84, transformStyle: "preserve-3d" }}>
              <div style={{ position: "absolute", inset: 0, transform: `rotateX(${flip * 180}deg)`, transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}>
                <Chip text="×1" size={44} tone="idle" w={120} h={84} d={0} />
              </div>
              <div style={{ position: "absolute", inset: 0, transform: `rotateX(${flip * 180 - 180}deg)`, transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}>
                <Chip text="×2" size={44} tone="hit" w={120} h={84} d={0} glow={0.8 * flip} />
              </div>
            </div>
          </div>
        </At>
      )}

      {/* chips */}
      {TITLE.map((w, k) => {
        const c = clone(k);
        return (
          <React.Fragment key={`t${k}`}>
            <At p={[TX[k], ROW_Y, 0]} s={Math.max(0.01, chipIn(k))} name={`Title · ${w}`}>
              <Chip text={w} size={SZ} tone={tone(w)} glow={tone(w) === "hit" ? 0.5 : 0} />
            </At>
            {c > 0.01 && (
              <At p={[TX[k] + 8 * c, ROW_Y - mix(0, 84, c), mix(0, 40, c)]} s={Math.max(0.01, c)} name={`Title · ${w} · counted again`}>
                <Chip text={w} size={SZ} tone={tone(w) === "hit" ? "live" : "paper"} glow={0.4 + 0.5 * shine} />
              </At>
            )}
          </React.Fragment>
        );
      })}
      {BODY.map((w, k) => (
        <At key={`b${k}`} p={[BX[k], ROW_Y, 0]} s={Math.max(0.01, chipIn(k + 3))} name={`Body · ${w}`}>
          <Chip text={w} size={SZ} tone="idle" />
        </At>
      ))}
    </Stage>
  );
};

export default Boost;
