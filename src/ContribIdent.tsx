import React from "react";
import { z } from "zod";
import { Img, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK, AEONIK_FONO } from "./lanceFonts";
import { Fuzz, chroma } from "./retro";

/**
 * Who someone is, the first time they are named: "We have EJ Song, aka
 * sezruby, and LeoReeYang, working on batch vector search for Lance."
 *
 * Carried over from Ep. 01, minus the stats card that used to follow it —
 * Cole asked for the ident without the "top contributor" half.
 *
 * Pop in and pop out are deliberately NOT mirrored: it arrives on an overshoot
 * over 18 frames and leaves in 11 without one. Things that leave the way they
 * came in feel like a loop rather than a beat.
 *
 * ─── Two changes from Ep. 01 ─────────────────────────────────────────────
 * 1. The pop-out is keyed to `durationInFrames`, not a hardcoded frame 176.
 *    Ep. 01 had exactly one of these and could hardcode it; here they run
 *    back to back at different lengths, and a fixed 176 means a card shorter
 *    than that just vanishes when its Sequence ends.
 * 2. `avatar` is optional and falls back to a monogram tile. Kino's media
 *    importer is refusing image uploads at the moment (server error digest
 *    2466309085 on every attempt, URL and local file alike). A monogram is a
 *    deliberate-looking placeholder rather than a broken one, and dropping the
 *    real photo in later is a one-prop change. `name` is optional too —
 *    LeoReeYang has no display name on GitHub and inventing one for a real
 *    person is not mine to do.
 */

const CUE_IN = 5;
const OUT_FRAMES = 11;

export const ContribIdent: React.FC<{
  handle?: string;
  name?: string;
  role?: string;
  avatar?: string;
  monogram?: string;
  x?: number;
  y?: number;
}> = ({ handle = "", name = "", role = "", avatar = "", monogram = "", x = 0.2, y = 0.2 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const outAt = Math.max(CUE_IN + 20, durationInFrames - OUT_FRAMES - 5);

  const inS = interpolate(frame, [CUE_IN, CUE_IN + 18], [0.46, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(3.1)),
  });
  const inO = interpolate(frame, [CUE_IN, CUE_IN + 7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outS = interpolate(frame, [outAt, outAt + OUT_FRAMES], [1, 0.72], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const outO = interpolate(frame, [outAt, outAt + OUT_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const tilt = interpolate(frame, [CUE_IN, CUE_IN + 22], [-5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(2.2)),
  });

  const TILE = 92;

  return (
    <div
      name={`Contributor Ident ${handle}`}
      style={{
        textShadow: chroma(1.4),
        position: "absolute",
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: `translate(-50%, -50%) scale(${inS * outS}) rotate(${tilt}deg)`,
        opacity: inO * outO,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "18px 26px 18px 18px",
        backgroundColor: "rgba(23,21,19,0.9)",
        border: `2px solid ${LANCE.orange500}`,
        filter: "drop-shadow(0 10px 30px rgba(23,21,19,0.8))",
      }}
    >
      {avatar ? (
        <Img
          src={avatar}
          style={{
            width: TILE,
            height: TILE,
            objectFit: "cover",
            border: `2px solid ${LANCE.dark500}`,
          }}
        />
      ) : (
        <div
          name="Monogram"
          style={{
            width: TILE,
            height: TILE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: LANCE.dark600,
            border: `2px solid ${LANCE.dark500}`,
            fontFamily: AEONIK,
            fontWeight: 500,
            fontSize: 38,
            letterSpacing: "0.02em",
            color: LANCE.orange300,
          }}
        >
          {monogram}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            fontFamily: AEONIK_FONO,
            fontWeight: 500,
            fontSize: 34,
            lineHeight: 1,
            color: LANCE.offwhite,
          }}
        >
          @{handle}
        </div>
        {name ? (
          <div style={{ fontFamily: AEONIK, fontSize: 26, color: LANCE.orange300, lineHeight: 1 }}>
            {name}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: AEONIK_FONO,
            fontSize: 16,
            letterSpacing: "0.1em",
            color: LANCE.dark300,
            whiteSpace: "nowrap",
            marginTop: 2,
          }}
        >
          {role}
        </div>
      </div>
      <Fuzz opacity={0.26} />
    </div>
  );
};

ContribIdent.schema = z.object({
  handle: z.string(),
  name: z.string(),
  role: z.string(),
  avatar: z.string().describe("image URL or staticFile() path"),
  monogram: z.string(),
  x: z.number(),
  y: z.number(),
});

export default ContribIdent;
