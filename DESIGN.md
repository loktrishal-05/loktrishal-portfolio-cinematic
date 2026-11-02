# Design system: Kinetic intelligence

This is the implemented replacement for the rejected warm-paper avatar-film world.

## Tokens and composition
Ground #eceef1; paper #f7f8fa; graphite #20252b; secondary #535c68; cobalt #2955dd; line #c5cbd5. Self-hosted Bricolage Grotesque display and Source Sans 3 reading text, font-display swap. Tokens live in styles.css.

A monumental name sits behind a chrome/cobalt orbital instrument; lower-left statement and work action remain clear. Desktop pinning unfolds the scene into six large project planes. A separate filterable archive contains all 13 projects. Cobalt statement, education/about, six expertise groups, 16 recognition records and large email finale follow.

## Responsive and interaction
At 800px and below, project planes stack and pinning stops. Desktop media heights adapt to short screens. The floating header appears after the opening; mobile gets an expandable menu. Controls have 44px targets and visible focus rings. Keyboard focus within the wide gallery scrolls the focused project into view; its handler is removed when that layout reverts. Archive and filter controls expose expanded/pressed state.

GSAP/ScrollTrigger uses a reverting matchMedia context. Lenis and WebGL share GSAP's ticker. The dynamic Three.js scene caps DPR, uses a local PMREM room, pauses offscreen/hidden and supports a pause button. Geometry, lighting and contact shadow are original. The canvas is decorative and hidden from assistive technology.

Reduced motion removes pinning/scrub and skips the scene download; Save-Data also skips WebGL. Failed WebGL/import preserves the actual rendered still. Failed JSON offers retry while static identity/contact remain usable. Dynamic copy uses textContent; external links accept only HTTPS without embedded credentials.

## Media and content
No avatar film or video download ships. Project screenshots and labelled concept illustrations retain their evidence boundaries. No fake metrics, authentication, dashboard or chatbot were added. Original source files in Downloads remain untouched. See docs/QA.md for measured checks and remaining limits.
