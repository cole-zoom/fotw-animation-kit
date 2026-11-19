import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { LANCE } from "./lanceTheme";
import { AEONIK_FONO } from "./lanceFonts";
import { Glyph, ALL } from "./modality";
import { Sunset, Scanlines, useBeat, chroma, poster, HORIZON } from "./retro";

/**
 * Cold open — Ep. 04 (Ep. 03 copy, new number + credits). Copied from Ep. 02 unchanged except the episode number
 * and the credits: same 210 frames, same bed trim, same cues.
 *
 * Ep. 01's intro ran 379 frames (6.3s). The retention note on that episode was
 * blunt: people leave before the show starts. So this is 150 frames — 2.5
 * seconds — and it is NOT a rescale of Ep. 01's cue sheet. It opens on a held
 * breath and then hits, instead of on someone else's build-up. That shape is
 * the design, and it survived a change of track.
 *
 * ─── The bed ─────────────────────────────────────────────────────────────
 * Cole replaced `inroshorter.mov` with **`Audio/intro.mov`** (6.45s). Onset
 * analysis at ONE-FRAME resolution found the same structure, so the cue sheet
 * below did not need re-cutting — only re-pointing:
 *
 *     bed 140-149  THE BREAK — drops to -29 dB for ten frames
 *     bed 150      THE HIT   — +15.2 dB in a single frame, hardest in the file
 *     bed 178      the peak  — -7.3 dB
 *
 * So App.tsx plays it from frame 130, not from 0. That puts
 *
 *     local 0-9    130-139  the last of the build
 *     local 10-19  140-149  THE BREAK — near silence
 *     local 20     150      THE HIT, which is where the title slams
 *     local 50     180      CUE.peak, 2 frames off the track's own peak
 *
 * The old bed sat at 124 for exactly the same reasons (break 134-143, hit
 * 144). **If the bed is swapped again:** find the hardest one-frame attack
 * after the quietest ten-frame stretch, and set BED_TRIM to `thatFrame - 20`.
 * A coarse onset scan is not enough — it reported this track's entry at 93,
 * which is 57 frames early and would have put the title slam on a quiet build.
 *
 * Nothing is cross-faded in; the bed holds full through its own peak and
 * across the cut, then fades out under the first line (App.tsx).
 *
 * The beat grid is re-anchored to match: the hit is the downbeat, so
 * `useBeat(9, 30, 20)` pulses at local 20, 50, 80 and 110 rather than on
 * Ep. 01's ANCHOR of 17.
 */

export const INTRO_FRAMES = 210;
/** Frame of `Audio/intro.mov` that local 0 corresponds to. App.tsx carries it
 *  as a literal `trimBefore={130}` so the clip stays draggable in the Kino
 *  GUI — keep the two in step. */
export const BED_TRIM = 130;

const CUE = {
  first: 0, // sun already climbing as we join
  dip: 8, // the break: the frame sits down
  hit: 20, // THE HIT
  glyphs: 30,
  credits: 34,
  peak: 50, // the bed's own peak, one bar after the hit
};

// never a perfectly even count — an even stagger is the loudest "for loop" tell
const GLYPH_IN = [0, 5, 11, 18];

const CREDITS: [string, string][] = [
  ["", "A LANCEDB PRODUCTION"],
  ["YOUR HOSTS", "COLE DUMANSKI  ·  CHANCHAN MAO"],
  ["FEATURING", "SÖREN BRUNK"],
];

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const beat = useBeat(9, 30, CUE.hit);

  const ease = (
    a: number,
    b: number,
    from: number,
    to: number,
    e = Easing.out(Easing.poly(4)),
  ) =>
    interpolate(frame, [a, b], [from, to], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: e,
    });

  // The sun has to get up in a third of the time it had in Ep. 01, so it joins
  // already part-way there (0.34, not 0) and tops out just after the hit. It
  // still climbs through the hit rather than arriving before it — the move is
  // what makes two seconds feel like an opening rather than a still.
  const rise = ease(CUE.first, CUE.hit + 34, 0.34, 1, Easing.out(Easing.poly(2.4)));
  const bandsIn = ease(CUE.first, CUE.hit + 48, 2, 9, Easing.out(Easing.poly(2)));

  // the break: everything sits down for ten frames, then comes back bigger
  const dip = interpolate(frame, [CUE.dip, CUE.dip + 7, CUE.hit], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const hit = interpolate(frame, [CUE.hit, CUE.hit + 5, CUE.hit + 30], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const peak = interpolate(frame, [CUE.peak, CUE.peak + 4, CUE.peak + 26], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // fringing rides the beat and blows out on the hit. Capped at 11 — uncapped,
  // the small type stops being words at the peaks.
  const fringe = Math.min(11, 1.6 + beat * 2.4 + hit * 13 + peak * 7);

  const titleIn = ease(CUE.hit, CUE.hit + 18, 0, 1, Easing.out(Easing.back(2.4)));
  const glow = beat * 0.7 + hit + peak;
  const shake = (hit + peak) * 5;

  return (
    <div
      name="Intro Ground"
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: LANCE.dark800,
        overflow: "hidden",
        transform: `scale(${1 + hit * 0.014 + peak * 0.01 - dip * 0.012}) translateX(${
          Math.sin(frame * 2.7) * shake
        }px)`,
      }}
    >
      <Sunset rise={rise} bandsIn={bandsIn} glow={glow}>
        {/* the skyline is the four modalities, silhouetted on the sun */}
        {ALL.map((kind, i) => {
          const cue = CUE.glyphs + GLYPH_IN[i];
          const g = interpolate(frame, [cue, cue + 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.back(2.6)),
          });
          if (g <= 0.02) return null;
          const x = 470 + i * 340;
          const s = 84 * g;
          return (
            <g key={kind} transform={`translate(${x - s / 2} ${HORIZON - s - 6})`} opacity={g}>
              <g transform={`scale(${s / 100})`}>
                <Glyph kind={kind} size={100} color={LANCE.offwhite} phase={frame + i * 13} />
              </g>
            </g>
          );
        })}
      </Sunset>

      {/* title, top left, the way the sleeve does it */}
      <div
        name="Show Title"
        style={{
          position: "absolute",
          left: 104,
          top: 84,
          color: LANCE.offwhite,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * -26}px)`,
          textShadow: chroma(fringe),
        }}
      >
        <div style={poster(132)}>Feature</div>
        <div style={poster(132)}>of the</div>
        <div style={poster(132)}>Week</div>
        <div
          style={{
            fontFamily: AEONIK_FONO,
            fontSize: 26,
            letterSpacing: "0.3em",
            marginTop: 26,
            color: LANCE.lavender,
            WebkitTextStroke: "0px",
            transform: "none",
            textShadow: chroma(1.6),
          }}
        >
          EP. 07
        </div>
      </div>

      {/* Credits, top right in the clear sky. Ep. 01 staggered these a bar
          apart; at 120 frames that would run past the cut, so they land as one
          block five frames apart and hold for the rest of the piece. */}
      <div
        name="Credits"
        style={{
          position: "absolute",
          right: 104,
          top: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 24,
          textAlign: "right",
        }}
      >
        {CREDITS.map(([kicker, line], i) => {
          const cue = CUE.credits + i * 5;
          const o = interpolate(frame, [cue, cue + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const x = interpolate(frame, [cue, cue + 18], [26, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.poly(4)),
          });
          if (o <= 0.01) return null;
          return (
            <div key={line} style={{ opacity: o, transform: `translateX(${x}px)` }}>
              {kicker ? (
                <div
                  style={{
                    fontFamily: AEONIK_FONO,
                    fontSize: 19,
                    letterSpacing: "0.34em",
                    color: LANCE.lavender,
                    opacity: 0.8,
                    marginBottom: 7,
                  }}
                >
                  {kicker}
                </div>
              ) : null}
              <div
                style={{
                  fontFamily: AEONIK_FONO,
                  fontWeight: 500,
                  fontSize: i === 0 ? 36 : 27,
                  letterSpacing: "0.1em",
                  color: LANCE.offwhite,
                  textShadow: chroma(1.4 + beat * 1.2),
                }}
              >
                {line}
              </div>
            </div>
          );
        })}
      </div>

      <Scanlines opacity={0.15 + beat * 0.05} />
    </div>
  );
};

export default Intro;
