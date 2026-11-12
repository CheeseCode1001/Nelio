-- The migration tool keeps its history in public._prisma_migrations. Lock it like every other table:
-- row-level security on, no policies, no privileges for the browser roles.
DO $$
DECLARE r text;
BEGIN
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
    FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
        EXECUTE format('REVOKE ALL ON public."_prisma_migrations" FROM %I', r);
      END IF;
    END LOOP;
  END IF;
END $$;
