-- CreateTable
CREATE TABLE "characters_rest_points" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "rest_points" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_rest_points_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "characters_rest_points" ADD CONSTRAINT "characters_rest_points_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
