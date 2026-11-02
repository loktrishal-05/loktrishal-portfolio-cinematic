# Cinematic 3D revision - checks actually run

2 November 2026. Supersedes the rejected film-version QA. Local browser: installed Chrome through Playwright; WebGL test uses Chrome's software renderer. This does not establish physical-device GPU frame rate.

| Actually run | Result / evidence |
| --- | --- |
| npm test | 9/9: content integrity, safe links, dates, image provenance, static fallback, motion policy and choreography bounds |
| npm run build | Static bundled output built successfully; no runtime CDN |
| Browser widths 360, 768, 1280, 1920px at 1000px height | No horizontal page overflow; six featured projects, 16 recognition records; scene ready |
| axe WCAG 2 A/AA + 2.1 A/AA at all four widths | Zero detected violations; all visible links/buttons meet the 44px target check |
| Console / requests at all four widths | Zero errors, zero failed responses, zero video requests |
| Local LCP observations, same four widths | 556 / 492 / 356 / 348 ms; local desktop observations, not a field performance guarantee |
| Real hero scroll | Scene open changes 0 to 1, rotation and camera distance change; [28-frame recording](qa-v2/hero-scroll.gif) |
| Horizontal gallery / short desktop 1440x768 | Project source links visible at y572-616; [screenshot](qa-v2/short-desktop-gallery.png) |
| Keyboard | Skip link focus and navigation; mobile menu Escape; desktop-to-mobile gallery focus regression checked |
| Reduced motion | No scene chunk request, no ScrollTriggers; switching preference keeps renderer paused after visibility events |
| Save-Data | No scene chunk request; static fallback |
| Missing 3D bundle / WebGL disabled | Real rendered poster stays visible; WebGL-disabled fallback has zero console errors |
| JSON 503 | Static identity survives, retry restores content |
| Slow 3G simulation | 400ms latency, 50KB/s: identity/poster visible during loading; complete live scene ready after 26.1s |
| Persisted pagehide | Synthetic back-forward-cache event preserves initialized state; actual history restoration remains manual |
| Independent code/browser review | Three P2 lifecycle defects found and fixed: gallery focus cleanup, reduced-motion resume guard, persisted pagehide teardown |
| Design detector | One scan. Small metadata raised to 11px and tracking reduced. Remaining structural warnings reviewed visually: full-bleed section wrappers have inset children; tight leading is architectural display, not body copy |
| Public Vercel deployment | Full four-width/five-scenario suite passed on https://swift-eclipse-zuv78aq.tmp.now ; zero console/asset/axe/target/overflow issues; observed LCP 1328 / 384 / 292 / 260ms |
| Original portfolio isolation | Old remote main remains 935af431f705e69b312e631ad6584e2618f15219; old local checkout clean |

Static contrast measurements: graphite on ground/paper 13.28/14.52:1; muted 5.83/6.38:1; cobalt 5.26/5.75:1; paper on cobalt 5.75:1. All static text pairs pass normal-text AA.

## Visual evidence
[Desktop hero](qa-v2/1280-hero.png) - [Mobile hero](qa-v2/360-hero.png) - [Gallery](qa-v2/1920-gallery-0.5.png) - [Recognition](qa-v2/1280-credentials.png). Reports: [viewport/scenario results](qa-v2/qa-report.json), [motion/network results](qa-v2/motion-report.json). The final metadata-size/lifecycle fixes are covered by targeted tests and the deployment confirmation.

## Suggested manual checks - not claimed as run
| Manual check | Why |
| --- | --- |
| Physical mid-range Android/iPhone GPU and thermal behavior | Software-rendered desktop Chrome is not device performance |
| Safari / Firefox / screen reader | Only Chrome was automated |
| Real back/forward history restoration | Only persisted pagehide preservation was exercised |
| Production Core Web Vitals and real mobile network | Local LCP and throttling are not field measurements |
| Every third-party demo's full workflow | Portfolio links preserve project status/prototype limits; backends are outside this portfolio change |

Public confirmation: [deployment results](qa-v2/deployment-report.json). Current screenshots show the public deployment.
