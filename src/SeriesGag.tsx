import React from "react";
import { useCurrentFrame } from "remotion";
import { LANCE } from "./lanceTheme";
import { poster } from "./retro";
import { Pop, Sticker } from "./stickerKit";
import { Mono } from "./gagKit";
import { CUES } from "./cues";

/**
 * "We're continuing our Lance 13.0 series." — Ep. 05's ReleaseGag, continued.
 * The same LANCE 13.0 sticker slaps on above them on "Lance"; on "series" the
 * three episode tickets fan out under it again — EP. 05 is done (dimmed, a
 * check), EP. 06 lights ("this one"), EP. 07 waits. All off before Sören's
 * ident. LOCAL frames from cues.ts.
 */
const C = CUES.series;

export const SeriesGag: React.FC = () => {
  const frame = useCurrentFrame();
  const out = C.soren - 40;
  const lit = frame >= C.series + 22;
  return (
    <div name="Series Gag" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <Sticker at={C.lance - 6} out={out} x={960} y={190} tilt={-5} w={420} h={170}>
        <div style={{ textAlign: "center" }}>
          <div style={{ ...poster(40), color: LANCE.dark200 }}>Lance</div>
          <div style={{ ...poster(96), color: LANCE.orange300 }}>13.0</div>
        </div>
      </Sticker>
      <Pop at={C.lance} x={760} y={120} size={44} color={LANCE.orange300} />
      <Pop at={C.lance + 4} x={1180} y={250} size={34} color={LANCE.lavender} />
      {[0, 1, 2].map((k) => (
        <Sticker key={k} at={C.series + k * 7} out={out + 2 + k * 2} x={830 + k * 130} y={360 + (k === 1 ? 14 : 0)} tilt={[-8, 3, 9][k]} w={118} h={78}>
          <Mono size={24} color={k === 1 && lit ? LANCE.orange300 : k === 0 ? LANCE.dark400 : LANCE.dark300}>
            {k === 0 ? "✓ " : ""}EP. {String(5 + k).padStart(2, "0")}
          </Mono>
        </Sticker>
      ))}
      <Pop at={C.series + 23} x={960} y={318} size={40} color={LANCE.orange300} />
    </div>
  );
};
export default SeriesGag;
