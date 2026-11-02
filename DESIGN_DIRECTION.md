# Loktrishal K — The Arrival

**Approved direction. Implementation authorized with the supplied avatar film on 2 November 2026.**

## Project brief

- App: Loktrishal K, personal portfolio.
- Purpose: let visitors meet the person, explore projects and inspect credentials before getting in touch.
- Proposed primary audience: recruiters and technical collaborators on desktop and mobile; public/hackathon visitors are secondary. Please confirm with the direction.
- Domain: a builder's studio and project screening room, with one original game-cinematic avatar entrance.
- Existing stack: static HTML/CSS/JavaScript, GSAP/ScrollTrigger and Three.js loaded from CDNs; JSON certificate renderer; Vercel configuration. Preserve the stack unless a later approved feature needs a change.
- Proposed initial language: English. Keep new copy in a shared `data/copy.en.json` when implementation starts; add languages only when requested.
- Anti-reference: the current black/gold portfolio, Syne/Instrument Serif/DM Mono pairing, particle background and terminal-led hero. Also avoid copying KinSight's teal clinical world or EduNova's dark science-world treatment.
- Proposed timing: an optional 8-second entrance; visitors can skip from the first frame. No required viewing time to access projects.

## 1. Domain metaphor

**The builder arrives; scattered possibilities become work you can inspect.**

The personal avatar enters a bright architectural studio. An orbit of abstract project fragments aligns into an orderly exhibition of actual projects. The entrance provides character; source links, precise descriptions and credentials provide substance.

Free Fire MVP arrivals inform the cadence: anticipation, a spectacular controlled movement, impact, then a confident held pose. The costume, environment, choreography and graphics are original. No Free Fire branding, HUD or copied character asset is required. A specific animation has not been identified from a supplied clip, so this is an original interpretation of that reference.

## 2. Three adjectives

**Assured. Tactile. Cinematic.**

The page stays pleasant and professional after the entrance. No perpetual combat effects or nightclub lighting.

## 3. Palette and contrast

Materials: warm exhibition paper, limestone, graphite and fired clay.

```css
:root {
  --ground: #F4F1E9;
  --surface: #E8E4DA;
  --ink: #26332F;
  --muted: #56615B;
  --accent: #A33E2B;
  --success: #326649;
  --warning: #805316;
  --shadow: 0 16px 48px rgb(38 51 47 / 0.10);
}
```

Computed using WCAG sRGB relative luminance. These are the permitted proposed text/background pairs; normal text must meet 4.5:1. Do not infer permission for untested combinations or text over moving footage.

| Text | Ground | Surface |
| --- | ---: | ---: |
| Ink | 11.65:1 | 10.36:1 |
| Muted | 5.71:1 | 5.08:1 |
| Accent | 5.67:1 | 5.04:1 |
| Success | 5.94:1 | 5.28:1 |
| Warning | 5.88:1 | 5.22:1 |

Ground-coloured button text on the accent: **5.67:1**. Restrict success/warning to semantic information with a label/icon as well as colour. Put text on a solid panel or a tested opaque veil rather than directly on changing video.

## 4. Type pairing

- **Bricolage Grotesque**, display, weights 500/600: distinctive, human and slightly engineered; large left-aligned headings, tight but readable spacing.
- **Source Sans 3**, body/UI, weights 400/600: calm reading for project details and credentials.
- Use tabular numerals for evidence counts. Do not add a third family for code-like decoration.
- Self-host approved WOFF2 subsets at implementation; fallback fonts must keep content visible while fonts load.

## 5. Hero archetype and secondary moments

Primary: **(b) video chapters that crossfade with scroll**, adapted to a portfolio. A separately skippable entry film hands off to three short project-world chapters. The first viewport already exposes the person's name, role and work CTA. The film never acts as a loader or access gate. On mobile the chapters stack and use posters until visitors choose playback.

The short intro and the chapter films serve different purposes. The intro is 8 seconds total, not a mandatory 24-second sequence. Generate only the intro first; the extended chapter assets can follow if approved.

Three secondary moments:

1. A restrained word reveal for the statement about building understandable systems; all words remain readable without JS and under reduced motion.
2. A project exhibition: editorial rows of actual project media, with a 180ms image-to-detail transition and clear source/demo links. No invented dashboards.
3. A provenance line that draws through education, dated credentials and verified awards. Exact dates only where the evidence supplies them.

No sign-in, sign-up, kanban, admin dashboard or assistant is needed for this personal portfolio. The existing contact flow remains relevant. Any chart retained must explain its real snapshot and measurement.

## 6. Motion signature

- Entry film: anticipation → one kinetic burst → landing → quiet held pose.
- Page: `power3.out`, 480ms reveals, 60ms stagger; hover 180ms; press 100ms.
- Intro headline: `expo.out`, 700ms; use a mask/translation rather than a full-screen blur.
- Optional chapter scrub smoothing: 0.6 seconds; no scrubbing when reduced motion is requested.
- Lenis: proposed `lerp: 0.09`, desktop wheel only, one GSAP ticker. Add it only when the approved scroll treatment needs it; native scrolling on touch devices. Static-site teardown uses `pagehide`; a future component implementation must clean up its context and listeners on unmount.
- **Signature:** on the avatar's palm-up gesture, a broken orbit resolves into three precise project planes; the last pose matches the static hero poster. The page title and work CTA arrive as real DOM text.
- No continuous custom cursor, forced horizontal scroll or movement on every surface.

## 7. Reference board

Seven source pages were opened using installed Chrome through Playwright. Six loaded successfully and were reviewed in the screenshot board; Land-book returned a 403 challenge and is excluded as design evidence. These are technique references, not visual templates. Individual captures and their HTTP/title results are in `docs/references/` and `docs/qa/baseline-report.json`.

| Reference | What to study / borrow | Screenshot |
| --- | --- | --- |
| https://www.awwwards.com/websites/ | Editorial hierarchy and how featured work takes priority over navigation chrome | `docs/references/01-awwwards.png` |
| https://godly.website | Strong project cropping and a concise personal identity | `docs/references/02-godly.png` |
| https://land-book.com | Unavailable: security challenge (403); no design conclusions taken | `docs/references/03-land-book.png` |
| https://gsap.com/showcase/ | Anticipation, easing and timing the handoff between scenes | `docs/references/04-gsap.png` |
| https://reactbits.dev | A single contained interaction, with keyboard/static alternatives | `docs/references/05-reactbits.png` |
| https://magicui.design | Restrained transitions and compact proof components, recoloured to this palette | `docs/references/06-magicui.png` |
| https://ui.aceternity.com | Legible product preview alongside a direct, left-aligned headline | `docs/references/07-aceternity.png` |

The existing portfolio is the visual baseline, captured separately under `docs/qa/`; it is not the proposed light direction.

## 8. Media plan

Start with an identity-locked avatar still, then use it as the image-to-video reference for the entrance. Use the portrait supplied by the owner as the likeness source; keep it local rather than copying it into this public repository. Generation prompts live in `docs/GENERATION_PROMPTS.md`.

Required first: one full-body avatar reference, one hero-pose still, one 8-second entrance, a static poster. Optional after approval: three 8-second project-world chapters and a small mark/full-logo pair. Native SVG icons are sufficient initially; no generated icon family is required.

Delivery: 1920×1080 landscape master, 24fps, silent, plus a separately reframed mobile version if needed. Keep the subject on the right of the desktop composition and the left 40% clear. Do not rely on a crop that cuts off the move or face on mobile.

The generic master template's **no-faces rule has one explicit exception**: the owner's avatar in personal entry/hero footage. Abstract project-world footage remains free of faces and readable text. Do not bake the name, role, scores, logos or CTA into any video.

Target website delivery budgets, to measure after actual generation: intro MP4 + WebM alternatives, serve one codec rather than downloading both; selected intro asset ideally ≤4MB, poster ≤180KB, all optional clips lazy-loaded. At 10fps, three 8-second films would yield 240 frames if a later approved direction chooses a canvas sequence; this proposal does not need frame extraction or a frame loader.

## Approval record

The owner supplied the generated assets and explicitly instructed implementation in a new repository with a new Vercel deployment. The warm ivory/clay palette, Bricolage/Source Sans typography and project-first structure carry forward. Only one film was supplied: the optional three-chapter media sequence is replaced by the actual edited entrance and real project visuals, with native scrolling and no unnecessary WebGL or scroll library.
