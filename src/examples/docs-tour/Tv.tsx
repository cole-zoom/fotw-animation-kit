import React from "react";
import { z } from "zod";
import { Img, useCurrentFrame, interpolate, Easing, random } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK_FONO } from "./lanceFonts";
import { Scanlines, Fuzz, chroma } from "./retro";
import { mix } from "./boldKit";

/**
 * The old CRT that opens (and closes) the video, in LanceDB's palette.
 *
 * DIVE. The screen is 600×338 (16:9) and its centre is at (960, 500) in the
 * TV's own drawing. Diving scales the whole set by 3.2 around that centre and
 * slides it to frame centre, so at dive = 1 the screen is exactly 1920×1080 and
 * the picture on it is the docs page pixel-for-pixel. That is what lets the
 * next clip (a full-frame DocsShot of the same page) take over with a cut
 * nobody sees.
 *
 *   diveIn  [a, b]  local frames: 0 → 1
 *   diveOut [a, b]  local frames: 1 → 0 (pull back out of the screen)
 *   powerOn         local frame the tube lights (a white line opens to a picture)
 *   flipAt          local frame of a channel change to `flipTo` (static between)
 */
const SCREEN = { cx: 960, cy: 500, w: 600, h: 338 };
const K = 1920 / SCREEN.w; // 3.2
const BODY = { x: 610, y: 281, w: 960, h: 438 };
const OFFSET_X = -(BODY.x + BODY.w / 2 - 960); // centre the whole set at dive 0

const ease = Easing.bezier(0.55, 0, 0.2, 1);

export const Tv: React.FC<{
  src?: string;
  flipTo?: string;
  flipAt?: number;
  powerOn?: number;
  diveIn?: number[];
  diveOut?: number[];
}> = ({ src = "", flipTo, flipAt = -1, powerOn = -1, diveIn, diveOut }) => {
  const f = useCurrentFrame();

  let e = 0;
  // Out first, then back in: when both are given, the dive-in takes over once it starts
  // (Nov 13 fix: diveOut used to override diveIn, so the repo shot hard-cut instead of diving in).
  const eIn = diveIn ? interpolate(f, [diveIn[0], diveIn[1]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }) : 0;
  const eOut = diveOut ? interpolate(f, [diveOut[0], diveOut[1]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }) : 0;
  if (diveOut && diveIn) e = f >= diveIn[0] ? eIn : eOut;
  else if (diveIn) e = eIn;
  else if (diveOut) e = eOut;

  // idle drift while the set is on the floor, so the opening is never static
  const drift = 1 + 0.03 * Math.min(1, f / 200);
  const k = Math.exp(mix(Math.log(0.9 * drift), Math.log(K), e));
  const px = mix(SCREEN.cx + OFFSET_X * 0.9 * drift, 960, e);
  const py = mix(SCREEN.cy + 40, 540, e);
  const tilt = mix(-9, 0, e);
  const crt = (1 - e) ** 1.5; // how much "TV" is left on the picture

  // power on: black → a bright line → picture
  const on = powerOn < 0 ? 1 : interpolate(f, [powerOn, powerOn + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const lineFlash = powerOn < 0 ? 0 : interpolate(f, [powerOn - 2, powerOn + 3, powerOn + 16], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // channel flip
  const flipping = flipAt >= 0 && f >= flipAt && f < flipAt + 16;
  const showSrc = flipTo && flipAt >= 0 && f >= flipAt + 8 ? flipTo : src;
  const staticAmt = flipAt < 0 ? 0 : interpolate(f, [flipAt, flipAt + 3, flipAt + 12, flipAt + 16], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const roll = flipping ? ((f - flipAt) * 97) % 1080 : 0;

  return (
    <div name="TV set" style={{ position: "absolute", inset: 0, overflow: "hidden", background: `radial-gradient(ellipse 90% 75% at 50% 42%, ${LANCE.dark700} 0%, ${LANCE.dark800} 70%)` }}>
      {/* floor grid, the same pitch and colour as the show's 3D floor */}
      <div
        name="Floor"
        style={{
          position: "absolute",
          left: -1200,
          right: -1200,
          top: 700,
          height: 1400,
          transformOrigin: "50% 0",
          transform: `perspective(900px) rotateX(72deg) scale(${mix(1, 2.6, e)})`,
          backgroundImage: `linear-gradient(${LANCE.dark600} 2px, transparent 2px), linear-gradient(90deg, ${LANCE.dark600} 2px, transparent 2px)`,
          backgroundSize: "160px 160px",
          WebkitMaskImage: "radial-gradient(ellipse 45% 60% at 50% 0%, black 0%, transparent 100%)",
          opacity: 0.9 * crt,
        }}
      />

      <div
        name="TV · camera"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1920,
          height: 1080,
          transformOrigin: "0 0",
          transform: `translate(960px, 540px) perspective(2600px) rotateY(${tilt}deg) translate(-960px, -540px) translate(${px}px, ${py}px) scale(${k}) translate(${-SCREEN.cx}px, ${-SCREEN.cy}px)`,
        }}
      >
        {/* antenna */}
        <div name="Antenna" style={{ position: "absolute", left: BODY.x + BODY.w * 0.42, top: BODY.y - 4, width: 0, height: 0 }}>
          {[-28, 24].map((a, i) => (
            <div key={i} style={{ position: "absolute", left: 0, bottom: 0, width: 4, height: 210, background: LANCE.dark300, borderRadius: 2, transformOrigin: "50% 100%", transform: `rotate(${a + Math.sin(f / 40 + i) * 1.2}deg)` }}>
              <div style={{ position: "absolute", left: -7, top: -9, width: 18, height: 18, borderRadius: 9, background: i ? LANCE.orange400 : LANCE.lavender, boxShadow: i ? "0 0 14px rgba(255,115,74,0.7)" : "0 0 12px rgba(231,210,246,0.6)" }} />
            </div>
          ))}
          <div style={{ position: "absolute", left: -40, top: -26, width: 80, height: 30, borderRadius: "40px 40px 6px 6px", background: LANCE.dark500 }} />
        </div>

        {/* cabinet, with a thick back edge for depth */}
        <div
          name="Cabinet"
          style={{
            position: "absolute",
            left: BODY.x,
            top: BODY.y,
            width: BODY.w,
            height: BODY.h,
            borderRadius: 44,
            background: `linear-gradient(180deg, ${LANCE.dark500} 0%, ${LANCE.dark600} 55%, #26211d 100%)`,
            border: `2px solid ${LANCE.dark400}`,
            boxShadow: `14px 18px 0 #1b1816, 22px 30px 60px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.12)`,
          }}
        />
        {/* legs */}
        {[BODY.x + 120, BODY.x + BODY.w - 160].map((x, i) => (
          <div key={i} name="Leg" style={{ position: "absolute", left: x, top: BODY.y + BODY.h + 6, width: 40, height: 46, background: LANCE.dark500, clipPath: "polygon(15% 0, 85% 0, 100% 100%, 0 100%)" }} />
        ))}

        {/* bezel */}
        <div
          name="Bezel"
          style={{
            position: "absolute",
            left: SCREEN.cx - SCREEN.w / 2 - 26,
            top: SCREEN.cy - SCREEN.h / 2 - 26,
            width: SCREEN.w + 52,
            height: SCREEN.h + 52,
            borderRadius: 40,
            background: "#120f0e",
            boxShadow: `inset 0 0 0 2px ${LANCE.dark500}, inset 0 8px 24px rgba(0,0,0,0.9)`,
          }}
        />

        {/* control panel */}
        <div name="Controls" style={{ position: "absolute", left: SCREEN.cx + SCREEN.w / 2 + 50, top: BODY.y + 40, width: 230, height: BODY.h - 80 }}>
          <div style={{ fontFamily: AEONIK_FONO, fontSize: 22, letterSpacing: "0.12em", color: LANCE.dark200, textShadow: chroma(0.8), marginBottom: 26, textAlign: "center" }}>LANCEDB</div>
          {[LANCE.orange400, LANCE.dark300].map((col, i) => (
            <div key={i} style={{ width: 92, height: 92, borderRadius: 46, margin: "0 auto 26px", background: `radial-gradient(circle at 40% 35%, ${col}, ${i ? LANCE.dark500 : "#b8441f"})`, boxShadow: "0 6px 0 #1b1816, 0 10px 18px rgba(0,0,0,0.5)", position: "relative" }}>
              <div style={{ position: "absolute", left: 43, top: 8, width: 6, height: 28, borderRadius: 3, background: LANCE.dark800, transformOrigin: "3px 38px", transform: `rotate(${i ? -40 : 30 + (flipAt >= 0 && f >= flipAt ? 60 : 0)}deg)` }} />
            </div>
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: 6, borderRadius: 3, background: "#1b1816", margin: "0 22px 12px" }} />
          ))}
        </div>

        {/* the picture */}
        <div
          name="Screen"
          style={{
            position: "absolute",
            left: SCREEN.cx - SCREEN.w / 2,
            top: SCREEN.cy - SCREEN.h / 2,
            width: SCREEN.w,
            height: SCREEN.h,
            overflow: "hidden",
            borderRadius: 26 * crt,
            background: "#000",
          }}
        >
          <div style={{ position: "absolute", inset: 0, transform: `scaleY(${Math.max(0.006, on)})`, opacity: Math.min(1, on * 3) }}>
            <Img src={showSrc} style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: `scale(${SCREEN.w / 1920})`, filter: crt > 0.02 ? `brightness(${1 + 0.15 * crt}) contrast(${1 + 0.1 * crt})` : undefined }} />
          </div>
          {staticAmt > 0.01 && (
            <svg name="Static" width={SCREEN.w} height={SCREEN.h} style={{ position: "absolute", inset: 0, opacity: staticAmt }}>
              <filter id={`n${f}`}>
                <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(random(`s${f}`) * 1000)} />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <rect width="100%" height="100%" filter={`url(#n${f})`} />
              <rect y={(roll / 1080) * SCREEN.h} width="100%" height={22} fill="rgba(255,255,255,0.35)" />
            </svg>
          )}
          {lineFlash > 0.01 && <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 4, marginTop: -2, background: "#fff", boxShadow: "0 0 24px 6px rgba(255,255,255,0.9)", opacity: lineFlash }} />}
          {/* glass: curvature falloff, scanlines, a glare — all fade as we dive */}
          <div style={{ position: "absolute", inset: 0, opacity: crt, background: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.75) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, opacity: crt * 0.8, backgroundImage: "repeating-linear-gradient(to bottom, rgba(0,0,0,0.45) 0px, rgba(0,0,0,0.45) 1px, transparent 1px, transparent 3px)" }} />
          <div style={{ position: "absolute", inset: 0, opacity: crt * 0.55, background: "linear-gradient(130deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 28%, transparent 40%)" }} />
        </div>
      </div>

      <div style={{ opacity: crt }}>
        <Scanlines opacity={0.12} />
        <Fuzz opacity={0.16} />
      </div>
      <div style={{ opacity: 1 - crt }}>
        <Scanlines opacity={0.07} />
      </div>
    </div>
  );
};

Tv.schema = z.object({
  src: z.string(),
  flipTo: z.string().optional(),
  flipAt: z.number(),
  powerOn: z.number(),
});

export default Tv;
