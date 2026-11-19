import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";

/**
 * The Endless Summer sunset, in LanceDB's palette.
 *
 * Album-cover geometry: one huge disc sitting on a horizon, a glowing field
 * below it striped with dark bars that thicken as they fall away, heavy
 * left-aligned type stacked in the top corner. The reference is red/yellow/
 * blue; this is dark800 sky, an orange300 -> orange500 sun, lavender at the
 * horizon.
 *
 * The 80s comes from three places and none of them is the palette: the venetian
 * banding, the scanlines, and the chromatic fringing. Keeping the actual colors
 * on-brand is what stops it reading as a synthwave preset.
 *
 * MUSIC. The bed is 120 BPM — 30 frames a beat at 60fps, the same grid beat.ts
 * already uses — with its first onset at frame 17. Everything that pulses here
 * runs off `useBeat`, so the fringing, the glow and the scale all breathe on
 * the track rather than on a timer of their own.
 */

export const BEAT = 30;
export const ANCHOR = 17; // first detected onset, frames
export const HORIZON = 760;
export const SUN = { cx: 960, r: 330 };

/** 1 on the beat, decaying to 0 over `decay` frames. */
export const useBeat = (decay = 11, period = BEAT, anchor = ANCHOR) => {
  const frame = useCurrentFrame();
  const since = (((frame - anchor) % period) + period) % period;
  return Math.max(0, 1 - since / decay);
};

/** Classic RGB split. Pink one way, cyan the other. */
export const chroma = (a: number) =>
  `${-a}px 0 rgba(255,45,149,0.92), ${a}px 0 rgba(45,226,255,0.88)`;

/** The same fringing for artwork. drop-shadow follows the alpha silhouette,
 *  so a white logo on transparent gets a magenta ghost one way and a cyan one
 *  the other - the exact analogue of the text-shadow trick above, which is why
 *  the logo and the type end up looking like the same lens. */
export const chromaFilter = (a: number, lift = true) =>
  `drop-shadow(${-a}px 0 rgba(255,45,149,0.92)) drop-shadow(${a}px 0 rgba(45,226,255,0.88))` +
  (lift ? " drop-shadow(0 10px 34px rgba(23,21,19,0.8))" : "");

/**
 * The scanline pass. Drop it as the LAST child of a positioned container and
 * every body graphic starts reading as the same broadcast as the sleeve.
 *
 * 3px pitch, which is the pitch GlitchGrade uses on the seams, so the intro,
 * the transitions and the explainers are all on one grid.
 */
export const Fuzz: React.FC<{ opacity?: number; pitch?: number }> = ({
  opacity = 0.3,
  pitch = 3,
}) => (
  <div
    name="Fuzz"
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      backgroundImage: `repeating-linear-gradient(to bottom, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent ${pitch}px)`,
      opacity,
    }}
  />
);

/**
 * The house ground for an explainer graphic: translucent dark800, a hairline
 * offwhite edge, square corners, and a chromatic fringe that every bit of type
 * inside inherits. `textShadow` cascades, which is the whole trick - one style
 * on the panel puts the intro's fringing on every label in it.
 */
export const retroPlate = (
  pad = "18px 26px 22px",
  fringe = 1.3,
): React.CSSProperties => ({
  // Deliberately NO `position`. This gets spread into roots that are already
  // absolutely positioned, and setting `relative` here silently drops them back
  // into normal flow - the plate then stretches the full width of the frame.
  // Callers that need a containing block set it themselves.
  padding: pad,
  backgroundColor: "rgba(23,21,19,0.74)",
  border: "1px solid rgba(244,235,232,0.18)",
  textShadow: chroma(fringe),
});

/** Venetian bars: thin at the horizon, thickening as they fall away. */
export const bands = (() => {
  const out: { y: number; h: number }[] = [];
  let y = HORIZON + 10;
  let h = 7;
  let gap = 30;
  while (y < 1120 && out.length < 9) {
    out.push({ y, h });
    y += h + gap;
    h *= 1.38;
    gap *= 0.9;
  }
  return out;
})();

export const Sunset: React.FC<{
  /** 0 = fully below the horizon, 1 = up */
  rise: number;
  /** how many bars have arrived */
  bandsIn: number;
  glow?: number;
  children?: React.ReactNode;
}> = ({ rise, bandsIn, glow = 0, children }) => {
  const cy = interpolate(rise, [0, 1], [HORIZON + SUN.r + 60, HORIZON]);
  return (
    <svg
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={LANCE.orange300} />
          <stop offset="55%" stopColor={LANCE.orange400} />
          <stop offset="100%" stopColor={LANCE.orange500} />
        </linearGradient>
        <radialGradient id="glow">
          <stop offset="0%" stopColor={LANCE.orange500} stopOpacity="0.55" />
          <stop offset="55%" stopColor={LANCE.orange500} stopOpacity="0.14" />
          <stop offset="100%" stopColor={LANCE.orange500} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={LANCE.dark800} />
          <stop offset="72%" stopColor={LANCE.dark700} />
          <stop offset="100%" stopColor="#3a2420" />
        </linearGradient>
        <clipPath id="above">
          <rect x="0" y="0" width="1920" height={HORIZON} />
        </clipPath>
      </defs>

      <rect x="0" y="0" width="1920" height="1080" fill="url(#sky)" />

      {/* the glow the sun throws into the sky, breathing on the beat */}
      <ellipse
        cx={SUN.cx}
        cy={cy}
        rx={SUN.r * (2.1 + glow * 0.25)}
        ry={SUN.r * (1.25 + glow * 0.2)}
        fill="url(#glow)"
        opacity={0.72 * rise + glow * 0.22}
      />

      {/* sun, clipped so it only ever sits ON the horizon */}
      <g clipPath="url(#above)">
        <circle cx={SUN.cx} cy={cy} r={SUN.r} fill="url(#sun)" />
      </g>

      {/* the lit field below, striped */}
      <rect x="0" y={HORIZON} width="1920" height={1080 - HORIZON} fill="url(#sun)" opacity={rise} />
      {bands.map((b, i) => {
        const on = Math.max(0, Math.min(1, bandsIn - i));
        if (on <= 0) return null;
        return (
          <rect
            key={i}
            x={960 - 960 * on}
            y={b.y}
            width={1920 * on}
            height={b.h}
            fill={LANCE.dark800}
          />
        );
      })}

      {/* horizon rule */}
      <rect x="0" y={HORIZON - 3} width="1920" height="3" fill={LANCE.lavender} opacity={0.5 * rise} />

      {children}
    </svg>
  );
};

/** CRT lines and a soft corner falloff. Cheap, and it does a lot of the work. */
export const Scanlines: React.FC<{ opacity?: number }> = ({ opacity = 0.16 }) => (
  <>
    <div
      name="Scanlines"
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "repeating-linear-gradient(to bottom, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 4px)",
        opacity,
        pointerEvents: "none",
      }}
    />
    <div
      name="Vignette"
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 50% 55%, transparent 42%, rgba(12,10,9,0.62) 100%)",
        pointerEvents: "none",
      }}
    />
  </>
);

/** Heavy, tight, uppercase. Aeonik is not a condensed face, so it gets a stroke
 *  to put weight on and a slight horizontal squeeze to suggest one. */
export const poster = (size: number): React.CSSProperties => ({
  fontFamily: '"Aeonik", sans-serif',
  fontWeight: 500,
  fontSize: size,
  lineHeight: 0.86,
  letterSpacing: "-0.035em",
  textTransform: "uppercase",
  WebkitTextStroke: `${Math.max(1, size * 0.012)}px currentColor`,
  transform: "scaleX(0.94)",
  transformOrigin: "left center",
});
