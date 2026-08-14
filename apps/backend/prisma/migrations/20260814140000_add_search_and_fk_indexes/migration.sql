-- Adds the foreign-key indexes Postgres does not create automatically, plus composite search
-- indexes for the app's hot query paths (date-ordered feeds, the recurrence materialisation and
-- expiration scans). Two single-column indexes are replaced by composites that supersede them.
-- NOTE: hand-authored (no DB in the environment). Regenerate/verify with
-- `prisma migrate dev` against a database before release.

-- ─── Foreign-key indexes ─────────────────────────────────────────────────────
-- CreateIndex
CREATE INDEX "characters_user_id_idx" ON "characters"("user_id");

-- CreateIndex
CREATE INDEX "quest_categories_created_by_idx" ON "quest_categories"("created_by");

-- CreateIndex
CREATE INDEX "quests_category_id_idx" ON "quests"("category_id");

-- ─── Search indexes ──────────────────────────────────────────────────────────
-- CreateIndex: paginated, date-ordered history feed (WHERE character_id ORDER BY created_at DESC).
CREATE INDEX "character_history_character_id_created_at_idx" ON "character_history"("character_id", "created_at");

-- CreateIndex: recurrence materialisation / deadline jobs filter templates by status.
CREATE INDEX "quests_active_idx" ON "quests"("active");

-- CreateIndex: expiration scan (WHERE status IN (...) AND deadline < now); supersedes the status-only index.
DROP INDEX "quest_instances_status_idx";
CREATE INDEX "quest_instances_status_deadline_idx" ON "quest_instances"("status", "deadline");

-- CreateIndex: date-ordered notification feed; supersedes the user_id-only index.
DROP INDEX "notifications_user_id_idx";
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");
