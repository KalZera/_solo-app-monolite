-- Renames the character's 5th attribute column from `luck` to `perception`. The attribute now
-- models the Hunter's social/behavioural awareness ("Perception/Sense"), not chance — the value
-- and its semantics as an allocatable stat are unchanged, only the name. A rename (not drop+add)
-- preserves every Hunter's existing points.
-- NOTE: hand-authored (no DB in the environment). Regenerate/verify with
-- `prisma migrate dev` against a database before release.

-- AlterTable
ALTER TABLE "characters" RENAME COLUMN "luck" TO "perception";
