import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { chroma } from "./retro";
import { Pop, clamp } from "./stickerKit";
import { rand } from "./bucketKit";

/**
 * "Great job, everyone!" — comp 7576–7630. Two confetti poppers fire from the
 * bottom corners on "Great" (local 8; the Sequence starts at comp 7568), the
 * paper arcs up, tumbles and drifts down; "yay!" pops on "everyone" (36).
 * Seeded, so every render is the same confetti.
 */

const N = 84;
const COLORS = [LANCE.orange300, LANCE.orange400, LANCE.lavender, LANCE.offwhite, LANCE.orange500];
const BURST = 8;
const G = 0.55; // px / frame²

const PIECES = Array.from({ length: N }, (_, i) => {
  const left = i % 2 === 0;
  const spread = 0.12 + rand(i * 1.7) * 0.55; // radians off vertical, leaning inward
  const v = 36 + rand(i * 3.3 + 1) * 22;
  return {
    left,
    vx: (left ? 1 : -1) * Math.sin(spread) * v,
    vy: -Math.cos(spread) * v,
    delay: Math.floor(rand(i * 5.1) * 6),
    w: 12 + rand(i * 7.7) * 12,
    h: 7 + rand(i * 2.9) * 7,
    spin: (rand(i * 9.1) - 0.5) * 0.5,
    flip: 0.2 + rand(i * 4.4) * 0.3,
    color: COLORS[i % COLORS.length],
    drag: 0.965 + rand(i * 6.6) * 0.02,
  };
});

export const Confetti: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <div name="Confetti" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {PIECES.map((p, i) => {
        const t = frame - BURST - p.delay;
        if (t < 0) return null;
        // integrate a drag-damped throw in closed form-ish: step the few frames
        let x = p.left ? 40 : width - 40;
        let y = height - 30;
        let vx = p.vx;
        let vy = p.vy;
        for (let k = 0; k < t; k++) {
          vx *= p.drag;
          vy = vy * p.drag + G;
          if (vy > 5) vy = 5; // terminal flutter speed
          x += vx + Math.sin((k + i) * 0.15) * 0.8;
          y += vy;
        }
        const fade = interpolate(t, [100, 130], [1, 0], clamp);
        if (y > height + 40 || fade <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.w,
              height: p.h,
              backgroundColor: p.color,
              opacity: fade,
              transform: `translate(-50%, -50%) rotate(${t * p.spin}rad) scaleY(${Math.cos(t * p.flip).toFixed(3)})`,
              borderRadius: 2,
            }}
          />
        );
      })}
      {(() => {
        const t = interpolate(frame, [36, 43, 103, 113], [0, 1, 1, 0], { ...clamp, easing: Easing.out(Easing.back(2.4)) });
        if (t <= 0.01) return null;
        return (
          <div
            style={{
              position: "absolute",
              left: width / 2,
              top: 230,
              transform: `translate(-50%, -50%) rotate(-8deg) scale(${t})`,
              fontFamily: '"Aeonik", sans-serif',
              fontWeight: 500,
              fontSize: 96,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              color: LANCE.orange300,
              textShadow: `${chroma(3.5)}, 0 10px 30px rgba(23,21,19,0.7)`,
            }}
          >
            yay!
          </div>
        );
      })()}
      <Pop at={38} x={800} y={160} size={50} color={LANCE.offwhite} />
      <Pop at={41} x={1130} y={190} size={42} color={LANCE.lavender} />
      <Pop at={45} x={1060} y={320} size={34} color={LANCE.orange300} />
    </div>
  );
};

export default Confetti;
