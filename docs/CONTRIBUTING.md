# Contributing Guide

## Branch naming
Use:
- `feature/audit/<task>`
- `feature/certificate-application/<task>`
- `feature/certificate-management/<task>`
- `feature/search/<task>`
- `chore/<task>` for shared infrastructure

## Workflow
1. Pull latest `main` (or `develop` if your team uses it).
2. Create your feature branch.
3. Keep changes inside your owned feature folder when possible.
4. Open a PR with a clear summary and test notes.

## Merge conflict prevention
- Avoid editing another member's feature folder without agreement.
- Put common code in `src/shared` instead of duplicating logic.
- Keep route changes in `src/app/router/AppRoutes.jsx`.

