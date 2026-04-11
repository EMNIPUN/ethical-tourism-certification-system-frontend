# Certification Application UI Plan (Frontend)

Goal: Implement the React + Redux UI for the **Certification Application Management** backend workflows in `src/features/certificate-application/`.

This UI will consume these backend endpoints (as implemented in backend `certification/application/routes/hotelRoutes.js`):

- `GET /hotels` — list hotels (supports pagination, sort, fields, dynamic filtering)
- `POST /hotels` — create hotel + upload evidence documents (multipart) and return Google profile candidates
- `GET /hotels/:id` — fetch hotel details
- `PUT /hotels/:id` — update hotel + documents (multipart)
- `DELETE /hotels/:id` — delete hotel
- `POST /hotels/:id/confirm-match` — confirm selected Google `placeId` and trigger evaluation/scoring

> Note: The exact API base path prefix is already handled by `src/shared/api/apiClient.js` via `VITE_API_BASE_URL`. During implementation, verify the final mounted backend path (e.g., `/certification/application/hotels`) and reflect it in the feature API module.

---

## 1) Align on UX (minimal, complete workflow)

**Pages (routes) to implement inside this feature:**

1. **Applications List**
   - Purpose: show hotels/applications the user can access
   - Backend: `GET /hotels`
   - Must include: loading + error, and click-through to detail

2. **New Application Wizard (Step 1: Create + Upload)**
   - Purpose: collect hotel details + evidence docs, submit as multipart
   - Backend: `POST /hotels` (multipart)
   - Output: show `candidates[]` from API response and next-step CTA

3. **Confirm Match (Step 2: Choose Google candidate)**
   - Purpose: pick `placeId` (or “none matched”) and submit confirmation
   - Backend: `POST /hotels/:id/confirm-match`
   - Output: show evaluation result (`status`, `aiScore`, `aiJustification`) and the updated hotel/request data

4. **Application Details**
   - Purpose: display hotel + scoring state + uploaded docs metadata (if returned)
   - Backend: `GET /hotels/:id`
   - Actions: “Edit”, “Delete”, “Confirm match” (if still pending), “Back to list”

5. **Edit Application (reuse wizard)**
   - Purpose: edit hotel data and optionally re-upload docs
   - Backend: `PUT /hotels/:id` (multipart)

**Routing updates:**
- Expand `src/features/certificate-application/routes/CertificateApplicationRoutes.jsx` beyond the example page.
- Keep all feature pages under `/certificate-application/*` (already mounted in `src/app/router/AppRoutes.jsx`).

---

## 2) API integration layer (feature-scoped)

Update `src/features/certificate-application/api/certificateApplicationApi.js` to expose a small set of functions used by thunks:

- `listHotels({ page, limit, sort, fields, filters }, token)` → `GET /hotels?...`
- `createHotelApplication({ hotelData, files }, token)` → `POST /hotels` (multipart `FormData`)
- `getHotelById(id, token)` → `GET /hotels/:id`
- `updateHotelApplication(id, { hotelData, files }, token)` → `PUT /hotels/:id` (multipart)
- `deleteHotelById(id, token)` → `DELETE /hotels/:id`
- `confirmHotelMatch(id, placeId, token)` → `POST /hotels/:id/confirm-match`

**Implementation notes:**
- Use `src/shared/api/apiClient.js` (`API_BASE_URL`) for the base.
- For JSON calls, keep using `apiRequest()`.
- For multipart calls, add a **small helper** in this feature API file (or in `apiClient.js` if you want it shared) that:
  - uses `fetch()` directly
  - sets `Authorization: Bearer <token>`
  - does **not** set `Content-Type` manually (browser will set `multipart/form-data; boundary=...`)
  - reads JSON safely and throws consistent errors

---

## 3) Redux state management (RTK)

Extend `src/features/certificate-application/store/certificateApplicationSlice.js` to cover both:

A) **Wizard/draft state (already exists):**
- `currentStep`, `draft` (hotel fields + file selections)

B) **Server state:**
- `hotels.items`, `hotels.pagination`, `hotels.status`, `hotels.error`
- `hotelDetails.data`, `hotelDetails.status`, `hotelDetails.error`
- `create.status`, `create.error`, and store the returned `{ hotelId, candidates }`
- `confirm.status`, `confirm.error`, and store evaluation result
- `update.status`, `delete.status` (simple status tracking)

Add thunks via `createAsyncThunk`:
- `fetchHotels`
- `fetchHotel`
- `submitNewHotel`
- `submitConfirmMatch`
- `submitHotelUpdate`
- `submitHotelDelete`

**Session handling integration:**
- Read the auth token from Redux (`state.auth.token`) in each thunk.
- If the backend returns `401`, surface a user-friendly error and (optional) trigger logout if desired.

Update selectors in `src/features/certificate-application/store/certificateApplicationSelectors.js` to include:
- list, details, candidates, evaluation, and all loading/error flags

---

## 4) UI components (small + reusable)

Create a minimal set of components in `src/features/certificate-application/components/` (replace `DELETE.MD`):

- `HotelApplicationWizard.jsx`
  - stepper shell, uses Redux `draft`
- `HotelApplicationForm.jsx`
  - inputs for required `hotelData` fields
- `EvidenceUploadFields.jsx`
  - file pickers for: `legalDocuments[]`, `salarySlips`, `staffHandbook`, `hrPolicy`
- `GoogleCandidatePicker.jsx`
  - render candidates returned from `POST /hotels`
- `AsyncState.jsx` (optional)
  - consistent loading/error rendering

Keep styling consistent with existing project patterns (Tailwind + CSS vars already used).

---

## 5) Pages (wire UI ↔ Redux ↔ API)

Replace the example page with real pages:

- `pages/HotelApplicationsListPage.jsx`
  - dispatch `fetchHotels` on mount
  - render list and navigation links

- `pages/NewHotelApplicationPage.jsx`
  - render wizard
  - on submit: dispatch `submitNewHotel`
  - on success: navigate to confirm step page

- `pages/ConfirmHotelMatchPage.jsx`
  - read `hotelId` from route params
  - render candidates from store (or refetch if user refreshes)
  - dispatch `submitConfirmMatch`

- `pages/HotelApplicationDetailsPage.jsx`
  - dispatch `fetchHotel(id)`
  - show status, scoring/evaluation, actions

- `pages/EditHotelApplicationPage.jsx`
  - preload hotel details into draft
  - dispatch `submitHotelUpdate`

---

## 6) Routes

Update `src/features/certificate-application/routes/CertificateApplicationRoutes.jsx` with routes like:

- `/` → list
- `/new` → new application wizard
- `/:id` → details
- `/:id/edit` → edit
- `/:id/confirm-match` → confirm match

---

## 7) Demonstrate required criteria (what you’ll show the marker)

**State management (Redux):**
- Wizard state (draft + step) in Redux
- Server state (list/detail/create/confirm/update/delete) in Redux via thunks

**Session handling:**
- Existing auth flow already stores token and boots session (`bootstrapAuthSession`)
- Certificate application thunks use `state.auth.token`
- Feature pages are behind `ProtectedRoute` (already configured)

**Deployment (frontend):**
- Ensure `VITE_API_BASE_URL` is used (already in `apiClient.js`).
- Document the deployment steps in the frontend README:
  - set `VITE_API_BASE_URL` to the deployed backend URL
  - `npm run build` → deploy dist (Vercel/Netlify)

---

## 8) Validation checklist (Definition of Done)

- User can list hotels via `GET /hotels`
- User can create a hotel application with files via `POST /hotels` and see candidates
- User can confirm match via `POST /hotels/:id/confirm-match` and see evaluation
- User can view details via `GET /hotels/:id`
- User can update via `PUT /hotels/:id`
- User can delete via `DELETE /hotels/:id`
- All calls include bearer auth token and errors are handled (401/409/400)

---

## 9) Implementation order (recommended)

1. Implement `certificateApplicationApi.js` (JSON + multipart helpers)
2. Add thunks + server-state fields to `certificateApplicationSlice.js`
3. Build list + details pages (fast feedback)
4. Build wizard + create flow (multipart)
5. Build candidate picker + confirm-match flow
6. Build edit + delete actions
7. Update README with session + deployment notes
