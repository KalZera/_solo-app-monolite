-- Quest: switch the NONE-recurrence deadline from a duration ("deadline_days") to an
-- explicit last-day date ("deadline_date"), simpler to reason about and to set from a
-- client date picker. The actual deadline instant is still always computed as 23:59:59.999
-- GMT-3 of that day (see NoneStrategy.periodEnd).
-- NOTE: hand-authored (no DB in the environment). Regenerate/verify with
-- `prisma migrate dev` against a database before release.

-- AlterTable
ALTER TABLE "quests" DROP COLUMN "deadline_days";
ALTER TABLE "quests" ADD COLUMN "deadline_date" TIMESTAMP(3);
