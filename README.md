# Loktrishal K — cinematic portfolio

A separate light portfolio featuring an original avatar entrance, project work, skills and sourced credentials. This repository and its Vercel project are independent of the earlier `loktrishal-portfolio` site.

## Run

Requires Node.js 22+ and Python 3 for the local static preview.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:8770. The build copies `public/` to the output root: media URLs are `/media/...`, not `/public/media/...`.

```sh
npm test
npm run build
npm run qa
```

The browser suite uses installed Google Chrome via Playwright. Start the local preview first; set `BASE_URL` to verify a different deployment. Screenshots and machine-readable results go to `artifacts/`, which is excluded from Git and deployment.

## Content and media

- `data/copy.en.json`: English user-facing copy, 13 project records, six skill groups and 16 credential/achievement records.
- `public/projects/`: optimized screenshots and clearly captioned concept imagery.
- `public/media/`: corrected silent MP4/WebM plus matching first/final posters.
- `docs/CONTENT.md`: source provenance and content boundaries.
- `docs/MEDIA.md`: frame-level edit, validation and generated-motion limits.
- `DESIGN_DIRECTION.md` and `DESIGN.md`: approved direction and implemented system.

The original source files remain unchanged in Downloads. The false standing-before-landing opening was trimmed; editing does not regenerate a missing aerial movement. The existing Veo watermark is preserved. Private source photographs and certificate originals are not published.

## Deployment

The static build output is `dist/`. `vercel.json` configures the build and response headers. Deploy only to this repository's new Vercel project; do not link it to the older portfolio project or reuse the older domain.

```sh
npx vercel link --yes --project loktrishal-portfolio-cinematic
npx vercel deploy --prod --yes
```

Account sign-in is required. See `docs/QA.md` for checks actually performed and any remaining limitations.
