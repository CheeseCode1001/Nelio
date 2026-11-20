-- Poster frame and probe time for creator videos (marketplace cards, LI-01 and LI-02).
ALTER TABLE "creator_videos" ADD COLUMN "poster_key" TEXT, ADD COLUMN "checked_at" TIMESTAMPTZ(6);
CREATE INDEX "creator_videos_unchecked_idx" ON "creator_videos"("created_at") WHERE "status" = 'ready' AND "checked_at" IS NULL;
