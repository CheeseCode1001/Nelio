-- The owner is asked while the file uploads (CL-02); it is required before processing starts, never later.
ALTER TABLE "media_assets" ALTER COLUMN "rights" DROP NOT NULL;
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_rights_before_processing"
  CHECK ("rights" IS NOT NULL OR "status" IN ('uploading', 'uploaded', 'failed'));
