-- Converts quests.active from a boolean into the QuestActiveStatus enum (ACTIVE/COMPLETED/CANCELLED).
-- Existing rows are mapped true → ACTIVE and false → CANCELLED (an inactive template was a stopped
-- recurrence). Going forward the deadline job sets COMPLETED and the recurrence endpoint sets CANCELLED.
-- NOTE: hand-authored (no DB in the environment). Regenerate/verify with
-- `prisma migrate dev` against a database before release.

-- CreateEnum
CREATE TYPE "QuestActiveStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "quests" ALTER COLUMN "active" DROP DEFAULT;
ALTER TABLE "quests"
  ALTER COLUMN "active" TYPE "QuestActiveStatus"
  USING (CASE WHEN "active" THEN 'ACTIVE'::"QuestActiveStatus" ELSE 'CANCELLED'::"QuestActiveStatus" END);
ALTER TABLE "quests" ALTER COLUMN "active" SET DEFAULT 'ACTIVE';
