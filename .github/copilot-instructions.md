# Copilot Instructions — Moovle

You are assisting with **Moovle**, a social sports web app where users:

- create activities
- connect with mates
- join activities
- receive notifications

This is a **React + Vite** project styled with **Tailwind CSS** and backed by **Supabase**.

---

## Product & UX context

- Core loop:
  Create activity → mates discover/join → notifications → repeat
- UX principles:
  - Calm, modern, spacious UI
  - Prefer clarity over density
  - Progressive disclosure (advanced options behind menus/modals)
  - Notifications are global (top bar / bell), not hidden in navigation
- This is **activity-first**, not a social feed app.

---

## Tech stack

- Frontend: React (Vite)
- Styling: Tailwind CSS + some local CSS files where already used
- Backend: Supabase (auth, database, realtime)
- Auth handled via `AuthContext`
- Routing handled inside `App.jsx`
- No Redux or external state libraries

---

## Repository structure (important)

Follow existing patterns. Do NOT introduce new architectural patterns unless asked.

src/
components/ → reusable UI components
pages/ → route-level pages
contexts/ → React context providers (AuthContext)
lib/ → external clients & helpers (supabase.js)
config/ → static configuration (sports, etc.)

markdown
Code kopiëren

### Pages

- Pages live in `src/pages`
- Examples:
  - Feed.jsx
  - Agenda.jsx
  - Mates.jsx
  - Notifications.jsx
  - Profile.jsx
  - CreateActivity.jsx
- Pages handle data fetching and high-level logic

### Components

- Reusable UI only
- Keep components focused and small
- Examples:
  - ActivityCard
  - Sidebar
  - Layout
  - LocationInput
- Components should receive data via props where possible

---

## Auth & permissions

- Authentication logic lives in `AuthContext.jsx`
- Use the existing context instead of introducing new auth helpers
- Protected routes use `ProtectedRoute.jsx`
- Assume Supabase auth is the source of truth

---

## Supabase conventions

- Supabase client lives in `src/lib/supabase.js`
- Prefer:
  - UUID primary keys
  - `created_at` timestamps
- When suggesting schema changes, include:
  - table structure
  - relationships
  - example queries
  - RLS policy ideas (high-level unless SQL is requested)

---

## Coding standards

- Use JavaScript (not TypeScript) unless explicitly requested
- Prefer readable, explicit code
- Avoid premature abstraction
- Avoid introducing new dependencies unless clearly justified
- Keep logic simple and testable

---

## Tailwind & UI conventions

- Prefer Tailwind utility classes over custom CSS
- Use consistent spacing:
  - `p-4`, `p-6`, `gap-4`, `gap-6`
- Cards:
  - rounded corners
  - subtle shadow
  - border where appropriate
- Buttons:
  - consistent sizing
  - hover + focus states
- Always consider empty, loading, and error states

---

## Feature implementation checklist

When implementing a feature:

1. Describe the user flow in 3–6 bullet points
2. Identify the minimum data needed
3. Implement UI first, then wire data
4. Handle loading / empty / error states
5. Suggest a simple manual test plan

---

## Moovle domain language

- Activity:
  - sport
  - date & time
  - duration
  - location (real venue)
  - capacity
  - host
  - visibility (public/private)
- Mates:
  - bidirectional connection
  - created via request → accept
- Notifications:
  - mate requests
  - joins
  - activity reminders
  - invites
