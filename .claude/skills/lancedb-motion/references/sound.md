# Sound

Full recipe: `docs/SFX-GUIDE.md`. The rules:

1. **No synthesized tones, ever.** No beeps, blips, pings, rising glides,
   "pew" drops, xylophone. They read as cheap ("talking microwave").
2. **Quiet and sparse.** SFX sit ~10 dB+ under the voice. Many things landing at
   once = one soft texture, not a hit each. When unsure, leave it silent.
3. **Stock foley and whooshes**, slowed and darkened (e.g. a cotton-shirt tap at
   70% speed, low-passed ~2.2 kHz; "drop on floor" at 75–85%, low-passed).

## Where sounds go

| moment | sound |
|---|---|
| whoosh from faces to a graphic | "Wind, Cool, Short" whoosh, peak at the push's top speed (`WHOOSH_FRAMES * 0.4`) |
| whoosh back to faces | "Airy, Light" whoosh |
| into a big scene | "Swish, Classic, Clean" |
| slide between explainers | silent |
| a group splitting | "Whoosh, Short, Dry", rotating variants |
| something lands / settles | dark cotton tap, a few, not one per object |
| something heavy finishes | dark "drop on floor" |

## Levels

- VO consistent across every clip (measure integrated loudness per clip and
  match; pickups recorded later often come in hotter).
- Finished shorts around −13 LUFS integrated, −1 dBTP.
- Music beds very low under speech (≈ −43 to −47 LUFS), louder only where nobody
  talks.
- Measure SFX against the voice's speaking level, not its peaks: hits that
  "looked" quiet once sat only ~3 dB under the voice and had to come down 7 dB.
