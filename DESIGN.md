---
name: Loktrishal K - The Arrival
description: A light editorial portfolio with an original avatar entrance and evidence-led project exhibition.
colors:
  ground: "#f4f1e9"
  surface: "#e8e4da"
  ink: "#26332f"
  muted: "#56615b"
  accent: "#a33e2b"
  accent-hover: "#823121"
  success: "#326649"
  line: "#c9cec4"
typography:
  display:
    fontFamily: "Bricolage, Arial, sans-serif"
    fontSize: "clamp(49px, 5.6vw, 86px)"
    fontWeight: 500
    lineHeight: 1.015
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Bricolage, Arial, sans-serif"
    fontSize: "clamp(38px, 4.3vw, 66px)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Bricolage, Arial, sans-serif"
    fontSize: "clamp(32px, 3.5vw, 52px)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Source, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Source, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 600
rounded:
  tag: "3px"
  media: "4px"
  menu: "16px"
  film-control: "40px"
  pill: "50px"
spacing:
  tight: "8px"
  inline: "20px"
  inset: "24px"
  group: "32px"
  section: "clamp(72px, 9vw, 144px)"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ground}"
    rounded: "{rounded.media}"
    padding: "13px 23px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.ground}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.media}"
    padding: "13px 23px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "13px 3px"
  navigation:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "5px 24px"
  filter:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "9px 17px"
  filter-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
  film-control:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.film-control}"
    padding: "9px 13px"
---

# Design System: Loktrishal K - The Arrival

## Overview

**Creative North Star: "The builder arrives; the work stays inspectable."**

Assured, tactile and cinematic. Warm paper and limestone surfaces frame one original avatar film, followed by an editorial exhibition of actual projects and clearly labelled credentials. Large human display type carries the identity; readable descriptions and source links carry the proof.

This document records the implemented site, not every optional effect in the original master brief. The site has a single entrance film and native scrolling. It does not implement video chapters, Lenis, ScrollTrigger, Three.js, a dashboard, authentication or a chatbot.

**Key Characteristics:**

- Warm light surfaces with one fired-clay accent.
- An immediately usable hero with a skippable original avatar film.
- Alternating project/image rows instead of a uniform card grid.
- Visible distinctions between screenshots, concept art, demos and prototypes.

## Colors

The frontmatter values match the implemented CSS. Ground is the warm paper canvas; surface separates the About and Recognition sections. Forest ink supplies primary text, while muted ink supports descriptions. Fired clay marks the second hero line, primary action, focus, links and selected accents. Success is restricted to an availability dot accompanied by text. The line token separates editorial content.

**The One Accent Rule.** Use fired clay for emphasis; project imagery may retain its own original colours, but page chrome does not borrow those colours.

Text on the moving hero is protected by a light directional veil. Contrast measurements for the approved text pairs are in `DESIGN_DIRECTION.md`; moving-image contrast still depends on the protective layout and veil.

## Typography

Bricolage Grotesque is self-hosted under the CSS family alias `Bricolage`; Source Sans 3 is self-hosted as `Source`. Both use font-display swap and Arial/sans-serif fallbacks. No third display or monospace family is introduced.

The frontmatter records the desktop hierarchy. Hero descriptions are responsive (17-20px, line-height 1.6) and constrained to 440px. Project descriptions are 17px/1.6 with a 480px measure; About body copy is 17px/1.65 with a 620px measure. Credential titles intentionally use the body family at 17px/1.4, weight 600. Credential dates use tabular numerals.

Hero type becomes 45-66px below 800px and 40-54px below 520px. Section headings and project titles reduce independently rather than scaling the whole page.

## Layout

The main wrapper is capped at 1360px, with 56px desktop side gutters. The header is 102px tall. At 1150px the gutters become 40px; at 800px they become 24px and the header becomes 84px. A wide-screen adjustment exists at 1600px. Section rhythm uses the responsive spacing token; below 520px it is fixed at 74px.

Desktop project rows alternate a 1.45:1 image/text balance, with 35-80px gaps and 76px separation. Unillustrated additional projects use a compact two-column editorial row. Skills form two columns. Credentials form title/issuer/date columns.

At 800px navigation switches to a mobile menu, the hero becomes text followed by a full 16:9 media region, projects stack, and credentials use two columns. At 520px About, skills and credentials become single-column. Mobile video uses contain-fit, preserving the complete avatar rather than cover-cropping the movement.

## Elevation & Depth

The page is primarily flat, with tonal section changes and thin dividers. Soft forest-ink shadows are reserved for the mobile navigation (`0 18px 50px rgb(38 51 47 / .15)`) and the film controls (`0 5px 24px rgb(38 51 47 / .10)`). Project rows are not elevated cards.

The hero uses a light veil to protect text, not a dark scrim or decorative glass layer. Image hover is a restrained 1.025 scale; it does not move surrounding layout.

## Shapes

Images, the portrait frame and primary buttons use small, nearly square corners. Pills identify compact navigation, filtering and film controls. Status tags are smaller and less rounded. Rows and section dividers keep the work legible without surrounding every item with a box.

Global keyboard focus is a 3px accent outline with a 5px offset. Selection uses accent/ground, and the scrollbar uses muted/ground. Inline SVG icons share a 1.55px round-cap stroke.

## Components

**Actions.** Primary buttons are clay on paper, outlined actions invert to ink on hover, and text actions gain accent colour. Shared actions are at least 52px tall on desktop, 50px at the narrow breakpoint. Press translates by 1px. Disabled controls use reduced opacity and a wait cursor. Links have a deliberate underline offset and visible keyboard focus.

**Navigation.** Desktop links live inside a thin bordered pill, with an accent active location. The mobile menu is a light elevated panel; its toggle exposes expanded state, opening focuses the first link, links close it, and Escape closes it and returns focus. Resizing back to desktop closes the mobile menu.

**Project filters and rows.** Filters use aria-pressed and derive three groups from the copy data. Six featured projects show initially; the additional collection is expandable. A selected filter searches the entire collection. Each project retains status, technologies and source/demo links. Missing images receive an explanatory text fallback. Concept illustrations retain explicit captions.

**Recognition.** Sixteen records use semantic title, issuer, category and optional date. Course completion, participation, awards and appreciation remain distinct. Undated evidence is not assigned a fabricated date.

**Film.** The corrected 7.625-second media uses its exact opening poster and final held frame. States are poster, loading, playing, paused and ended. Controls support pause, resume, skip and replay. Failed playback or a 12-second load timeout returns to a static image with a status message; content remains usable. Autoplay is limited to unseen desktop sessions without reduced motion or Save-Data. Mobile is click-to-play. A hidden document pauses playback.

**Motion and lifecycle.** Local GSAP animates only the hero: display lines use 900ms with a 100ms stagger, supporting content 600ms with an 80ms stagger, eased with power3.out. The film opacity transition is 350ms; standard control transitions are 180ms; project imagery uses a 550ms cubic-bezier transition. Reduced motion disables the authored intro and smooth scrolling and leaves static readable content. The GSAP context reverts on pagehide; the film controller clears its timeout, pauses media and removes its own listeners. Navigation disconnects its observer; page-level reduced-motion and visibility listeners are removed. There is no perpetual scroll ticker.

**Content states.** The JSON request is abortable after 12 seconds. A failed request leaves the static hero and contact route available, shows an error/retry area, and clears the project list's busy state. Dynamic text is inserted with textContent and external links accept HTTPS without embedded credentials. The page includes a skip link, async status messages and a no-JavaScript contact/GitHub fallback.

## Do's and Don'ts

### Do

- Keep name, work and contact available before media playback completes.
- Preserve the supplied artwork and distinguish concept imagery from application screenshots.
- Use original project and credential boundaries instead of invented operational claims.
- Keep touch layouts stacked and the full avatar movement visible.

### Don't

- Turn the entrance into a loading gate or force replay on every visit.
- Add an unneeded scroll engine, WebGL scene or generated video chapter.
- Replace paper surfaces with dark neon, pervasive glass or decorative glowing blobs.
- Hide content when motion, autoplay, storage or media loading is unavailable.
