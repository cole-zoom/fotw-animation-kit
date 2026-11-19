import React from "react";
import { useCurrentFrame } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK_FONO } from "./lanceFonts";
import { Pop, Sticker } from "./stickerKit";
import { Mono, Stamp } from "./gagKit";
import { CUES } from "./cues";

/**
 * "This works well in most cases, however there are two cases where it doesn't."
 * LOCAL frames from cues.ts:
 *
 *   works    a `MultiMatchQuery ✓` sticker slaps on between their heads
 *   two      two little case tickets drop under it, 1 and 2
 *   doesn't  a "BUT…" stamp thunks onto the sticker's corner
 *   all off as Where MultiMatch Falls Short whooshes in
 */
const C = CUES.twoGag;

export const TwoCasesGag: React.FC = () => {
  const frame = useCurrentFrame();
  const out = C.doesnt + 34;
  const bob = (k: number) => Math.sin((frame + k * 11) * 0.3) * 6;
  return (
    <div name="Two Cases Gag" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <Sticker at={C.works + 4} out={out} x={960} y={180} tilt={-4} w={470} h={110}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ fontFamily: AEONIK_FONO, fontWeight: 500, fontSize: 34, color: LANCE.offwhite }}>MultiMatchQuery</span>
          <span style={{ fontFamily: AEONIK_FONO, fontWeight: 500, fontSize: 44, color: LANCE.orange300 }}>✓</span>
        </div>
      </Sticker>
      <Pop at={C.works + 6} x={720} y={130} size={36} color={LANCE.orange300} />
      {[0, 1].map((k) => (
        <Sticker key={k} at={C.two + k * 8} out={out + 2 + k * 2} x={880 + k * 160} y={330 + bob(k)} tilt={[-9, 8][k]} w={130} h={80}>
          <Mono size={26} color={LANCE.lavender}>CASE {k + 1}</Mono>
        </Sticker>
      ))}
      <Stamp at={C.doesnt} out={out + 3} x={1290} y={100} tilt={12} size={40}>
        But…
      </Stamp>
      <Pop at={C.doesnt + 8} x={1250} y={230} size={32} color={LANCE.lavender} />
    </div>
  );
};
export default TwoCasesGag;
