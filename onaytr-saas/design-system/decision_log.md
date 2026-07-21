# Decision Log: UI Design Architecture

**Date**: 2026-07-12
**Component**: Frontend Landing Page & Route Separation

## Decisions

### 1. Separate Routes for Landing Page and Dashboard
- **Decision**: Landing page will live on `/` (public root) and the user dashboard will live on `/dashboard`.
- **Alternatives Considered**: Unified root page `/` using conditional session rendering.
- **Why Chosen**: User preferred separate routes. This allows clean URL division and traditional SaaS marketing setup.

### 2. GitHub-Inspired High-Tech Dark Design for Landing Page
- **Decision**: The landing page at `/` will feature a premium, dark-obsidian aesthetic modeled after GitHub.com's developer homepage. It will use thin borders (`border-zinc-800`), glowing gradient backdrops, grid layouts, and code/log styles for SMS activation feeds.
- **Alternatives Considered**: Clean light neobank theme (matching dashboard), maximalist pastel theme.
- **Why Chosen**: User explicitly requested the modern, high-tech GitHub aesthetic for the landing page.

### 3. Dashboard Intactness
- **Decision**: The user dashboard code (formerly at `app/page.tsx`, now moved) will remain completely untouched design-wise to preserve the user's preferred layout.
- **Why Chosen**: User specifically requested: "Panele dokunma ben sadece önyüzden bahsediyorum".
