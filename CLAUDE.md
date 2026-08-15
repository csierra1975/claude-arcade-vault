# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault: an online platform to play games and compete on score. Currently a fresh `create-next-app` scaffold — no domain code yet (see `app/page.tsx`).

No test framework is installed yet.

## Skills

Usar esta skill frontend-design siempre para el estilo

## Stack & conventions

- Next.js **16.3.0** (App Router), React **19.2.8**, TypeScript strict, Tailwind **v4**. See `AGENTS.md` for the mandatory instruction to read `node_modules/next/dist/docs/` before using any Next API — this version has breaking changes vs. training data.
- Route props use Next 16's auto-generated global types (`LayoutProps<"/">`, `PageProps<...>`), not hand-written interfaces — see `app/layout.tsx`. These resolve from `.next/types`, which is only populated after `next dev` or `next build` has run once.
- Tailwind v4 is CSS-first: no `tailwind.config.*` file. Theme tokens (colors, fonts) are defined in `app/globals.css` via `@theme inline`.
- Path alias `@/*` maps to the repo root (`tsconfig.json`).

## Workflow

The README specifies Spec Driven Design via `/spec` and `/spec-impl`, from the `Klerith/fernando-skills` skill pack. Those skills aren't installed in this environment yet; install with:

```bash
npx skills@latest add Klerith/fernando-skills
```
