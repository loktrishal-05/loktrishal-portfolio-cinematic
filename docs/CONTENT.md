# Content and image provenance

The new portfolio's public copy is centralized in `data/copy.en.json`. It carries 13 projects, six skill groups, and 16 distinct credential/achievement records. The existing portfolio source and its supplied certificate transcription were read without modifying the old project or its GitHub repository.

## Source material

- Existing content refresh: `loktrishal-portfolio/index.html` and `data/certificates.json` from the owner's previous working copy.
- Public repositories and default branches were checked through the GitHub API on 2 November 2026.
- The project descriptions preserve their original boundaries: KinSight uses fictional synthetic people/results; Solarda's hosted site is a UI preview with replayed data; eRTMAC-NWIS is an advisory synthetic-data prototype; the legal platform is still in development.
- ResumeForge, PeopleRamp, GhostIQ, SentinelPay and OnboardIQ are retained as earlier work. Their current operational status is not newly certified. The Amazon Sales dashboard remains an analytics project.
- The supplied certificates were previously inspected and deduplicated: `3.png` and `4.png` contain the same Programming using Java certificate. Participation is not promoted to an award. OfficeMaster's PowerBI workshop is not presented as a Microsoft professional certification. The ambiguous MIT placing is omitted.
- No private source photograph, original certificate file, credential identifier, QR payload or private filesystem path is published in the data file.
- Education and contact details are owner-supplied facts from the earlier portfolio; no updated GPA is invented.

## Project image provenance

All six published images are optimized WebP files. The source media belongs to the owner's public project/profile repositories or was captured from the owner's hosted application. No UI screenshot was invented.

| Asset | Source | Meaning |
| --- | --- | --- |
| `public/projects/kinsight.webp` | https://raw.githubusercontent.com/loktrishal-05/kinsight/main/docs/screenshots/01-landing.jpg | Actual KinSight landing screenshot from the project documentation |
| `public/projects/solarda.webp` | https://raw.githubusercontent.com/loktrishal-05/Solar-Da/main/evidence/screenshots/agent_console_disease_trace.jpg | Actual replay-mode Agent Console screenshot from the project evidence |
| `public/projects/exodetect.webp` | https://exodetect-isro-bah.netlify.app | Actual application screenshot captured at 1440 x 900, 2 November 2026 |
| `public/projects/edunova.webp` | https://edu-nova-dun.vercel.app | Actual landing screenshot captured at 1440 x 900, 2 November 2026 |
| `public/projects/legal.webp` | https://raw.githubusercontent.com/loktrishal-05/loktrishal-05/main/assets/project-legal-3d.jpg | Existing concept illustration from the owner's profile; explicitly captioned as concept art, not an application screenshot |
| `public/projects/nwis.webp` | https://raw.githubusercontent.com/loktrishal-05/loktrishal-05/main/assets/project-nwis-3d.jpg | Existing concept illustration from the owner's profile; explicitly captioned as concept art for a synthetic-data prototype |

The avatar and video are handled separately in `docs/MEDIA.md`. Project screenshots are not evidence that all functionality described in a repository is deployed, and captions/status text keep that distinction visible.

## Data contract

Top-level objects: `profile`, `navigation`, `hero`, `about`, `skills`, `projects`, `credentials`, `contact`, `labels`, `meta`.

Each project includes an ID, title/short title, detailed category, filter group, year label, description, technology list, status, source/demo links, optional image, accessible image description, provenance caption, dimensions and featured flag. The six recent projects are featured; the additional seven remain available in the full collection. Filters use three broad groups to avoid a chip for every domain.

Credential categories distinguish Certification, Participation, Award and Recognition. Dates are omitted when the supplied certificate has no complete date. Dated multi-day event records use the final event day rather than claiming an issue date.

All newly authored punctuation uses ASCII where appropriate to avoid PowerShell stdin encoding corruption. Original correctly encoded certificate/project titles are preserved as UTF-8.

## Checks performed

Assert-based checks verified: 13 unique project IDs; 16 credential records; six skill groups; at least one source/demo link for each project; exactly six optimized project WebP images; every featured image at least 960 pixels wide; no accidental replacement question marks in authored strings. The one intentional question mark is the contact heading.

Original full-resolution screenshot capture PNGs were removed from the new project's public assets after successful WebP conversion. The downloaded/generated original inputs elsewhere on the owner's machine were not changed.
