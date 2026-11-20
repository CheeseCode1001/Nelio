-- Batch variants (CL-04): the generated set lives on the clip; each render keeps the exact settings it used.
ALTER TABLE "clip_projects" ADD COLUMN "variants" JSONB;
ALTER TABLE "renders" ADD COLUMN "settings" JSONB;
