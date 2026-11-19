import React from "react";
import { z } from "zod";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK } from "./lanceFonts";

/**
 * One caption line, one clip.
 *
 * Deliberately NOT a single component that reads the transcript and draws every
 * cue - each line is its own <Sequence> on the timeline so the duration can be
 * dragged and the spelling fixed per line without touching any other.
 *
 * Pops up and pops back down, both smooth: cubic out on the way in, cubic in on
 * the way out, with a little travel and a little scale so it lifts rather than
 * just fading. The out is a touch quicker than the in, which is what stops a
 * caption feeling like it is loitering after the words have gone.
 *
 * Aeonik in offwhite - the brand face. No plate: the shadow does the
 * legibility work, since a slab behind every line would fight the graphics.
 *
 * ─── The shadow is denser than Ep. 01's, and has to be ───────────────────
 * Ep. 01 used one soft drop - `0 4px 18px rgba(23,21,19,0.92)` plus two small
 * ones. On this footage that is invisible: a diffuse glow is black-on-black
 * over their jackets and too weak to separate anything over the orange wall.
 * Cole, on the byte-identical copy: *"Yo i dont see the shadow."* He was
 * right - it renders, it just does nothing.
 *
 * So the stack below is a HALO, not a drop. The three zero-offset shadows are
 * deliberately near-identical: stacking them multiplies opacity, which builds
 * a dense dark edge that hugs the glyph without the hard outline an 8-way
 * offset halo gives. The soft drop underneath is kept for depth.
 *
 * Still no box - this is the same idea Ep. 01 had, tuned for a shot it never
 * had to survive.
 */

const IN = 10;
const OUT = 8;

/**
 * Optional per-word hop. `beats` holds one local frame per space-separated
 * word (read off lookupTimelineText word starts); each word jumps up and
 * lands with a small overshoot as it is said, so the line reads along with
 * the voice. Without `beats` the caption behaves exactly as before.
 */
const HOP = 16; // frames per hop
export const hop = (f: number) => {
  if (f < 0 || f > HOP) return 0;
  const t = f / HOP;
  // up fast, down with a little bounce past rest
  return Math.sin(t * Math.PI) * (1 - t * 0.35) - Math.max(0, Math.sin((t - 0.7) * Math.PI * 3.3)) * 0.12;
};

export const CaptionLine: React.FC<{
  text?: string;
  size?: number;
  bottom?: number;
  beats?: number[];
}> = ({ text = "", size = 46, bottom = 112, beats }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const up = interpolate(frame, [0, IN], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const down = interpolate(frame, [durationInFrames - OUT, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const on = up * down;

  // lift and scale track the same curve, so it arrives as one move
  const y = (1 - up) * 18 + (1 - down) * 10;
  const scale = 0.94 + on * 0.06;

  return (
    <div
      name="Caption"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom,
        display: "flex",
        justifyContent: "center",
        opacity: on,
      }}
    >
      <div
        style={{
          maxWidth: 1480,
          textAlign: "center",
          fontFamily: AEONIK,
          fontWeight: 500,
          fontSize: size,
          lineHeight: 1.24,
          letterSpacing: "-0.015em",
          color: LANCE.offwhite,
          textShadow: [
            // a crisp 1px ring first — this is what actually separates the
            // glyph from a busy background; blur alone never does
            "1px 1px 0 rgba(23,21,19,0.95)",
            "-1px 1px 0 rgba(23,21,19,0.95)",
            "1px -1px 0 rgba(23,21,19,0.95)",
            "-1px -1px 0 rgba(23,21,19,0.95)",
            // then a dense aura: stacked near-identical blurs multiply, so
            // three of them read far darker than one at the same alpha
            "0 0 4px rgba(23,21,19,1)",
            "0 0 4px rgba(23,21,19,1)",
            "0 0 9px rgba(23,21,19,0.95)",
            "0 0 16px rgba(23,21,19,0.8)",
            // and a soft drop for depth
            "0 4px 8px rgba(23,21,19,0.95)",
            "0 10px 30px rgba(23,21,19,0.75)",
          ].join(", "),
          transform: `translateY(${y}px) scale(${scale})`,
        }}
      >
        {beats && beats.length
          ? text.split(" ").map((w, i) => {
              const h = beats[i] === undefined ? 0 : hop(frame - beats[i]);
              return (
                <React.Fragment key={i}>
                  {i > 0 ? " " : null}
                  <span
                    style={{
                      display: "inline-block",
                      transform: `translateY(${(-h * size * 0.32).toFixed(2)}px) scale(${(1 + h * 0.1).toFixed(3)})`,
                      transformOrigin: "50% 100%",
                    }}
                  >
                    {w}
                  </span>
                </React.Fragment>
              );
            })
          : text}
      </div>
    </div>
  );
};

CaptionLine.schema = z.object({
  text: z.string(),
  size: z.number(),
  bottom: z.number(),
  beats: z.array(z.number()).optional(),
});

export default CaptionLine;
