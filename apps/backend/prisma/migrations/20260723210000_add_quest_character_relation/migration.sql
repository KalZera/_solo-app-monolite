/*
  Warnings:

  - Added the required column `character_id` to the `quests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `quests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "quests" ADD COLUMN     "character_id" TEXT NOT NULL,
ADD COLUMN     "category" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
