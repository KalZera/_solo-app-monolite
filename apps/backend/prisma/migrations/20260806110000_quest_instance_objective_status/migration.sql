-- QuestInstanceObjective: replace the boolean "completed" flag with an explicit "status"
-- field, deliberately restricted to two states (PENDING/COMPLETED) — mirrors the instance's
-- own status pattern while keeping the objective model simple.
-- NOTE: hand-authored (no DB in the environment). Regenerate/verify with
-- `prisma migrate dev` against a database before release.

-- CreateEnum
CREATE TYPE "QuestObjectiveStatus" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable: add the new column, backfill it from "completed", then drop "completed".
ALTER TABLE "quest_instance_objectives" ADD COLUMN "status" "QuestObjectiveStatus" NOT NULL DEFAULT 'PENDING';

UPDATE "quest_instance_objectives"
SET "status" = CASE WHEN "completed" THEN 'COMPLETED' ELSE 'PENDING' END::"QuestObjectiveStatus";

ALTER TABLE "quest_instance_objectives" DROP COLUMN "completed";
