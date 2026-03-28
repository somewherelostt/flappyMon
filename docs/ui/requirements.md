# mon-ad UI/UX Requirements

This document acts as the primary layout and aesthetic guide for the Next.js `ad_by_monad` web interface, strictly adhering to the `frontend-design` methodology.

## Vision Statement
`mon-ad` is a next-generation decentralized advertising protocol built exclusively for Monad's 10k TPS execution environment. The platform bridges Publishers and Advertisers through a blistering-fast, gasless, x402-powered queue system.

## The Aesthetic: Refined Cyberpunk / Neon Monad

We are leaving behind standard brutalist/utilitarian minimalism. The platform must feel like a high-speed, futuristic exchange:
- **Atmosphere**: Deep violet space (`#0a0514` to `#160e24` gradients), punctuated by glowing glassmorphism planes.
- **Accents**: Blazing "Monad Purple" (`#836EF9`), Neon Cyan, and striking Hot Magenta for call-to-action endpoints and active bids.
- **Typography Structure**: 
  - *Headings, Logos, & Large Display Numbers*: Geometric, widespread sans-serifs (e.g., `Space Grotesk` or `Outfit`).
  - *Data grids, code snippets, prices, addresses*: High-precision monospaced fonts (`JetBrains Mono`). No default generic sans (Arial/Inter).

## Core Directives for the `frontend-design` Agent:

1. **Spatial Layout**: Abandon generic 3-column card grids for the hero section. Use asymmetrical overlaps, generous negative space, and floating "nodes" to represent active Ad Slots in the queue.
2. **Motion Design**:
   - Staggered reveals on page load.
   - Distinct, smooth hover states over interactive ad spaces that feel like accessing a terminal (slight 1.02x scale, box-shadow glow increase).
   - No bouncy or playful animations. Keep it slick and industrial.
3. **Data Display**: Tables and market slots must feel heavy, precise, and highly legible, using deep borders, soft grain noise background overlays, and neon indicators (Live, Queued, Expired).

### Reference Ingestions:
- **PITCH_DECK.md**: "Fastest decentralized ad placement". UI should reflect instantaneous finality. Avoid loading spinners where possible; replace them with swift progress bars or instant optimistic UI updates.
- **Nikku Templates**: Emulate high-end Web3 connection dropdowns and sleek wallet profile cards. Dark-mode dashboard premium quality.
