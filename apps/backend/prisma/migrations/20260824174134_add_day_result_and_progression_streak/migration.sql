-- CreateEnum
CREATE TYPE "DayResultStatus" AS ENUM ('FAILED', 'COMPLETED', 'FREE', 'FREE_COMPLETED');

-- CreateTable
CREATE TABLE "day_results" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "DayResultStatus" NOT NULL,
    "streak_before" INTEGER NOT NULL,
    "streak_after" INTEGER NOT NULL,
    "freeze_before" INTEGER NOT NULL,
    "freeze_after" INTEGER NOT NULL,
    "freeze_used" BOOLEAN NOT NULL,

    CONSTRAINT "day_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progression_streaks" (
    "id" SERIAL NOT NULL,
    "character_id" TEXT NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "best_streak" INTEGER NOT NULL DEFAULT 0,
    "freeze_balance" INTEGER NOT NULL DEFAULT 0,
    "days_until_freeze_recovery" INTEGER NOT NULL DEFAULT 7,
    "last_evaluated_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progression_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "day_results_date_character_id_key" ON "day_results"("date", "character_id");

-- CreateIndex
CREATE UNIQUE INDEX "progression_streaks_character_id_key" ON "progression_streaks"("character_id");

-- AddForeignKey
ALTER TABLE "day_results" ADD CONSTRAINT "day_results_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progression_streaks" ADD CONSTRAINT "progression_streaks_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
