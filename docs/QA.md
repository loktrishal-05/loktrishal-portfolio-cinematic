# Verification — 2 November 2026

This report covers the separate cinematic portfolio, not the old portfolio. The original GitHub main branch remains at `935af431f705e69b312e631ad6584e2618f15219`; the prior local working copy remains clean at its existing commit. This project has its own fresh Git history and remote.

## Tests actually run

| Check | Result / evidence |
| --- | --- |
| Content and film unit tests | 12 pass via `npm test`; corpus, safe links, asset formats, calendar dates, transcription fidelity, autoplay decisions, pause/resume/skip, rejection, late promises and stalled-load timeout |
| Production static build | `npm run build` passes; only public application files and data are copied into `dist` |
| Desktop/narrow rendering | 360, 768, 1280 and 1920px: zero horizontal overflow |
| Accessibility automation | axe WCAG A/AA/2.1 tags: zero violations at all four widths after identity-label fix |
| Touch targets | Visible links/buttons meet 44px width and height at the tested four widths |
| Project controls | Six initially featured; show all gives 13; category filtering and collapse work |
| Credential rendering | 16 sourced records render at every tested width |
| Mobile navigation | Opens and closes with Escape |
| Keyboard | First Tab exposes visible Skip to content focus; Enter reaches main content |
| Reduced motion | Static poster, video paused, zero video requests |
| Save-Data | Static poster, video paused, zero video requests |
| Missing video | Aborted media request leaves poster and portfolio content available |
| Missing content | Simulated 503 shows retry; retry restores projects after recovery |
| Slow network | CDP 400ms latency / 50KB/s download: content stays usable and film eventually begins; case completes in about 19 seconds |
| Performance sample | Local Chrome LCP observations 208–568ms across the four widths; this is not a public-network or device-lab guarantee |
| Normal console / network | Zero console errors, page exceptions and failed HTTP responses after favicon fix |
| Media | Both codecs decode end-to-end; 1920×1080 / 24fps / 7.625s / silent; MP4 1.89MB, WebM 1.71MB |
| Visual evidence | Desktop/mobile section and full-page captures plus actual hero playback/scroll GIF in local `artifacts/`; shareable hero captures and JSON report in `docs/qa/` |
| Independent review | Ship for local tested build: all material UI findings resolved; one older section screenshot focus artifact was cosmetic |

The Impeccable detector was run once. Cream-palette warning is deliberate and explicitly approved. Section/background-padding warnings are false positives for the actual `section-space` and contained-wrap layout; the screenshot evidence has generous measured insets. No new world or unrelated decorative feature was added to silence the detector.

## Manual or later checks

| Check | Status |
| --- | --- |
| Real iOS Safari / Android hardware | Not run |
| Full screen-reader session | Not run; automated checks do not replace it |
| Every legacy external demo | Not operationally retested; earlier work is labelled |
| Issuer-hosted credential verification | Not independently performed; originals were transcribed in the earlier content phase |
| Generated-motion perfection | Existing film's missing aerial action/panel changes cannot be reconstructed by trimming; see `MEDIA.md` |
| Public deployment | Verify separately after publishing; account linkage requires Vercel sign-in |

No paid media generation or new account registration was performed. The user's original Downloads inputs remain unchanged. No old repository or deployment was modified.
