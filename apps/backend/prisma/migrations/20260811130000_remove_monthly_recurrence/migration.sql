-- Recurrence: MONTHLY dropped (feature removed). Postgres has no `ALTER TYPE ... DROP VALUE`,
-- so the enum type must be recreated. Any pre-existing MONTHLY quests are downgraded to
-- WEEKLY (closest supported cadence) before the type is narrowed.
-- NOTE: hand-authored (no DB in the environment). Regenerate/verify with
-- `prisma migrate dev` against a database before release.

BEGIN;

UPDATE "quests" SET "recurrence" = 'WEEKLY' WHERE "recurrence" = 'MONTHLY';

CREATE TYPE "Recurrence_new" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'CUSTOM');
ALTER TABLE "quests" ALTER COLUMN "recurrence" DROP DEFAULT;
ALTER TABLE "quests" ALTER COLUMN "recurrence" TYPE "Recurrence_new" USING ("recurrence"::text::"Recurrence_new");
ALTER TABLE "quests" ALTER COLUMN "recurrence" SET DEFAULT 'NONE';
DROP TYPE "Recurrence";
ALTER TYPE "Recurrence_new" RENAME TO "Recurrence";

COMMIT;
