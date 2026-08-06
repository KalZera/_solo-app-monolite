-- QuestInstanceObjective: revert the "status" enum back to the boolean "completed" flag
-- (preferred simpler shape). Reverts migration 20260806110000_quest_instance_objective_status.
-- NOTE: hand-authored (no DB in the environment). Regenerate/verify with
-- `prisma migrate dev` against a database before release.

-- AlterTable: add the column back, backfill it from "status", then drop "status" + its enum.
ALTER TABLE "quest_instance_objectives" ADD COLUMN "completed" BOOLEAN NOT NULL DEFAULT false;

UPDATE "quest_instance_objectives"
SET "completed" = ("status" = 'COMPLETED');

ALTER TABLE "quest_instance_objectives" DROP COLUMN "status";

-- DropEnum
DROP TYPE "QuestObjectiveStatus";
