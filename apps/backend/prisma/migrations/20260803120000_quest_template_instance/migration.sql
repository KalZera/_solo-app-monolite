-- Quest domain: Template + Instance refactor (destructive; no production data to preserve).
-- NOTE: hand-authored to mirror Prisma conventions and validated offline (no DB in the
-- environment). Regenerate/verify with `prisma migrate dev` against a database before release.

-- CreateEnum
CREATE TYPE "Recurrence" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM');
CREATE TYPE "QuestInstanceStatus" AS ENUM ('PENDING', 'STARTED', 'COMPLETED', 'FAILED', 'EXPIRED');

-- DropTable (old execution-as-quest objectives)
DROP TABLE "quest_objectives";

-- AlterTable: turn `quests` into a template (drops the execution columns; `quests_status_idx`
-- is removed automatically with the `status` column).
ALTER TABLE "quests"
  DROP COLUMN "type",
  DROP COLUMN "status",
  DROP COLUMN "quest_rank",
  DROP COLUMN "reward_gold",
  DROP COLUMN "min_level",
  DROP COLUMN "expires_at",
  DROP COLUMN "completed_at",
  ADD COLUMN "recurrence" "Recurrence" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "rank" TEXT NOT NULL DEFAULT 'E',
  ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- `rank` has no default in the schema; drop the transitional default to avoid drift.
ALTER TABLE "quests" ALTER COLUMN "rank" DROP DEFAULT;

-- CreateTable
CREATE TABLE "quest_objective_templates" (
    "id" TEXT NOT NULL,
    "quest_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    CONSTRAINT "quest_objective_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quest_instances" (
    "id" TEXT NOT NULL,
    "quest_id" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "deadline" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" "QuestInstanceStatus" NOT NULL DEFAULT 'PENDING',
    "reward_granted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "quest_instances_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quest_instance_objectives" (
    "id" TEXT NOT NULL,
    "quest_instance_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "quest_instance_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quest_objective_templates_quest_id_idx" ON "quest_objective_templates"("quest_id");
CREATE UNIQUE INDEX "quest_instances_quest_id_scheduled_date_key" ON "quest_instances"("quest_id", "scheduled_date");
CREATE INDEX "quest_instances_status_idx" ON "quest_instances"("status");
CREATE INDEX "quest_instance_objectives_quest_instance_id_idx" ON "quest_instance_objectives"("quest_instance_id");

-- AddForeignKey
ALTER TABLE "quest_objective_templates" ADD CONSTRAINT "quest_objective_templates_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quest_instances" ADD CONSTRAINT "quest_instances_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quest_instance_objectives" ADD CONSTRAINT "quest_instance_objectives_quest_instance_id_fkey" FOREIGN KEY ("quest_instance_id") REFERENCES "quest_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
