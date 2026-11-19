-- Studio (CL-03): caption size is part of a clip version ("make captions bigger").
ALTER TABLE "clip_projects" ADD COLUMN "caption_size" INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "clip_projects" ADD CONSTRAINT "clip_projects_caption_size_check" CHECK ("caption_size" BETWEEN 80 AND 140);
