-- Adds a creation timestamp to quest instance objectives so their display order can be made
-- deterministic (ordered by created_at, then id) instead of relying on the unstable physical row
-- order Postgres returns after an update.
-- NOTE: hand-authored (no DB in the environment). Regenerate/verify with
-- `prisma migrate dev` against a database before release.

-- AlterTable
ALTER TABLE "quest_instance_objectives" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
