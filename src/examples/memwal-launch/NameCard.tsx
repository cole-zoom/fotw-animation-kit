import React from "react";
import { z } from "zod";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK, AEONIK_FONO } from "./lanceFonts";
import { chroma } from "./retro";

/**
 * Lower-third name card, one per presenter, over the first clip.
 *
 * Same construction as the BubbleCal ident already in the cut - dark slab,
 * orange rule, offwhite name - so the three ident moments in the video match.
 * The retro pass shows up as the uppercase name and the RGB split on it, which
 * ties it to the titles without dragging the whole sunset in.
 *
 * It sits on a slab rather than bare type because this third of the frame is
 * white paper: offwhite would simply vanish there. Both cards share one
 * baseline, lifted to 186px so they clear the caption line entirely -
 * CaptionLine sits at bottom:112 and is ~56px tall, so anything lower than
 * this runs straight through the words.
 *
 * `sub` is deliberately the company and not a job title - putting invented
 * titles on real people's name cards is not mine to do. Fill it in if there is
 * a real one.
 */

export const NameCard: React.FC<{
  name?: string;
  sub?: string;
  x?: number;
  /** px from the bottom of the frame to the bottom of the card */
  bottom?: number;
  cue?: number;
  /** which side it travels in from - the pair enters outward-to-inward */
  from?: "left" | "right";
}> = ({ name = "", sub = "LANCEDB", x = 0.28, bottom = 186, cue = 8, from = "left" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const inO = interpolate(frame, [cue, cue + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Far enough to read as arriving FROM the side rather than nudging into
  // place, and slow enough (28f) that the distance does not turn into a snap.
  const slide = interpolate(frame, [cue, cue + 28], [from === "right" ? 300 : -300, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.poly(4)),
  });
  const punch = interpolate(frame, [cue, cue + 4, cue + 24], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const out = interpolate(frame, [durationInFrames - 16, durationInFrames - 4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });

  return (
    <div
      name={`Name Card ${name}`}
      style={{
        position: "absolute",
        left: `${x * 100}%`,
        bottom,
        transform: `translateX(calc(-50% + ${slide}px))`,
        opacity: inO * out,
        padding: "16px 26px",
        backgroundColor: "rgba(23,21,19,0.93)",
        borderLeft: `5px solid ${LANCE.orange500}`,
        whiteSpace: "nowrap",
        filter: "drop-shadow(0 10px 26px rgba(23,21,19,0.75))",
      }}
    >
      <div
        style={{
          fontFamily: AEONIK,
          fontWeight: 500,
          fontSize: 40,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          color: LANCE.offwhite,
          textShadow: chroma(Math.min(7, 1.2 + punch * 6)),
        }}
      >
        {name}
      </div>
      {sub ? (
        <div
          style={{
            fontFamily: AEONIK_FONO,
            fontSize: 17,
            letterSpacing: "0.26em",
            color: LANCE.lavender,
            marginTop: 8,
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};

NameCard.schema = z.object({
  name: z.string(),
  sub: z.string(),
  x: z.number(),
  bottom: z.number(),
  cue: z.number(),
  from: z.enum(["left", "right"]),
});

export default NameCard;
