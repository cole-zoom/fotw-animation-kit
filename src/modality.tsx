import React from "react";
import { LANCE } from "./lanceTheme";
import { AEONIK_FONO } from "./lanceFonts";

/**
 * The four modalities, drawn rather than imported so they stay crisp and cost
 * nothing to load. These are the spine of the new intro and outro: the point
 * of the show's cold open is that one index holds all of them, which is what
 * "a text query box and three text rows" completely failed to say.
 *
 * Shape language follows the brand kit: square corners (lancedb.com sets
 * --radius--large to 0px), 1px strokes, orange accent on warm near-black.
 */

export type Modality = "image" | "video" | "audio" | "text";

export const MODALITY_LABEL: Record<Modality, string> = {
  image: "IMAGE",
  video: "VIDEO",
  audio: "AUDIO",
  text: "TEXT",
};

export const Glyph: React.FC<{ kind: Modality; size?: number; color?: string; phase?: number }> = ({
  kind,
  size = 64,
  color = LANCE.orange400,
  phase = 0,
}) => {
  const common = {
    stroke: color,
    strokeWidth: 5,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      {kind === "image" ? (
        <>
          <rect x="12" y="18" width="76" height="64" {...common} />
          <circle cx="35" cy="39" r="7" {...common} />
          <path d="M16 74 L40 52 L58 66 L70 57 L84 70" {...common} />
        </>
      ) : null}
      {kind === "video" ? (
        <>
          <rect x="10" y="22" width="60" height="56" {...common} />
          <path d="M70 42 L90 30 L90 70 L70 58 Z" {...common} />
        </>
      ) : null}
      {kind === "audio" ? (
        <>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            // A standing wave, sampled per bar - gives the tile a live pulse
            // without any per-frame state.
            const h = 16 + Math.abs(Math.sin(phase * 0.09 + i * 0.9)) * 42;
            return (
              <line
                key={i}
                x1={17 + i * 13}
                y1={50 - h / 2}
                x2={17 + i * 13}
                y2={50 + h / 2}
                {...common}
              />
            );
          })}
        </>
      ) : null}
      {kind === "text" ? (
        <>
          <line x1="14" y1="30" x2="86" y2="30" {...common} />
          <line x1="14" y1="50" x2="86" y2="50" {...common} />
          <line x1="14" y1="70" x2="58" y2="70" {...common} />
        </>
      ) : null}
    </svg>
  );
};

/** A labeled input tile. Square, one step off the ground, orange glyph. */
export const ModalityTile: React.FC<{
  kind: Modality;
  size?: number;
  phase?: number;
  lit?: number;
}> = ({ kind, size = 148, phase = 0, lit = 0 }) => (
  <div
    name={`Modality ${MODALITY_LABEL[kind]}`}
    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}
  >
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: LANCE.dark600,
        border: `1px solid rgba(245,97,54,${0.38 + lit * 0.5})`,
        boxShadow: lit > 0.05 ? `0 0 ${lit * 56}px ${LANCE.orange500}44` : "none",
      }}
    >
      <Glyph kind={kind} size={size * 0.46} phase={phase} />
    </div>
    <div
      style={{
        fontFamily: AEONIK_FONO,
        fontSize: 19,
        letterSpacing: "0.2em",
        color: LANCE.dark300,
      }}
    >
      {MODALITY_LABEL[kind]}
    </div>
  </div>
);

export const ALL: Modality[] = ["image", "video", "audio", "text"];
