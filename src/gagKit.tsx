import React from "react";
import { Img, staticFile, useCurrentFrame, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK_FONO } from "./lanceFonts";
import { chroma, poster } from "./retro";
import { clamp } from "./stickerKit";

/**
 * Ep. 05's extra gag pieces, in the Ep. 03/04 sticker language (stickerKit):
 * a rocket (the snail's rival), a rubber stamp that thunks on, Yang's avatar
 * sticker + crown (He's Back), and a mono tag sticker. All DOM, no WebGL.
 */

// Drop a contributor's GitHub avatar in public/ and point this at it.
export const YANG_AVATAR = staticFile("avatar-placeholder.svg");

export const Rocket: React.FC<{ size?: number; flame?: number }> = ({ size = 170, flame = 1 }) => (
  <svg width={size} height={size * 0.56} viewBox="0 0 170 96" style={{ overflow: "visible" }}>
    {/* flame */}
    <path d={`M38 36 L${38 - 34 * flame} 48 L38 60 Z`} fill={LANCE.orange300} opacity={0.9} />
    <path d={`M38 41 L${38 - 18 * flame} 48 L38 55 Z`} fill={LANCE.offwhite} />
    {/* body */}
    <path d="M38 30 L118 30 C142 30 160 40 166 48 C160 56 142 66 118 66 L38 66 Z" fill={LANCE.offwhite} />
    <path d="M38 30 L60 30 L60 66 L38 66 Z" fill={LANCE.orange400} />
    {/* fins */}
    <path d="M44 30 L30 8 L70 30 Z M44 66 L30 88 L70 66 Z" fill={LANCE.orange500} />
    {/* window */}
    <circle cx={118} cy={48} r={10} fill={LANCE.lavender} stroke={LANCE.dark800} strokeWidth={4} />
  </svg>
);

/** a rubber stamp: thunks down from big to size, tilted, with a little dust */
export const Stamp: React.FC<{ at: number; out: number; x: number; y: number; tilt: number; size?: number; color?: string; children: React.ReactNode }> = ({
  at,
  out,
  x,
  y,
  tilt,
  size = 64,
  color = LANCE.orange500,
  children,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 6], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const gone = interpolate(frame, [out, out + 8], [0, 1], { ...clamp, easing: Easing.in(Easing.back(2)) });
  if (t <= 0.01 || gone >= 0.99) return null;
  const s = interpolate(t, [0, 1], [2.4, 1]) * (1 - gone);
  const hit = interpolate(frame, [at + 6, at + 9, at + 20], [0, 1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(${s * (1 + hit * 0.05)})`,
        opacity: t,
        border: `7px solid ${color}`,
        borderRadius: 10,
        padding: "6px 22px",
        color,
        ...poster(size),
        whiteSpace: "nowrap",
        textShadow: chroma(1 + hit * 5),
        backgroundColor: "rgba(23,21,19,0.55)",
      }}
    >
      {children}
    </div>
  );
};

/** Yang's avatar as a sticker; `crown` 0..1 drops the He's Back crown on */
export const AvatarSticker: React.FC<{ x: number; y: number; size: number; up: number; tilt: number; crown?: number; bounce?: number }> = ({
  x,
  y,
  size,
  up,
  tilt,
  crown = 0,
  bounce = 0,
}) => {
  if (up <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `scale(${up}) rotate(${tilt}deg)` }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `10px solid ${LANCE.offwhite}`,
          boxShadow: `0 14px 40px rgba(23,21,19,0.7), 0 0 0 3px ${LANCE.orange400}`,
          overflow: "hidden",
          backgroundColor: LANCE.dark800,
        }}
      >
        <Img src={YANG_AVATAR} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {crown > 0.01 ? (
        <svg
          width={size * 0.72}
          height={size * 0.46}
          viewBox="0 0 150 96"
          style={{
            position: "absolute",
            left: size * 0.14,
            top: -size * 0.4,
            transform: `translateY(${(1 - crown) * -420 - bounce * 18}px) rotate(8deg)`,
            transformOrigin: "bottom center",
            filter: `drop-shadow(0 6px 10px rgba(23,21,19,0.6))`,
          }}
        >
          <path d="M8 92 L0 18 L40 50 L75 4 L110 50 L150 18 L142 92 Z" fill={LANCE.orange400} />
          <rect x="8" y="78" width="134" height="14" fill={LANCE.orange500} />
          <circle cx="75" cy="4" r="7" fill={LANCE.lavender} />
          <circle cx="2" cy="18" r="6" fill={LANCE.offwhite} />
          <circle cx="148" cy="18" r="6" fill={LANCE.offwhite} />
        </svg>
      ) : null}
    </div>
  );
};

export const Mono: React.FC<{ size?: number; color?: string; children: React.ReactNode }> = ({ size = 34, color = LANCE.offwhite, children }) => (
  <div style={{ fontFamily: AEONIK_FONO, fontWeight: 500, fontSize: size, letterSpacing: "0.04em", color, whiteSpace: "nowrap", textAlign: "center", lineHeight: 1.1 }}>{children}</div>
);

/** horizontal speed lines trailing something moving right */
export const Streaks: React.FC<{ x: number; y: number; amount: number; len?: number }> = ({ x, y, amount, len = 260 }) => {
  if (amount <= 0.01) return null;
  return (
    <>
      {[-26, -8, 10, 28].map((dy, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x - len * amount * (0.6 + (i % 2) * 0.4),
            top: y + dy,
            width: len * amount * (0.6 + (i % 2) * 0.4),
            height: 5,
            borderRadius: 3,
            background: `linear-gradient(90deg, transparent, ${i % 2 ? LANCE.offwhite : LANCE.orange300})`,
            opacity: 0.85 * amount,
          }}
        />
      ))}
    </>
  );
};
