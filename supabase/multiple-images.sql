-- Caritas Libmanan website: allow several photos per activity.
-- Run manually in the Supabase SQL Editor. Safe to run more than once.
-- Only ADDS a column; no existing activities or photos are changed or removed.
--
-- image_url keeps holding the first (cover) photo, so older activities keep working.
-- image_urls holds every photo of the activity, in the order the admin selected them.

alter table public.project_activities
    add column if not exists image_urls text[];

-- Make the new column visible to the website API right away.
notify pgrst, 'reload schema';
