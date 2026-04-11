# Frontend Architecture

## Overview
The frontend follows a feature-first structure so each team member can work independently with minimal merge conflicts.

## Top-level folders
- `src/app`: application wiring (`providers`, `router`, and Redux `store`)
- `src/features`: feature modules (auth, audit, certificate modules, search, admin, home)
- `src/shared`: reusable cross-feature code (api client, ui primitives, constants, utils)

## Team ownership
- `src/features/audit/**` -> Audit owner
- `src/features/certificate-application/**` -> Certificate Application owner
- `src/features/certificate-management/**` -> Certificate Management owner
- `src/features/search/**` -> Search owner
- Shared ownership: `src/app/**`, `src/shared/**`, `src/features/auth/**`, `src/features/admin/**`, `src/features/home/**`

## Import boundaries
- Keep feature-internal imports inside the same feature whenever possible.
- Shared utilities/components should be placed in `src/shared`.
- Route wiring belongs only in `src/app/router`.
- Global state belongs in feature slices under each feature `store` folder.
