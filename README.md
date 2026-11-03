# Loktrishal K — cinematic portfolio

A separate new portfolio with an original live Three.js kinetic sculpture, scroll-linked hero, wide-screen horizontal project exhibition and accessible responsive content. The rejected avatar video is removed.

- Repository: https://github.com/loktrishal-05/loktrishal-portfolio-cinematic
- Editable Figma hero: https://www.figma.com/design/FhAXVId6QB3g4fFyVFOED8?node-id=2-2
- Research: [docs/RESEARCH-3D.md](docs/RESEARCH-3D.md)
- Design: [DESIGN_DIRECTION.md](DESIGN_DIRECTION.md), [DESIGN.md](DESIGN.md)

## Run
```sh
npm ci
npm test
npm run dev
```
Preview http://127.0.0.1:8770 . In another terminal run `npm run qa`. Browser checks use installed Chrome through Playwright; ignored results/screenshots go to artifacts/v2.

## Content
English UI copy, 13 projects, seven skill groups and 16 recognition records live in data/copy.en.json. See docs/CONTENT.md for provenance. Project imagery retains captions; private photos and certificate originals are not published.

The fallback WebP is rendered from our actual procedural sculpture. Three.js, GSAP and Lenis are bundled locally. Reduced-motion/Save-Data views skip the scene download.

## Deploy
`npm run build` produces dist/. Use only a NEW Vercel project, not the original portfolio's domain/configuration. See docs/DEPLOYMENT.md and docs/QA.md for deployment state and measured checks.
