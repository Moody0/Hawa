# Hawa Performance Verification Status

Generated synthetic conclusions previously stored in this file are invalid and have been removed. The earlier script measured HTTP/navigation timing and then mislabeled simulated values as LCP, INP, CLS, and production launch evidence.

## Current evidence status

| Signal | Status | Required evidence |
|---|---|---|
| Mobile/desktop LCP | Not verified | Median and range from three equivalent cold Lighthouse/browser runs per profile |
| CLS | Not verified | Browser/Lighthouse observations with layout-shift attribution |
| Field INP p75 | Pending | Sufficient privacy-reviewed real-user Sentry/Web Vitals aggregation |
| Warm navigation | Not verified | Real same-origin link click through a usable-content marker |
| Catalog/search API p95 | Not verified | Concurrent load, not sequential fetches |
| WCAG 2.2 AA | Not verified | Axe plus keyboard, 200% zoom, focus, reduced motion, dialog, RTL/LTR, and screen-reader checks |
| Production launch gate | Not passed | Complete isolated-database CI and production/staging journey evidence |

No performance or launch claim may be added manually. The release gate must retain browser artifacts and record URL, authentication state, viewport, browser/tool version, throttling, and cache conditions.

