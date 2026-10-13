-- The editor's colour picker used to store theme colours as
-- `hsl(var(--foreground))`. The theme variables now hold whole OKLCH colours,
-- which makes that expression invalid, so saved announcements switch to the
-- `var(--foreground)` form the picker now writes. Data only; no schema change.
UPDATE "announcements"
SET "content" = regexp_replace("content", 'hsl\(var\((--[a-z0-9-]+)\)\)', 'var(\1)', 'g')
WHERE "content" LIKE '%hsl(var(--%';
