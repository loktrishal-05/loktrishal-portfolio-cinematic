# Avatar entrance: inspected and corrected

The supplied Veo clip was inspected as a 4fps contact sheet and at 8fps through the opening. The input image references and output opening/ending frames were also visually reviewed.

## What was wrong

The generated film begins already standing in a presentation pose, then hops into the landing. It does not begin in the supplied airborne first-frame pose. A website that first shows the separate starting PNG and then starts this video would add another visible pose jump.

The generated scene also develops large moving panels in the middle of the film. These are present in the supplied generation; an edit cannot turn them back into the intended thin panels without regeneration.

## Edit performed

- Input: `04-hero-entry.mp4`, H.264 video 1920×1080 at 24fps, 188 video frames (7.833333s), with an AAC audio stream; container duration 7.85s and 4,314,391 bytes.
- Removed source frames 0–8 (0.375s), starting instead at the actual airborne/descent movement in source frame 9.
- Retained source frames 9–179 inclusive; removed the last eight source frames so the film ends on a stable presentation pose.
- Appended a 0.5s hold of the true last retained frame. Output has 183 frames and lasts 7.625s.
- Removed audio for silent inline playback. No new dialogue, music, generated motion, reversed movement, optical-flow interpolation or paid generation was added.
- Preserved the source Veo watermark. Original Downloads files were not modified.

The FFmpeg video filter used for both encodes was:

```text
trim=start_frame=9:end_frame=180,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=0.5
```

H.264 was encoded at CRF 25, preset slow, yuv420p and faststart. VP9 was encoded at CRF 34, zero target bitrate, row multithreading, good deadline and cpu-used 2. Both retain 1920×1080 at 24fps.

## Production assets

| Asset | Purpose | Bytes |
| --- | --- | ---: |
| `public/media/hero-entry.mp4` | H.264, silent, faststart, 7.625s | 1,888,042 |
| `public/media/hero-entry.webm` | VP9, silent, 7.625s | 1,707,311 |
| `public/media/hero-poster.webp` | Corrected video's actual first frame; 1920×1080 | 94,260 |
| `public/media/hero-end.webp` | Corrected video's actual final held frame; 1920×1080 | 90,242 |
| `public/brand/avatar.webp` | Supplied avatar reference converted for the web; 900×900 | 24,256 |

Use `hero-poster.webp` while the film starts, and `hero-end.webp` for the static final/reduced-motion state. This avoids mismatching a separate generated still with the encoded first or last frame. The face and full body occupy the right half of the landscape frame; the left ~40% is quiet. On phones display the whole 16:9 film rather than cover-cropping the actor.

The two diagnostic contact sheets, `docs/media/source-contact-sheet.jpg` and `docs/media/corrected-contact-sheet.jpg`, record source and output progression. They are evidence outside the deployed public assets.

## Verification actually run

- Both video files decoded end-to-end successfully with FFmpeg with no decoder error.
- ffprobe assertions verified one video stream, no audio stream, correct codec, 1920×1080, 24fps, 7.625s and under 4MB per codec.
- Both poster formats and dimensions were checked with Pillow.
- The corrected first frame, final frame and full contact sheet were visually inspected. No black opening or blank ending was introduced.
- Source video SHA-256: `63322d166925e2af236bf2289e79de48a207a21c2159e415e9b1796633502618`.

## Remaining limit

Trimming removes the confusing standing-before-landing lead-in. It cannot reconstruct the missing aerial entrance, guarantee face fidelity through every generated frame, or repair the generation's changing panel geometry. No severe extra-limb defect was apparent in the inspected frames, but these are generated movements rather than a calibrated physical performance. A new Veo generation would be needed for a truly different opening action. Browser autoplay/fallback/reduced-motion behaviour must be verified by the frontend checks.
