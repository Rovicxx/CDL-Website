# Caritas Diocese of Libmanan Website

Static website for Caritas Diocese of Libmanan, Inc., deployed on Vercel at https://www.caritas-libmanan.org/.

## Architecture

- **Pages:** plain HTML (`index.html`, `about_us.html`, `programs.html`, `donations.html`, `updates.html`, `privacy.html`, `404.html`).
- **Styling:** Tailwind CSS via CDN. The shared theme lives in `tailwind-config.js`.
- **Scripts:** `scripts.js` (menus, galleries, activity feed, admin "Add Activity" form).
- **Data:** Supabase. The home page reads the `project_activities` table with the public anon key, and staff sign in with Supabase Auth to add activities.
- **Admin:** staff sign in at `/admin` (`admin.html` + `admin.js`, not linked from the public pages) to publish
  activities and upload photos to the `activity-images` storage bucket. There is intentionally no delete feature;
  published activities and photos can only be changed or removed from the Supabase dashboard.
- **Security headers:** set in `vercel.json` (Content-Security-Policy, X-Frame-Options, etc.).

## Security notes

- The Supabase anon key in `scripts.js` is public by design. Write access is enforced by Row Level Security,
  so apply and keep `supabase/security.sql` in place.
- Never commit secrets. `.env*` files are git-ignored.
- The CSP forbids inline scripts. Put new JavaScript in `scripts.js` (or another file), not in `<script>` blocks or `onclick=` attributes.
  If you add a new external service (script, iframe, or API), add its origin to the CSP in `vercel.json`.

## Local preview

```bash
npx http-server -p 8080 -c-1
```

This preview does not apply the `vercel.json` headers. Use `vercel dev` to test with them.
