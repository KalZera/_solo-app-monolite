-- AlterTable
ALTER TABLE "characters_rest_points" ADD CONSTRAINT "characters_rest_points_character_id_key" UNIQUE ("character_id");

-- AlterTable
ALTER TABLE "quests" ADD COLUMN     "category_id" TEXT;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "quest_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
