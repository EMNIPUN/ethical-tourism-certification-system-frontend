# Frontend Guide (React + Vite)

This frontend uses a **feature-first architecture** so team members can work in parallel with fewer merge conflicts.

The main goal of this README is to explain:
- the folder structure,
- what should go in each folder,
- and how to add new frontend work correctly.

## Tech Stack

- React 19
- Vite 8
- React Router
- Redux Toolkit + React Redux
- Tailwind CSS v4
- ESLint

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create or update `.env`:

```env
VITE_API_BASE_URL=https://ethical-tourism-certification-syste.vercel.app/api/v1
```

Notes:
- `src/shared/api/apiClient.js` reads `VITE_API_BASE_URL`.
- If `VITE_API_BASE_URL` is missing, it falls back to `http://localhost:5000/api/v1`.
- `BACKEND_URL` in `.env` is currently not used by the frontend code.

Vercel frontend deployment note:
- In your frontend Vercel project settings, add an Environment Variable:
	- Key: `VITE_API_BASE_URL`
	- Value: `https://ethical-tourism-certification-syste.vercel.app/api/v1`
	- Environments: `Production`, `Preview`, and optionally `Development`

### 3. Run development server

```bash
npm run dev
```

### 4. Other scripts

```bash
npm run build
npm run preview
npm run lint
```

## Project Structure

```text
frontend/
|- docs/
|  |- ARCHITECTURE.md
|  `- CONTRIBUTING.md
|- public/
|  |- favicon.svg
|  `- icons.svg
|- src/
|  |- app/
|  |  |- providers/
|  |  |  `- AppProviders.jsx
|  |  |- router/
|  |  |  |- AppRoutes.jsx
|  |  |  `- featureRoutes.js
|  |  `- store/
|  |     |- index.js
|  |     |- rootReducer.js
|  |     |- hooks.js
|  |     `- README.md
|  |- assets/
|  |- components/                      # global shared UI (currently placeholder)
|  |- features/
|  |  |- admin/
|  |  |- auth/
|  |  |- audit/
|  |  |- certificate-application/
|  |  |- certificate-management/
|  |  |- home/
|  |  `- search/
|  |- shared/
|  |  |- api/
|  |  |  `- apiClient.js
|  |  |- constants/                    # placeholder
|  |  |- hooks/                        # placeholder
|  |  |- styles/                       # placeholder
|  |  `- utils/                        # placeholder
|  |- utils/                           # placeholder
|  |- App.jsx
|  |- main.jsx
|  `- index.css
|- .env
|- eslint.config.js
|- index.html
|- vite.config.js
`- package.json
```

## Folder Responsibilities (What Goes Where)

### `src/app/` (application wiring only)

Use this folder for global app setup:
- providers (`Provider`, `BrowserRouter`, bootstrapping),
- root routing composition,
- store configuration.

Do not put feature-specific UI or business logic here.

### `src/features/<feature-name>/` (main work area)

Each domain feature lives in its own folder.  
Examples: `auth`, `audit`, `certificate-management`, `search`.

Inside each feature:
- `api/`: API calls for that feature (use `apiRequest` from `src/shared/api/apiClient.js`).
- `components/`: reusable UI pieces used only by this feature.
- `pages/`: route-level screens for this feature.
- `routes/`: feature-local route definitions (export a `*Routes` component).
- `store/`: Redux slice + selectors for feature state.
- `styles/`: feature-specific CSS only when needed.
- `hooks/`, `utils/` (optional): feature-specific hooks/helpers.

### `src/shared/` (cross-feature reusable code)

Use this for code shared by many features:
- shared API client,
- shared constants,
- shared hooks,
- shared styles and utility helpers.

If code is only used by one feature, keep it inside that feature.

### `src/components/` and `src/utils/`

These are currently placeholders.  
Prefer `src/features/*` and `src/shared/*` first.  
Only add to these folders if your team agrees on a clear global convention.

### `docs/`

- `ARCHITECTURE.md`: architectural rules and ownership.
- `CONTRIBUTING.md`: branch naming and collaboration workflow.

## Feature Module Blueprint

Use this template when creating or expanding a feature:

```text
src/features/<feature-name>/
|- api/
|  `- <feature>Api.js
|- components/
|  `- ...
|- pages/
|  `- <Feature>MainPage.jsx
|- routes/
|  `- <Feature>Routes.jsx
|- store/
|  |- <feature>Slice.js
|  `- <feature>Selectors.js
|- styles/
|  `- ...
`- hooks/ or utils/ (optional)
```

If a folder has a `DELETE.MD` placeholder:
- keep the folder,
- add your real files,
- then remove `DELETE.MD` when no longer needed.

## Routing Flow

1. Define path constant in `src/app/router/featureRoutes.js`.
2. Create/update feature route component in `src/features/<feature>/routes/*Routes.jsx`.
3. Register it in `src/app/router/AppRoutes.jsx`.
4. Protect routes with `ProtectedRoute` if authentication/roles are required.

Current top-level routes:
- `/login`
- `/register`
- `/admin/*` (Admin only)
- `/certificate-application/*`
- `/certificate-management/*`
- `/audit/*`
- `/search/*`

## Redux Flow

1. Add a slice in `src/features/<feature>/store/<feature>Slice.js`.
2. Add selectors in `src/features/<feature>/store/<feature>Selectors.js`.
3. Register reducer in `src/app/store/rootReducer.js`.
4. Access state/actions using `useAppSelector` and `useAppDispatch` from `src/app/store/hooks.js`.

## API Flow

- Use `apiRequest()` from `src/shared/api/apiClient.js`.
- Keep feature-specific endpoint functions in each feature's `api/` folder.
- Pass auth token only when needed; `apiRequest` already supports `token` and JSON parsing/error handling.

## Styling Notes

- Global styles and CSS variables are in `src/index.css`.
- Tailwind is enabled through `@tailwindcss/vite` in `vite.config.js`.
- Reuse existing design tokens in `:root` before adding new colors.

## Collaboration Rules (Short Version)

- Keep changes inside your owned feature folder when possible.
- Avoid importing feature-to-feature directly unless necessary.
- Move truly shared code into `src/shared`.
- Keep route wiring centralized in `src/app/router`.
- Keep global store composition centralized in `src/app/store/rootReducer.js`.

For team workflow details, read:
- `docs/ARCHITECTURE.md`
- `docs/CONTRIBUTING.md`
