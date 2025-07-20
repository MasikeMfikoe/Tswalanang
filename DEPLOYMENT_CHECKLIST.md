# Deployment Checklist

This checklist outlines the steps required to successfully deploy the TSW Smartlog application.

## Pre-Deployment

- [ ] **Environment Variables:**
  - [ ] `SUPABASE_URL`: Supabase project URL.
  - [ ] `SUPABASE_ANON_KEY`: Supabase public anon key.
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for server-side operations).
  - [ ] `MAERSK_CLIENT_ID`: Maersk API client ID.
  - [ ] `MAERSK_CLIENT_SECRET`: Maersk API client secret.
  - [ ] `MAERSK_API_URL`: Maersk API base URL.
  - [ ] `SEARATES_API_KEY`: SeaRates API key.
  - [ ] `GOCOMET_EMAIL`: Gocomet API login email.
  - [ ] `GOCOMET_PASSWORD`: Gocomet API login password.
  - [ ] `GOCOMET_API_URL`: Gocomet API base URL (if different from default).
  - [ ] `TRACKSHIP_API_KEY`: TrackShip API key.
  - [ ] `TRACKSHIP_API_URL`: TrackShip API base URL.
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`: Public Supabase URL for client-side.
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public Supabase anon key for client-side.
  - [ ] `NEXT_PUBLIC_API_URL`: Public API URL if your backend is separate.

- [ ] **Database Setup:**
  - [ ] Ensure Supabase project is initialized.
  - [ ] Run all necessary SQL migration scripts (`supabase/migrations/*.sql`) in order.
  - [ ] Verify Row Level Security (RLS) policies are correctly configured for production.
  - [ ] Seed initial data if required (e. ] `scripts/populate_mock_users_to_supabase.sql`).

- [ ] **Authentication:**
  - [ ] Confirm Supabase Auth is enabled and configured (e.g., email/password, social logins).
  - [ ] Test user registration and login flows.

- [ ] **API Endpoints:**
  - [ ] Verify all `/api` routes are functional and secure.
  - [ ] Test external API integrations (Maersk, SeaRates, Gocomet, TrackShip).

- [ ] **Error Handling & Monitoring:**
  - [ ] Ensure error logging and monitoring are set up (e.g., Vercel's built-in logs, external services).
  - [ ] Test `error.tsx` and `not-found.tsx` pages.

- [ ] **Performance Optimization:**
  - [ ] Review Next.js caching strategies (ISR, SSG, SSR).
  - [ ] Optimize image loading (e.g., `next/image`).
  - [ ] Minify CSS/JS.

- [ ] **Accessibility:**
  - [ ] Conduct an accessibility audit.
  - [ ] Ensure all interactive elements have proper ARIA attributes.

- [ ] **Testing:**
  - [ ] Run all unit and integration tests.
  - [ ] Perform end-to-end testing for critical user flows.

## Deployment Steps (Vercel)

1.  **Link Git Repository:** Ensure your Vercel project is linked to the correct GitHub/GitLab/Bitbucket repository and branch (e.g., `main`).
2.  **Configure Build Settings:**
    -   **Build Command:** `pnpm build` (or `npm run build`, `yarn build` depending on your package manager).
    -   **Install Command:** `pnpm install` (or `npm install`, `yarn install`).
    -   **Root Directory:** Ensure it's set correctly if your project is in a monorepo or subdirectory.
3.  **Add Environment Variables:** Add all required environment variables (listed above) in the Vercel project settings. Mark sensitive variables as "Secret".
4.  **Deploy:** Trigger a new deployment from the Vercel dashboard or by pushing to the linked branch.
5.  **Monitor Deployment Logs:** Check the build and runtime logs for any errors or warnings.

## Post-Deployment Verification

- [ ] **Application Access:**
  - [ ] Access the deployed application URL.
  - [ ] Verify all main pages load correctly.
- [ ] **Core Functionality:**
  - [ ] Test user login/logout.
  - [ ] Create/view/edit orders, customers, estimates.
  - [ ] Verify shipment tracking functionality.
  - [ ] Check document management.
- [ ] **Data Integrity:**
  - [ ] Confirm data is being fetched and displayed correctly from Supabase.
  - [ ] Test data submission forms.
- [ ] **Responsive Design:**
  - [ ] Check application layout on various screen sizes (desktop, tablet, mobile).
- [ ] **Security:**
  - [ ] Verify RLS is enforced for different user roles.
  - [ ] Check for any exposed API keys or sensitive information in the browser console/network tab.
