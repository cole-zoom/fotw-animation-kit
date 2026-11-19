import React from "react";
import { LANCE } from "./lanceTheme";

/**
 * Speed lines for a "whoosh" scene transition. Drop inside the scene root
 * with the `whoosh` value from useSceneTransition: at 0 nothing renders, at
 * peak speed a dozen long, thin horizontal streaks smear across the panel.
 * Fixed positions (not random per frame) so they read as streaks of the same
 * motion, not noise.
 */
const STREAKS = [
  { y: 0.12, w: 0.55, x: 0.1, h: 2, o: 0.5 },
  { y: 0.2, w: 0.3, x: 0.55, h: 1, o: 0.35 },
  { y: 0.29, w: 0.7, x: 0.2, h: 3, o: 0.45 },
  { y: 0.37, w: 0.4, x: 0.02, h: 1, o: 0.3 },
  { y: 0.44, w: 0.6, x: 0.38, h: 2, o: 0.55 },
  { y: 0.52, w: 0.35, x: 0.12, h: 4, o: 0.35 },
  { y: 0.58, w: 0.5, x: 0.48, h: 1, o: 0.4 },
  { y: 0.66, w: 0.75, x: 0.05, h: 2, o: 0.5 },
  { y: 0.73, w: 0.28, x: 0.64, h: 3, o: 0.3 },
  { y: 0.81, w: 0.45, x: 0.28, h: 1, o: 0.45 },
  { y: 0.88, w: 0.6, x: 0.15, h: 2, o: 0.35 },
];

export const WhooshStreaks: React.FC<{ amount: number }> = ({ amount }) => {
  if (amount <= 0.01) return null;
  return (
    <div name="Whoosh Streaks" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {STREAKS.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${s.y * 100}%`,
            left: `${(s.x - 0.15 * amount) * 100}%`,
            width: `${s.w * (0.4 + amount) * 100}%`,
            height: s.h,
            background: `linear-gradient(90deg, transparent, ${i % 3 === 0 ? LANCE.orange300 : LANCE.offwhite} 45%, transparent)`,
            opacity: s.o * amount,
          }}
        />
      ))}
    </div>
  );
};
