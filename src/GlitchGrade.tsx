import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { bands, HORIZON } from "./retro";

/**
 * The seam between the poster world and the room.
 *
 * The intro and the outro are drawn art; the body of the video is a camera in a
 * meeting room. Cutting straight between them reads as two different videos, so
 * this sits ON TOP of everything (zIndex 10, above the captions at 9) and drags
 * the footage through the intro's look for a beat either side of the cut.
 *
 *   mode="in"   aberrated -> GLITCH -> normal      (poster hands off to the room)
 *   mode="out"  normal    -> GLITCH -> aberrated   (the room hands back)
 *
 * WHY IT IS AN OVERLAY AND NOT A WRAPPER. "Global over everything" has to
 * include clips Kino owns and rewrites - the footage, the captions, the name
 * cards. Wrapping them would mean restructuring App.tsx's top-level children,
 * which is exactly the shape Kino's timeline parser keys off. So the effect
 * reaches down instead of wrapping around: `backdrop-filter` with an SVG
 * filter re-renders whatever is painted beneath this element, no matter who
 * authored it. One clip, drop it anywhere, nothing below needs to know.
 *
 * THE ABERRATION IS A REAL CHANNEL SPLIT, not two tinted ghosts. retro.tsx's
 * `chroma()` fakes it with a magenta and a cyan shadow, which is right for type
 * on a flat ground and wrong for a photograph - screening two full-frame tinted
 * copies over footage just blows it out. Here R goes one way, B the other, G
 * stays put, and they are added back. The pink/cyan fringing falls out of that
 * on its own, so it matches the intro's look without matching its method.
 */

export type GlitchMode = "in" | "out";

/** Deterministic per-frame noise. Same frame always glitches the same way, so
 *  the render is reproducible and scrubbing does not re-roll the effect. */
const rng = (seed: number) => {
  let s = Math.sin(seed) * 43758.5453;
  return () => {
    s = Math.sin(s * 12.9898 + 78.233) * 43758.5453;
    return s - Math.floor(s);
  };
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Identity -> a warm, crushed, slightly lavender-shadowed grade, mixed by `g`.
 *  This is the color half of "same scheme as the intro": dark800 shadows,
 *  orange midtones. */
const gradeMatrix = (g: number) => {
  const WARM = [
    1.14, 0.06, -0.02, 0, 0.012,
    0.02, 0.95, 0.01, 0, -0.004,
    0.0, 0.03, 0.88, 0, 0.026,
    0, 0, 0, 1, 0,
  ];
  const ID = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
  return ID.map((v, i) => lerp(v, WARM[i], g).toFixed(4)).join(" ");
};

const GlitchGrade: React.FC<{ mode?: GlitchMode }> = ({ mode = "in" }) => {
  const frame = useCurrentFrame();

  const curve = (pts: number[], vals: number[]) =>
    interpolate(frame, pts, vals, {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    });

  // Local frame of the hard cut this straddles: "in" starts 6 frames before it
  // so the poster is already breaking up, "out" ends 56 frames after the glitch
  // so the aberration is at full strength when the outro takes over.
  const IN = mode === "in";

  // aberration strength. 1 = the intro's resting fringe, >1 = the burst.
  // "in":  a few frames of lead on the poster, then the ROOM arrives already
  //        aberrated and holds there - that hold is the thing Cole asked for,
  //        the glitch at 44 is what releases it.
  const a = IN
    ? curve([0, 6, 38, 44, 50, 56, 66, 78], [0.4, 1.05, 0.95, 1.35, 1.0, 1.25, 0.45, 0])
    : curve([0, 14, 20, 26, 32, 54, 60, 88, 112], [0, 0.18, 1.35, 1.0, 1.25, 1.0, 0.95, 0.4, 0]);

  // slice tearing + bars. A short tick ON the cut so the splice reads as part of
  // the effect, then the real burst.
  const g = IN
    ? curve([4, 7, 11, 40, 45, 50, 55, 62], [0, 0.55, 0, 0, 1, 0.65, 0.85, 0])
    : curve([12, 18, 24, 30, 36, 52, 57, 62], [0, 1, 0.6, 0.85, 0.25, 0, 0.5, 0]);

  // the poster world's dressing: warm crush, scanlines, venetian bars
  const dress = IN
    ? curve([0, 6, 44, 62, 78], [0.85, 1, 1, 0.5, 0])
    : curve([0, 16, 30, 56, 74, 100], [0, 0.35, 1, 1, 0.6, 0]);

  if (a <= 0.001 && g <= 0.001 && dress <= 0.001) return null;

  // Lines persist through the burst even when the warm dressing has started to
  // lift - the tearing reads as part of the same broken signal.
  const lines = Math.max(dress, g * 0.8);

  // Two things travel down the frame, at different rates, wrapping off the
  // bottom: a soft wide roll bar (the CRT's vertical hold losing lock) and a
  // thin bright tracking line ahead of it. Both are pure frame arithmetic, so
  // they are identical on every render.
  const ROLL_H = 190;
  const rollY = ((frame * 13) % (1080 + ROLL_H)) - ROLL_H;
  const trackY = ((frame * 31 + 420) % (1080 + 140)) - 140;

  const id = `gg-${mode}`;
  const dx = a * 13; // px of channel separation at full strength
  const rand = rng(frame * 0.618 + (IN ? 0 : 977));

  // Horizontal tears. Each is its own backdrop-filter, so keep the count low -
  // they are only alive for the ~20 frames of the burst.
  const SLICES = 7;
  const slices = Array.from({ length: SLICES }, (_, i) => {
    const on = rand();
    const y = rand() * 1080;
    const h = 14 + rand() * 90;
    const shift = (rand() - 0.5) * 2 * 34 * g;
    return { i, y, h, shift, live: on < 0.55 + g * 0.4 };
  }).filter((s) => s.live && g > 0.02);

  return (
    <div
      name={`Glitch Grade (${mode})`}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}
    >
      {/* filter defs. Zero-sized so the svg itself never paints. */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter
            id={`${id}-rgb`}
            x="-5%"
            y="-5%"
            width="110%"
            height="110%"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="R"
            />
            <feOffset in="R" dx={-dx} dy={0} result="Ro" />
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="G"
            />
            <feOffset in="G" dx={dx * 0.22} dy={0} result="Go" />
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="B"
            />
            <feOffset in="B" dx={dx} dy={0} result="Bo" />
            <feComposite
              in="Ro"
              in2="Go"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="1"
              k4="0"
              result="RG"
            />
            <feComposite
              in="RG"
              in2="Bo"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="1"
              k4="0"
              result="RGB"
            />
            <feColorMatrix in="RGB" type="matrix" values={gradeMatrix(dress)} />
          </filter>

          {slices.map((s) => (
            <filter
              key={s.i}
              id={`${id}-tear-${s.i}`}
              x="-20%"
              y="-50%"
              width="140%"
              height="200%"
              colorInterpolationFilters="sRGB"
            >
              <feOffset in="SourceGraphic" dx={s.shift} dy={0} result="t" />
              <feColorMatrix
                in="t"
                type="matrix"
                values={`1 0 0 0 0  0 ${1 - 0.18 * g} 0 0 0  0 0 ${1 + 0.12 * g} 0 0  0 0 0 1 0`}
              />
            </filter>
          ))}

          {/* the roll bar drags the picture sideways as it passes, the way a
              CRT losing vertical hold skews the lines it is mid-way through */}
          <filter
            id={`${id}-roll`}
            x="-20%"
            y="-50%"
            width="140%"
            height="200%"
            colorInterpolationFilters="sRGB"
          >
            <feOffset in="SourceGraphic" dx={6 * lines} dy={0} result="r" />
            <feColorMatrix
              in="r"
              type="matrix"
              values={`${1 + 0.1 * lines} 0 0 0 0  0 1 0 0 0  0 0 ${1 + 0.06 * lines} 0 0  0 0 0 1 0`}
            />
          </filter>
        </defs>
      </svg>

      {/* the whole frame, channel-split and graded */}
      <div
        name="Aberration"
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: `url(#${id}-rgb)`,
          WebkitBackdropFilter: `url(#${id}-rgb)`,
        }}
      />

      {/* torn bands, displaced sideways out of the frame they belong to */}
      {slices.map((s) => (
        <div
          key={s.i}
          name={`Tear ${s.i}`}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: s.y,
            height: s.h,
            backdropFilter: `url(#${id}-tear-${s.i})`,
            WebkitBackdropFilter: `url(#${id}-tear-${s.i})`,
          }}
        />
      ))}

      {/* the poster world's own furniture, borrowed off retro.tsx so the two
          ends of the video are demonstrably the same treatment */}
      {dress > 0.01 && (
        <>
          <div
            name="Warm Crush"
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to bottom, rgba(23,21,19,0.78) 0%, rgba(48,42,37,0.3) 46%, rgba(245,97,54,0.5) 100%)`,
              mixBlendMode: "multiply",
              opacity: 0.88 * dress,
            }}
          />
          <div
            name="Field Glow"
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to top, rgba(245,97,54,0.42) 0%, rgba(255,137,103,0.12) 34%, transparent 58%)`,
              mixBlendMode: "screen",
              opacity: 0.85 * dress,
            }}
          />
          <div
            name="Scanlines"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(to bottom, rgba(0,0,0,0.62) 0px, rgba(0,0,0,0.62) 1px, transparent 1px, transparent 3px)",
              // the pitch is 3px, so drifting by frame*1.6 crawls rather than strobes
              backgroundPosition: `0px ${(frame * 1.6) % 3}px`,
              opacity: 0.36 * lines,
            }}
          />
          <div
            name="Vignette"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 55%, transparent 42%, rgba(12,10,9,0.62) 100%)",
              opacity: 0.7 * dress,
            }}
          />
          {/* the venetian bars, rolled up from the bottom of frame */}
          <svg
            viewBox="0 0 1920 1080"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          >
            {bands.map((b, i) => {
              const on = Math.max(0, Math.min(1, dress * 9 - i));
              if (on <= 0) return null;
              return (
                <rect
                  key={i}
                  x={960 - 960 * on}
                  y={b.y}
                  width={1920 * on}
                  height={b.h}
                  fill={LANCE.dark800}
                  opacity={0.45 * dress}
                />
              );
            })}
            <rect
              x="0"
              y={HORIZON - 3}
              width="1920"
              height="3"
              fill={LANCE.lavender}
              opacity={0.35 * dress}
            />
          </svg>

          {/* ROLL BAR: a soft lift travelling down the frame, skewing what it
              crosses. This is the thing Cole means by "lines going down". */}
          <div
            name="Roll Bar"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: rollY,
              height: ROLL_H,
              backdropFilter: `url(#${id}-roll)`,
              WebkitBackdropFilter: `url(#${id}-roll)`,
            }}
          />
          <div
            name="Roll Glow"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: rollY,
              height: ROLL_H,
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(244,235,232,0.07) 42%, rgba(244,235,232,0.14) 58%, rgba(231,210,246,0.05) 74%, transparent 100%)",
              mixBlendMode: "screen",
              opacity: 0.72 * lines,
            }}
          />

          {/* TRACKING LINE: thinner, faster, with the dark under-edge a real
              head-switching line leaves behind it */}
          <div
            name="Tracking Line"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: trackY,
              height: 2,
              background: LANCE.offwhite,
              mixBlendMode: "screen",
              opacity: 0.55 * lines,
            }}
          />
          <div
            name="Tracking Shadow"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: trackY + 2,
              height: 11,
              background: "rgba(0,0,0,0.55)",
              opacity: 0.65 * lines,
            }}
          />

          {/* GRAIN: authored at 480x270 and stretched, because a full-res
              feTurbulence costs more than the whole rest of the effect and
              looks no different once it is this fine. */}
          <svg
            viewBox="0 0 480 270"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              mixBlendMode: "overlay",
              opacity: 0.16 * lines,
            }}
          >
            <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.85"
                numOctaves={1}
                seed={frame % 101}
              />
              <feColorMatrix type="saturate" values="0.35" />
            </filter>
            <rect width="480" height="270" filter={`url(#${id}-grain)`} />
          </svg>
        </>
      )}

      {/* burst dressing: a couple of hard bars and a lavender flash */}
      {g > 0.02 &&
        Array.from({ length: 3 }, (_, i) => {
          const y = rand() * 1080;
          const h = 3 + rand() * 9;
          const c = [LANCE.lavender, "rgba(45,226,255,0.85)", "rgba(255,45,149,0.8)"][i];
          return (
            <div
              key={`bar-${i}`}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: y,
                height: h,
                background: c,
                opacity: 0.5 * g,
                mixBlendMode: "screen",
              }}
            />
          );
        })}
      <div
        name="Flash"
        style={{
          position: "absolute",
          inset: 0,
          background: LANCE.offwhite,
          opacity: 0.1 * g * g,
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
};

export default GlitchGrade;
