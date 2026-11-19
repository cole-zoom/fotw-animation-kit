import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";

/**
 * The gag sticker language from Ep. 03 (HesBack / TailLatencyGag), pulled out
 * so Ep. 04's gags draw with the exact same pieces: offwhite-bordered
 * stickers that slap on with an overshoot and wobble, four-point sparkles,
 * hearts.
 */

export const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const Sparkle: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="-10 -10 20 20" style={{ overflow: "visible" }}>
    <path d="M0 -10 C1 -2 2 -1 10 0 C2 1 1 2 0 10 C-1 2 -2 1 -10 0 C-2 -1 -1 -2 0 -10 Z" fill={color} />
  </svg>
);

export const Heart: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 22" style={{ overflow: "visible" }}>
    <path d="M12 21 C5 15 0 11 0 6 A6 6 0 0 1 12 4 A6 6 0 0 1 24 6 C24 11 19 15 12 21 Z" fill={color} />
  </svg>
);

/** an offwhite-bordered sticker that slaps on (overshoot) and wobbles */
export const Sticker: React.FC<{
  at: number;
  out: number;
  x: number;
  y: number;
  tilt: number;
  w: number;
  h?: number;
  children: React.ReactNode;
}> = ({ at, out, x, y, tilt, w, h, children }) => {
  const frame = useCurrentFrame();
  const slap = interpolate(frame, [at, at + 9], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.6)) });
  const gone = interpolate(frame, [out, out + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.back(2)) });
  const s = slap * (1 - gone);
  if (s <= 0.01) return null;
  const t = Math.max(0, frame - at);
  const wobble = Math.sin(t * 0.5) * 6 * Math.exp(-t / 20);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h ?? w,
        transform: `translate(-50%, -50%) rotate(${tilt + wobble}deg) scale(${s})`,
        border: `9px solid ${LANCE.offwhite}`,
        backgroundColor: LANCE.dark800,
        boxShadow: `0 14px 36px rgba(23,21,19,0.65), 0 0 0 3px ${LANCE.orange400}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
};

/** a sparkle that pops, spins and fades at (x, y) */
export const Pop: React.FC<{ at: number; x: number; y: number; size: number; color: string }> = ({ at, x, y, size, color }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 7, at + 26], [0, 1.1, 0], clamp);
  if (t <= 0.01) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${t}) rotate(${(frame - at) * 6}deg)`,
        filter: `drop-shadow(0 0 8px ${color})`,
      }}
    >
      <Sparkle size={size} color={color} />
    </div>
  );
};
