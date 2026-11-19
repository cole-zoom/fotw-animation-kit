import React from "react";
import { useCurrentFrame } from "remotion";
import { LANCE } from "./lanceTheme";
import { SceneTransition } from "./sceneTransition";
import { Stage, At, Slab, Chip, Label, Bar, camPath, pop, glide, ramp } from "./boldKit";

/**
 * TEMPLATE: copy this file to start a new explainer. Replace this header with
 * the real one (see the guide: references/recipes.md → "Scene header"):
 *
 * "<the VO lines this scene covers, verbatim>"
 * <enter/exit: slide in from X, whoosh out to the faces>
 *
 *   1  <beat: what's on screen, what moves>   (cue: query)
 *   2  <beat>                                 (cue: rows)
 *   3  <beat>                                 (cue: score)
 *   4  <beat>                                 (cue: winner)
 *
 * Code facts (<repo> @ <commit>): <file> <identifier/constant>, …
 * Numbers: <source of each, or "no numbers on screen">.
 *
 * How it's built (every boldKit scene works this way):
 *   CUES   frame (local, 60 fps) where each key VO word lands. From
 *          tools/vo_cues.py in a real video; placeholders here.
 *   beats  cues → 0..1 values with pop (arrives, overshoots), glide (travels),
 *          ramp (eased progress).
 *   camera one camPath keyed to cues; hold on each beat, one move between.
 *   objects <At p={[x, y, z]}> places things; text goes ON a Slab/Chip face.
 */
const CUES = { query: 30, rows: 90, score: 170, winner: 260 };

const ROWS = ["row one", "row two", "row three"];
const SCORES = [0.45, 1, 0.7]; // real numbers from the real code, or no numbers at all

export const StarterScene: React.FC<{ enter?: SceneTransition; exit?: SceneTransition }> = ({ enter = "slide", exit = "slide" }) => {
  const f = useCurrentFrame();

  const queryIn = pop(f, CUES.query);
  const rowIn = (k: number) => glide(f, CUES.rows + k * 8, 120);
  const bar = (k: number) => ramp(f, CUES.score + k * 6, CUES.score + 36 + k * 6);
  const win = pop(f, CUES.winner, 200, 12);

  const cam = camPath(f, [
    [0, { x: 0, y: 20, z: -300, rx: -6, ry: -12 }],
    [CUES.rows, { x: 0, y: 0, z: 0, rx: -8, ry: -4 }],
    [CUES.winner, { x: 120, y: 0, z: 260, rx: -10, ry: 8 }],
  ]);

  return (
    <Stage name="Starter scene" cam={cam} enter={enter} exit={exit} floorY={320}>
      <At p={[0, -300, 0]} s={0.3 + 0.7 * queryIn} o={Math.min(1, queryIn * 2)} name="Query">
        <Chip text="my query" size={46} tone="hit" glow={0.7} d={24} />
      </At>

      {ROWS.map((text, k) => {
        const t = rowIn(k);
        const isWin = k === 1;
        return (
          <React.Fragment key={text}>
            <At p={[-380, -110 + k * 110, -400 * (1 - t)]} o={t} name={`Row · ${text}`}>
              <Slab w={460} h={80} tone={isWin && win > 0.5 ? "idle" : "card"} glow={isWin ? 0.6 * win : 0}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", paddingLeft: 28 }}>
                  <Label size={32} mono={false}>{text}</Label>
                </div>
              </Slab>
            </At>
            <At p={[-130, -110 + k * 110, 0]} anchor="left" name={`Score · ${text}`}>
              <Bar len={bar(k) * SCORES[k] * 420} glow={isWin ? 0.4 + 0.5 * win : 0.3} />
            </At>
          </React.Fragment>
        );
      })}

      <At p={[440, -110 + 110, 30 + 60 * win]} s={Math.max(0.01, win)} o={Math.min(1, win * 2)} name="Winner badge">
        <Chip text="#1" size={44} tone="big" d={20} />
      </At>
    </Stage>
  );
};

export default StarterScene;
