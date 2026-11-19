import React from "react";
import { useCurrentFrame } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK_FONO } from "./lanceFonts";
import { Pop, Sticker } from "./stickerKit";
import { Stamp } from "./gagKit";
import { CUES } from "./cues";

/**
 * "Sören's feature adds a new query type called Combined Fields Query."
 * LOCAL frames from cues.ts:
 *
 *   adds      a NEW! stamp thunks onto the wall between their heads
 *   Combined  the `CombinedFieldsQuery` sticker slaps on under it, sparkles
 *   all off as Combined Fields whooshes in on "It scores the columns…"
 */
const C = CUES.combGag;

export const CombinedGag: React.FC = () => {
  useCurrentFrame();
  const out = C.combined + 66;
  return (
    <div name="CombinedFieldsQuery Gag" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <Stamp at={C.adds + 4} out={out + 2} x={1300} y={100} tilt={10} size={40}>
        New!
      </Stamp>
      <Sticker at={C.combined - 2} out={out} x={960} y={220} tilt={-5} w={560} h={120}>
        <span style={{ fontFamily: AEONIK_FONO, fontWeight: 500, fontSize: 40, color: LANCE.orange300 }}>CombinedFieldsQuery</span>
      </Sticker>
      <Pop at={C.combined} x={680} y={170} size={46} color={LANCE.orange300} />
      <Pop at={C.combined + 4} x={1250} y={300} size={36} color={LANCE.lavender} />
      <Pop at={C.combined + 9} x={720} y={320} size={28} color={LANCE.offwhite} />
    </div>
  );
};
export default CombinedGag;
