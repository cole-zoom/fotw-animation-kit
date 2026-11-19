import React from "react";
import { z } from "zod";
import { Img, useCurrentFrame, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { Scanlines } from "./retro";
import type { Rect } from "./cues2";

/**
 * One docs screenshot, full frame, with a camera, a cursor and a ring.
 *
 * The PNGs are captured at the 1920×1080 viewport at 2×, so at zoom 1 the page
 * sits pixel-for-pixel on the frame and zooms stay sharp up to 2×.
 *
 * keys:   [localFrame, { x, y, z }] — page point at frame centre + zoom.
 * cursor: [localFrame, { x, y }] — cursor tip in page coords. Drawn outside
 *         the camera so it stays the same size while the page zooms.
 * clicks: local frames the cursor presses (a dip + a soft ripple).
 * rings:  orange outline that draws on around a measured page rectangle.
 *
 * EASE (Cole: "exaggerate the ease in and out a lot"): expo in-out,
 * a long slow start, a fast middle and a long glide to rest, on camera AND
 * cursor. TILT: the page plate leans in perspective with the camera's
 * velocity (so it only tilts while moving and settles flat when still).
 */
export type CamKey = [number, { x: number; y: number; z: number }];
export type CurKey = [number, { x: number; y: number }];
export type Ring = { r: Rect; at: number; out?: number; pad?: number };

const W = 1920;
const H = 1080;
export const SMOOTH = Easing.bezier(0.87, 0, 0.13, 1);
const clampE = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const, easing: SMOOTH };

const camAt = (f: number, keys: CamKey[]) => {
  if (keys.length === 1) return keys[0][1];
  const fs = keys.map((k) => k[0]);
  return {
    x: interpolate(f, fs, keys.map((k) => k[1].x), clampE),
    y: interpolate(f, fs, keys.map((k) => k[1].y), clampE),
    // zoom eases in log space so a push feels constant
    z: Math.exp(interpolate(f, fs, keys.map((k) => Math.log(k[1].z)), clampE)),
  };
};
const curAt = (f: number, keys: CurKey[]) => {
  if (keys.length === 1) return keys[0][1];
  const fs = keys.map((k) => k[0]);
  return { x: interpolate(f, fs, keys.map((k) => k[1].x), clampE), y: interpolate(f, fs, keys.map((k) => k[1].y), clampE) };
};

/** macOS-style arrow, tip at (0,0) */
const Arrow: React.FC<{ s: number }> = ({ s }) => (
  <svg width={34 * s} height={46 * s} viewBox="0 0 34 46" style={{ position: "absolute", left: -3 * s, top: -2 * s, overflow: "visible", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.55))" }}>
    <path d="M3 2 L3 38 L12 29.5 L18.5 43 L24.5 40.2 L18 27 L30 27 Z" fill="#fff" stroke="#000" strokeWidth={2.2} strokeLinejoin="round" />
  </svg>
);

export const DocsShot: React.FC<{
  src?: string;
  keys?: CamKey[];
  cursor?: CurKey[];
  clicks?: number[];
  rings?: Ring[];
  glitch?: boolean;
  tilt?: number;
}> = ({ src = "", keys = [[0, { x: 960, y: 540, z: 1 }]], cursor, clicks = [], rings = [], glitch = true, tilt = 1 }) => {
  const f = useCurrentFrame();
  const c = camAt(f, keys);
  const p = camAt(f - 1, keys);
  const tx = W / 2 - c.x * c.z;
  const ty = H / 2 - c.y * c.z;
  const g = glitch ? interpolate(f, [0, 7], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  // velocity → lean. Pan right ⇒ page swings away on the right; zoom in ⇒ tips back a touch.
  const vx = (c.x - p.x) * c.z;
  const vy = (c.y - p.y) * c.z;
  const vz = Math.log(c.z / p.z) * 60;
  const ry = Math.max(-9, Math.min(9, -vx * 0.16)) * tilt;
  const rx = Math.max(-7, Math.min(7, vy * 0.16 + vz * 1.6)) * tilt;

  return (
    <div name="Docs page" style={{ position: "absolute", inset: 0, overflow: "hidden", background: `radial-gradient(ellipse 90% 75% at 50% 42%, ${LANCE.dark700} 0%, ${LANCE.dark800} 70%)` }}>
      <div style={{ position: "absolute", inset: 0, transform: `perspective(2200px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${1 + (Math.abs(rx) + Math.abs(ry)) * 0.006})` }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: W,
            height: H,
            transformOrigin: "0 0",
            transform: `translate(${tx}px, ${ty}px) scale(${c.z})`,
            background: "#000",
          }}
        >
          <Img src={src} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }} />
          {g > 0.01 && (
            <>
              <Img src={src} style={{ position: "absolute", left: -10 * g, top: 0, width: W, height: H, opacity: 0.35 * g, mixBlendMode: "screen", filter: "sepia(1) saturate(6) hue-rotate(290deg)" }} />
              <Img src={src} style={{ position: "absolute", left: 10 * g, top: 0, width: W, height: H, opacity: 0.35 * g, mixBlendMode: "screen", filter: "sepia(1) saturate(6) hue-rotate(150deg)" }} />
            </>
          )}
          {rings.map((ring, i) => {
            const pad = ring.pad ?? 8;
            const on = interpolate(f, [ring.at, ring.at + 18], [0, 1], clampE);
            const off = ring.out === undefined ? 1 : interpolate(f, [ring.out, ring.out + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            if (on * off <= 0.001) return null;
            return (
              <div
                key={i}
                name="Highlight ring"
                style={{
                  position: "absolute",
                  left: ring.r.x - pad,
                  top: ring.r.y - pad,
                  width: ring.r.w + pad * 2,
                  height: ring.r.h + pad * 2,
                  borderRadius: 8,
                  border: `${3 / c.z}px solid ${LANCE.orange400}`,
                  boxShadow: `0 0 ${16 / c.z}px rgba(255,115,74,0.7)`,
                  opacity: on * off,
                  transform: `scale(${1.1 - 0.1 * on})`,
                }}
              />
            );
          })}
        </div>

        {cursor && (() => {
          const k = curAt(f, cursor);
          const sx = tx + k.x * c.z;
          const sy = ty + k.y * c.z;
          let press = 0;
          let ripple = -1;
          for (const at of clicks) {
            press = Math.max(press, interpolate(f, [at - 3, at, at + 6], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
            if (f >= at && f < at + 22) ripple = (f - at) / 22;
          }
          return (
            <div name="Cursor" style={{ position: "absolute", left: sx, top: sy, width: 0, height: 0 }}>
              {ripple >= 0 && (
                <div style={{ position: "absolute", left: -40 * ripple - 6, top: -40 * ripple - 6, width: 80 * ripple + 12, height: 80 * ripple + 12, borderRadius: "50%", border: `3px solid ${LANCE.orange300}`, opacity: 0.8 * (1 - ripple) }} />
              )}
              <div style={{ position: "absolute", transform: `scale(${1 - 0.18 * press})`, transformOrigin: "0 0" }}>
                <Arrow s={1.25} />
              </div>
            </div>
          );
        })()}
      </div>
      <Scanlines opacity={0.07} />
    </div>
  );
};

DocsShot.schema = z.object({
  src: z.string(),
  glitch: z.boolean(),
  tilt: z.number(),
});

export default DocsShot;
