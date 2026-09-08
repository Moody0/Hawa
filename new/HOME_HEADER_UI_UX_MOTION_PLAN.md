# Hawa Homepage, Header, and Motion Redesign

## Direction

Create a bolder, more editorial B2B homepage while preserving the navy/gold identity, existing data sources, RTL/LTR support, dark mode, and every current product-card design. Motion should feel calm and purposeful rather than decorative.

## Homepage structure

1. Editorial hero with side-aligned desktop copy and centered mobile copy.
2. Compact agencies and trust rail.
3. Category discovery.
4. Separate commercial proof/statistics strip.
5. Featured product collection.
6. Responsive merchant-account conversion banner.
7. Weekly-demand products.
8. Distribution services.
9. Merchant testimonials.

Use alternating white, warm-neutral, and light-slate section surfaces to avoid the current repetitive sequence of centered headings and white card grids. Product-card markup, sizing, controls, typography, and styling must not be redesigned.

## Header

- Use the full navigation from `xl` upward and the compact header below it.
- Keep the header visible, reducing desktop height from 72px to 60px after scrolling.
- Consolidate merchant/profile access into one contextual account action.
- Hide an empty cart badge and use 44px mobile controls.
- Keep search and navigation dialogs keyboard accessible and restore focus when closed.

## Motion

- Implement section choreography with GSAP and ScrollTrigger using scoped contexts.
- Reveal headings, supporting copy, and child items with short vertical movement and restrained stagger.
- Refine the existing hero image settle and content sequence without double-animating nodes.
- Pause carousel autoplay during hover, focus, dragging, and hidden browser tabs.
- Preserve Framer Motion only for local tab/filter state changes.
- Disable nonessential motion and autoplay when `prefers-reduced-motion` is active.
- Do not use pinned sections, scroll hijacking, or large parallax effects.

## Acceptance criteria

- Validate at 320, 360, 390, 430, 768, 1024, 1280, 1440, and 1920px.
- Test Arabic and English, RTL and LTR, light and dark modes, and guest/authenticated states.
- Ensure no horizontal overflow, hidden content, focus loss, or layout shifts.
- Product cards must remain visually and functionally unchanged.
- TypeScript, ESLint, and production build must pass without new errors.
