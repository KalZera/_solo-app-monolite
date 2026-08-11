-- Quest/QuestInstance: deadline is now mandatory — a Quest template and its instances must
-- always have one (application code already guarantees this on create: CreateQuestUseCase
-- defaults to "tomorrow" when the client omits deadlineDate, and RecurrenceEngine always
-- derives an instance deadline from the period). Backfill any pre-existing NULLs before
-- enforcing NOT NULL.
-- NOTE: hand-authored (no DB in the environment). Regenerate/verify with
-- `prisma migrate dev` against a database before release.

-- Backfill: quests without a deadline_date fall back to the old NoneStrategy default window
-- (28 days from creation).
UPDATE "quests"
SET "deadline_date" = "created_at" + INTERVAL '28 days'
WHERE "deadline_date" IS NULL;

-- Backfill: instances without a deadline fall back to 24h after their scheduled_date (the
-- DAILY/NONE span — the safest generic default for whatever recurrence they belong to).
UPDATE "quest_instances"
SET "deadline" = "scheduled_date" + INTERVAL '1 day'
WHERE "deadline" IS NULL;

-- AlterTable
ALTER TABLE "quests" ALTER COLUMN "deadline_date" SET NOT NULL;
ALTER TABLE "quest_instances" ALTER COLUMN "deadline" SET NOT NULL;
