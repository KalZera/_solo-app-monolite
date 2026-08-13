-- Per-user flag tracking whether the Hunter has already seen the "how to use this MVP" tutorial
-- sheet. Defaults to false so existing users are shown it once on their next visit; the frontend
-- flips it to true via PATCH /api/v1/identity/tutorial when the tutorial is dismissed/finished.
-- NOTE: hand-authored (no DB in the environment). Regenerate/verify with
-- `prisma migrate dev` against a database before release.

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_complete_tutorial" BOOLEAN NOT NULL DEFAULT false;
