# Frontend Architecture

The web app is built with React, TypeScript, Redux Toolkit, and React Router. This guideline explains how we organize features and keep UI code maintainable.

## Project Layout

- `app/app.tsx` – root component, global providers.
- `app/config` – app-wide configuration (i18n, axios, store).
- `app/entities/<feature>` – CRUD screens for a backend entity.
- `app/shared` – reusable components, layouts, utilities, models.
- `app/modules` – cross-cutting modules (account, admin, login, home).

## Feature Structure

Each `entities/<feature>` folder follows the same pattern:

- `feature.tsx` – list view (table or cards).  
- `feature-detail.tsx` – read-only view.  
- `feature-update.tsx` – create/update form.  
- `feature-delete-dialog.tsx` – confirmation modal.  
- `feature.reducer.ts` – Redux slice (`createAsyncThunk` + `createEntitySlice`).
- `feature.model.ts` – TypeScript types (optional when using shared model).

Use route definitions in `entities/routes.tsx` to register pages. Keep asynchronous imports grouped with React Router `lazy` when possible.

## State Management

- Redux Toolkit slices per feature. Use `createEntityAdapter` for list/entity caches.
- Avoid storing UI-only state in Redux—use local component state or context.
- Selectors go next to the reducer (`export const selectActiveProducts = createSelector(...)`).
- Dispatch asynchronous actions from components inside `useEffect` hooks or event handlers.

## Networking

- Use the axios instance from `app/config/axios-interceptor.ts`.
- All REST calls live in thunks or service functions, not directly inside components.
- Handle loading, success, and error states using `isLoading`, `errorMessage`, or derived selectors.

## Forms

- Use `react-jhipster` form helpers or React Hook Form (if introduced).  
- Validate required fields in the UI and mirror backend validation messages.
- Show field-level validation errors and disable submission while pending.

## Styling & Theming

- SCSS modules per component where styles are local. Shared variables belong to `_bootstrap-variables.scss`.
- Use Bootstrap utility classes when possible to reduce custom CSS.
- Responsive design is a must; test pages at common breakpoints (320px, 768px, 1024px).

## Internationalization

- Wrap strings in `Translate` components or `translate()` helpers.
- Add new keys under `src/main/webapp/i18n/<lang>/<namespace>.json`. Keep keys human-readable (`"product.list.title"`).

## Accessibility

- Provide keyboard focus states and ARIA labels on interactive elements.
- Ensure contrast ratio meets WCAG AA (use the design system’s palette).
- Test critical screens using screen reader shortcuts at least once per release.

## Testing

- Component tests with Jest + React Testing Library. Test async flows, form validation, and selectors.
- Use Cypress for end-to-end scenarios when required (login, critical journeys).

Keep modules cohesive. When a feature grows beyond CRUD (charts, dashboards), extract subfolders and document them here.

