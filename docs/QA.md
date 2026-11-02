# Current refinement validation

## Actually run

| Check | Result |
| --- | --- |
| npm test | 10 tests pass, including all 16 matching certificate documents |
| npm run build | Successful static build with refinements.css and certificate assets |
| Chrome: 360, 768, 1280, 1920px | Zero page overflow, console errors or detected axe WCAG A/AA violations |
| Hero | Name opacity is 1 at entry; desktop/mobile screenshots inspected; terminal present |
| Skills | Native summary opens by Enter and exposes skill tags |
| Certificates | 16 cards, scroll controls move the ribbon, no overflowing card content; all 16 supporting documents return HTTP 200 |
| Public Vercel build | Same four-width interaction/axe/console/overflow suite passes; all 16 document URLs return HTTP 200; [deployment report](qa-v3/deployment-report.json) |
| Reduced motion | Static scene fallback and six skill domains confirmed |
| Short desktop 1440x768 | Reviewer found clipped pinned project links; compact layout fixed and confirmed links at y686-730, inside the viewport |
| Original portfolio | Old checkout remains clean and is not pushed |

Proof: [desktop opening](qa-v3/1280-hero.png), [mobile opening](qa-v3/360-hero.png), [project art](qa-v3/1280-work.png), [skills](qa-v3/1280-skills.png), [certificates](qa-v3/1280-certificates.png), [short desktop](qa-v3/1440-short-work.png), [report](qa-v3/report.json).

## Not checked / suggested manual checks

| Check | Limit |
| --- | --- |
| Physical mobile GPU/thermal behavior | Software-rendered Chrome is not physical device performance |
| Safari, Firefox and screen readers | This refinement was browser-tested in Chrome |
| Issuer-side credential verification | Documents were matched to the owner's originals, not revalidated with issuers |

The earlier 3D revision's motion, slow-network, missing-bundle, no-WebGL and lifecycle evidence remains in qa-v2/. Those results are historical and are not presented as new performance measurements for this refinement.
