# Ethical Tourism Certification System Frontend

Frontend application for the Ethical Tourism Certification platform, built with React, Vite, Tailwind CSS, and Framer Motion for modern, responsive UI with professional animations.

## Quick Overview
- Project: Ethical Tourism Certification System (Frontend)
- Purpose: Provide user interface for hotel certification, search, application, and management workflows
- Stack: React 19.2.4, Vite 8.0.1, Tailwind CSS 4.2.2, Framer Motion 12.38.0, Redux, React Router

## Key Features
- Modern React 19 with Vite for fast development and optimized builds
- Feature-based modular component architecture (auth, search, certification, audit, admin)
- Redux state management for centralized data management
- React Router for SPA navigation with nested routing
- Tailwind CSS for responsive design with custom color palette
- Framer Motion animations for professional UI transitions and interactions
- JWT authentication with token refresh mechanism
- Multi-role user interface (admin, auditor, hotel manager, user)
- Responsive design for mobile, tablet, and desktop devices
- API integration with backend services

## Project Structure
```text
ethical-tourism-certification-system-frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── providers/         # Redux Provider, Auth Provider setup
│   │   ├── router/            # Route configuration, feature routes
│   │   └── store/             # Redux store, actions, reducers
│   ├── features/
│   │   ├── admin/             # Admin dashboard and controls
│   │   ├── audit/             # Audit review and management
│   │   ├── auth/              # Login, register, authentication flows
│   │   ├── certificate-application/  # Cert application forms
│   │   ├── certificate-management/   # Cert lifecycle management
│   │   ├── common/            # Shared feature utilities
│   │   ├── home/              # Landing page
│   │   ├── hotel-dashboard/   # Hotel owner dashboard
│   │   └── search/            # Hotel search with Framer Motion animations
│   ├── shared/
│   │   ├── api/               # API service calls
│   │   ├── components/        # Reusable UI components
│   │   ├── constants/         # App-wide constants
│   │   ├── hooks/             # Custom React hooks
│   │   ├── styles/            # Global styles, Tailwind config
│   │   └── utils/             # Helper utilities
│   ├── assets/                # Images, icons, media
│   ├── App.jsx                # Root app component
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles
├── vite.config.js
├── eslint.config.js
├── tailwind.config.js
├── package.json
├── index.html
└── docs/
    ├── ARCHITECTURE.md        # Frontend architecture overview
    └── CONTRIBUTING.md        # Development contribution guidelines
```

## Documentation and Module Guidelines
- Frontend architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Contributing guidelines: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)
- Search module styling: [src/features/search/](src/features/search/)
- Auth module flows: [src/features/auth/](src/features/auth/)

## Local Development

### Prerequisites
- Node.js 22+
- npm
- Backend API running (see backend README)

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file in the frontend root:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_ENV=development
```

Notes:
- `src/shared/api/apiClient.js` reads `VITE_API_BASE_URL`
- If `VITE_API_BASE_URL` is missing, it falls back to `http://localhost:5000/api/v1`

### Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in terminal).

## Building for Production

### Build Command
```bash
npm run build
```

This creates an optimized production build in the `dist/` directory with:
- Code splitting
- Tree shaking
- Asset optimization
- CSS minification

### Preview Production Build Locally
```bash
npm run preview
```


## Deployment

### Frontend Deployment Platform and Setup
- Platform: Vercel (recommended for Vite apps)
- Build command: `npm run build`
- Output directory: `dist`

Setup steps:
1. Push frontend code to your Git repository.
2. Import repository into Vercel dashboard.
3. Configure environment variables in Vercel dashboard (VITE_API_BASE_URL, etc.).
4. Deploy and verify app loads and backend connections work.

### Environment Variables (Production)
Define these in your deployment environment:
- `VITE_API_BASE_URL` - Production backend API URL
- `VITE_ENV` - Set to `production`

### Custom Domain (Optional)
Configure custom domain in Vercel project settings after initial deployment.

## Deployment Evidence (Screenshot Placeholders)

Use this section to add your submission screenshots.

### 1. Vercel Frontend Deployment Dashboard
Insert screenshot path below:

![photo_2026-04-12_10-52-13](https://github.com/user-attachments/assets/fe9fe29f-64de-447d-a8a1-11bb46d8f25f)

> Replace `deployment/frontend-vercel-dashboard.png` with your actual screenshot path.

### 2. Live Frontend Application
Insert screenshot path below:

![photo_2026-04-12_10-52-16](https://github.com/user-attachments/assets/8ad69da1-8078-44fd-9471-1d0e0445b60d)

> Replace `deployment/frontend-live-app.png` with your actual screenshot path.

> Replace `deployment/frontend-auth-dashboard.png` with your actual screenshot path.

## Troubleshooting

### Development Issues
- `VITE_API_BASE_URL` not connecting: verify backend is running and URL is correct
- Hot Module Replacement (HMR) issues: restart dev server with `npm run dev`
- Port 5173 already in use: change port in `vite.config.js` or use `npm run dev -- --port 3000`

### Build Issues
- Build fails with large bundle: check for unused dependencies, use `npm run build -- --analyze`
- Environment variables not loaded: ensure `.env` file is in root directory
- CSS not applied: verify Tailwind config paths in `vite.config.js`

### Runtime Issues
- API calls failing (CORS): verify backend CORS settings and `VITE_API_BASE_URL`
- Authentication loops: check token storage and refresh mechanism in Redux store
- Components not animating: verify Framer Motion is installed (`npm list framer-motion`)

## Folder Responsibilities (What Goes Where)

### `src/app/` (Application Wiring Only)
Use this folder for global app setup:
- Providers (`Provider`, `BrowserRouter`, bootstrapping)
- Root routing composition
- Store configuration

Do not put feature-specific UI or business logic here.

### `src/features/<feature-name>/` (Main Work Area)
Each domain feature lives in its own folder. Examples: `auth`, `audit`, `certificate-management`, `search`.

Inside each feature:
- `api/`: API calls for that feature (use `apiRequest` from `src/shared/api/apiClient.js`)
- `components/`: Reusable UI pieces used only by this feature
- `pages/`: Route-level screens for this feature
- `routes/`: Feature-local route definitions
- `store/`: Redux slice + selectors for feature state
- `styles/`: Feature-specific CSS only when needed
- `hooks/`, `utils/` (optional): Feature-specific hooks/helpers

### `src/shared/` (Cross-Feature Reusable Code)
Use this for code shared by many features:
- Shared API client
- Shared constants
- Shared hooks
- Shared styles and utility helpers

If code is only used by one feature, keep it inside that feature.

## Useful Commands
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Check code quality
npm run lint:fix         # Fix linting issues
npm run test             # Run tests (if configured)
npm run test:e2e         # Run E2E tests (if configured)
```

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization
- Code splitting via Vite
- Tree-shaking of unused code
- Lazy loading of feature routes
- Image optimization in build process
- CSS Tailwind purging in production

## Additional Resources
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [React Router](https://reactrouter.com)

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
