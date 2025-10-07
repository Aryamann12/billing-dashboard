# Repository Guidelines

This repository is a Next.js 14 + TypeScript billing dashboard. Follow these concise conventions to keep contributions consistent and easy to review.

## Project Structure & Module Organization
- App routes and pages: pp/ (Server/Client components; route groups allowed).
- Reusable UI and layouts: components/
- Hooks and client utilities: hooks/
- Shared logic and helpers: lib/
- Static assets (images, icons): public/
- Global styles and Tailwind config: styles/, postcss.config.mjs, Tailwind setup.
- Tests: colocate as *.test.ts[x] near source or under pp/__tests__/ if broader.

## Build, Test, and Development Commands
- pnpm dev or 
pm run dev: start Next.js in development.
- pnpm build or 
pm run build: production build to .next/.
- pnpm start or 
pm run start: run the production server.
- pnpm lint or 
pm run lint: run Next.js/TypeScript lint rules.

## Coding Style & Naming Conventions
- TypeScript required; prefer explicit types at boundaries (props, APIs, utils).
- Indentation: 2 spaces; keep lines = 100 chars where practical.
- Components: PascalCase.tsx in components/; hooks: useThing.ts in hooks/.
- pp/ segment folders use kebab-case; server actions prefixed ction*.
- Styling: Tailwind CSS; avoid ad-hoc inline styles; prefer utility classes.
- Lint/format: run pnpm lint; organize imports; consistent React patterns.

## Testing Guidelines
- Framework: Jest/Vitest with React Testing Library (if configured).
- Name tests *.test.ts or *.test.tsx next to the unit under test.
- Cover utilities, hooks, and critical components (charts, forms, auth flows).
- Run tests with pnpm test (add script if missing) and ensure green locally.

## Commit & Pull Request Guidelines
- Commits: imperative subject (= 72 chars). Example: eat(charts): add weekly revenue trend.
- Scope by area when helpful: pp/, components/, hooks/, lib/.
- PRs include: description, screenshots for UI, verification steps, linked issue/Task.
- Keep PRs focused; call out breaking changes and migrations.

## Security & Configuration Tips
- Do not commit secrets; use .env.local (dev) and CI secrets.
- Validate inputs with zod; guard server actions/route handlers.
- Prefer server components for data access; avoid leaking sensitive data to clients.

## Agent-Specific Instructions
- Respect this AGENTS.md across the repo.
- Match structure and naming above when generating files or refactors.