-- Add ON DELETE CASCADE to Character/User children so deleting a character (or user)
-- no longer fails with a foreign-key violation. Also adds indexes on frequently
-- filtered/joined foreign keys.

-- DropForeignKey
ALTER TABLE "characters" DROP CONSTRAINT "characters_user_id_fkey";
-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "characters_rest_points" DROP CONSTRAINT "characters_rest_points_character_id_fkey";
-- AddForeignKey
ALTER TABLE "characters_rest_points" ADD CONSTRAINT "characters_rest_points_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "character_history" DROP CONSTRAINT "character_history_character_id_fkey";
-- AddForeignKey
ALTER TABLE "character_history" ADD CONSTRAINT "character_history_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "quest_categories" DROP CONSTRAINT "quest_categories_created_by_fkey";
-- AddForeignKey
ALTER TABLE "quest_categories" ADD CONSTRAINT "quest_categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "quests" DROP CONSTRAINT "quests_character_id_fkey";
-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "quest_objectives" DROP CONSTRAINT "quest_objectives_quest_id_fkey";
-- AddForeignKey
ALTER TABLE "quest_objectives" ADD CONSTRAINT "quest_objectives_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "progressions" DROP CONSTRAINT "progressions_character_id_fkey";
-- AddForeignKey
ALTER TABLE "progressions" ADD CONSTRAINT "progressions_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "rewards" DROP CONSTRAINT "rewards_character_id_fkey";
-- AddForeignKey
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";
-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "quests_character_id_idx" ON "quests"("character_id");
CREATE INDEX "quests_status_idx" ON "quests"("status");
CREATE INDEX "quest_objectives_quest_id_idx" ON "quest_objectives"("quest_id");
CREATE INDEX "rewards_character_id_idx" ON "rewards"("character_id");
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");
