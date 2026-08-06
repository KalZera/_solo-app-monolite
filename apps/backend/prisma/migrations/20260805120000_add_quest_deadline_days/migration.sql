-- Quest: every quest expires, regardless of recurrence (business_rules.md, ADR-004 addendum).
-- DAILY/WEEKLY/MONTHLY already derive their deadline from the period; this adds a
-- configurable deadline (in days from creation) for NONE (single-instance) quests. Null
-- means the NoneStrategy default (28 days) applies.
-- NOTE: hand-authored (no DB in the environment). Regenerate/verify with
-- `prisma migrate dev` against a database before release.

-- AlterTable
ALTER TABLE "quests" ADD COLUMN "deadline_days" INTEGER;
