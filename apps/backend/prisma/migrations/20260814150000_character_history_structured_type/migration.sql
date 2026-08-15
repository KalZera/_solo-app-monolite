-- Replaces character_history.description (a fixed-Portuguese rendered sentence) with a
-- structured `type` + `payload` pair, so the frontend can render each entry translated via i18n
-- instead of displaying backend-baked Portuguese text regardless of the Hunter's language.
-- character_history is a display-only derived cache — the source event data is already persisted
-- verbatim in the `events` table (see character-history-plugin.ts) — so existing rows are safely
-- discarded rather than backfilled with a guessed type.
-- NOTE: hand-authored (no DB in the environment). Regenerate/verify with
-- `prisma migrate dev` against a database before release.

-- CreateEnum
CREATE TYPE "CharacterHistoryEntryType" AS ENUM ('QUEST_COMPLETED', 'QUEST_FAILED', 'QUEST_EXPIRED', 'LEVEL_UP', 'ATTRIBUTE_POINTS_GRANTED', 'ATTRIBUTE_POINT_ALLOCATED');

TRUNCATE TABLE "character_history";

-- AlterTable
ALTER TABLE "character_history" DROP COLUMN "description";
ALTER TABLE "character_history" ADD COLUMN "type" "CharacterHistoryEntryType" NOT NULL;
ALTER TABLE "character_history" ADD COLUMN "payload" JSONB NOT NULL DEFAULT '{}';
