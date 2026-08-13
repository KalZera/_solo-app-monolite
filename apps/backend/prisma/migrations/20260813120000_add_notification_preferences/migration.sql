-- One row per user, gating which notification types/channels they want to receive. Needed
-- by NotificationRepository.getPreferences/savePreferences (previously stubbed — see
-- prisma-notification.repository.ts).
-- NOTE: hand-authored (no DB in the environment). Regenerate/verify with
-- `prisma migrate dev` against a database before release.

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "push_enabled" BOOLEAN NOT NULL DEFAULT true,
    "email_enabled" BOOLEAN NOT NULL DEFAULT false,
    "whatsapp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "quest_reminder" BOOLEAN NOT NULL DEFAULT true,
    "quest_expired" BOOLEAN NOT NULL DEFAULT true,
    "level_up" BOOLEAN NOT NULL DEFAULT true,
    "rank_up" BOOLEAN NOT NULL DEFAULT true,
    "penalty" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
