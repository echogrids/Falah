-- Sadaqah redesign: New Offer separates "Purpose" (existing `remarks`
-- column) from an optional free-text note, mirroring the
-- name/notes shape already used by charity_institutions.
alter table public.charity_offers add column notes text;
