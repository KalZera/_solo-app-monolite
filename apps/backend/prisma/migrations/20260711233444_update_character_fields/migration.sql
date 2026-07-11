/*
  Warnings:

  - Added the required column `title` to the `characters` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "characters" ADD COLUMN     "power_score" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "strength" SET DEFAULT 1,
ALTER COLUMN "intelligence" SET DEFAULT 1,
ALTER COLUMN "agility" SET DEFAULT 1,
ALTER COLUMN "vitality" SET DEFAULT 1,
ALTER COLUMN "luck" SET DEFAULT 1;

-- CreateTable
CREATE TABLE "character_history" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "character_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "character_history" ADD CONSTRAINT "character_history_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
