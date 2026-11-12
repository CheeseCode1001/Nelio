-- Integrity and isolation checks for the schema. Run after applying all migrations:
--   psql "$DB" -v ON_ERROR_STOP=1 -q -t -A -f packages/db/tests/integrity.sql
-- Prints one row per check: n|name|pass|detail. Every fixture is rolled back; nothing is left behind.
-- First run against the hosted dev database on 12 Nov 2026: 14 of 14 passed.

DROP TABLE IF EXISTS pg_temp.t_results;
CREATE TEMP TABLE t_results(n int, name text, pass boolean, detail text);

DO $$
DECLARE
  res jsonb := '[]'::jsonb;
  u1 uuid := gen_random_uuid(); u2 uuid := gen_random_uuid();
  oa uuid; ob uuid; wa uuid; wb uuid; ok boolean; msg text;
BEGIN
  BEGIN
    INSERT INTO public.users(id,email,full_name,updated_at) VALUES (u1,'t1@test.invalid','T One',now()),(u2,'T2@Test.invalid','T Two',now());
    INSERT INTO public.organizations(name,slug,account_type,updated_at) VALUES ('Org A','zz-test-org-a','agency',now()) RETURNING id INTO oa;
    INSERT INTO public.organizations(name,slug,account_type,updated_at) VALUES ('Org B','zz-test-org-b','agency',now()) RETURNING id INTO ob;
    INSERT INTO public.workspaces(org_id,name,slug,updated_at) VALUES (oa,'WA','zz-test-wa',now()) RETURNING id INTO wa;
    INSERT INTO public.workspaces(org_id,name,slug,updated_at) VALUES (ob,'WB','zz-test-wb',now()) RETURNING id INTO wb;
    INSERT INTO public.organization_memberships(org_id,user_id,role) VALUES (oa,u1,'owner');

    ok := false; BEGIN INSERT INTO public.workspace_memberships(workspace_id,org_id,user_id,role) VALUES (wa,ob,u2,'editor'); EXCEPTION WHEN foreign_key_violation THEN ok := true; END;
    res := res || jsonb_build_object('n',1,'name','workspace membership with mismatched org rejected','pass',ok);

    ok := false; BEGIN INSERT INTO public.organization_memberships(org_id,user_id,role) VALUES (oa,u2,'owner'); EXCEPTION WHEN unique_violation THEN ok := true; END;
    res := res || jsonb_build_object('n',2,'name','second owner in one organization rejected','pass',ok);

    INSERT INTO public.workspace_memberships(workspace_id,org_id,user_id,role) VALUES (wa,oa,u2,'editor');
    ok := false; BEGIN INSERT INTO public.workspace_memberships(workspace_id,org_id,user_id,role) VALUES (wa,oa,u2,'viewer'); EXCEPTION WHEN unique_violation THEN ok := true; END;
    res := res || jsonb_build_object('n',3,'name','duplicate workspace membership rejected','pass',ok);

    ok := false; BEGIN INSERT INTO public.users(id,email,full_name,updated_at) VALUES (gen_random_uuid(),'t2@test.INVALID','Dup',now()); EXCEPTION WHEN unique_violation THEN ok := true; END;
    res := res || jsonb_build_object('n',4,'name','email unique regardless of case','pass',ok);

    ok := false; BEGIN INSERT INTO public.invitations(org_id,email,token_hash,invited_by_user_id,expires_at) VALUES (oa,'x@test.invalid','h1',u1,now()+interval '7 days'); EXCEPTION WHEN check_violation THEN ok := true; END;
    res := res || jsonb_build_object('n',5,'name','invitation without a role rejected','pass',ok);

    ok := false; BEGIN INSERT INTO public.invitations(org_id,workspace_id,email,org_role,workspace_role,token_hash,invited_by_user_id,expires_at) VALUES (oa,wa,'x@test.invalid','admin','editor','h2',u1,now()+interval '7 days'); EXCEPTION WHEN check_violation THEN ok := true; END;
    res := res || jsonb_build_object('n',6,'name','invitation with both role kinds rejected','pass',ok);

    ok := false; BEGIN INSERT INTO public.invitations(org_id,workspace_id,email,workspace_role,token_hash,invited_by_user_id,expires_at) VALUES (oa,wb,'x@test.invalid','client_approver','h3',u1,now()+interval '7 days'); EXCEPTION WHEN foreign_key_violation THEN ok := true; END;
    res := res || jsonb_build_object('n',7,'name','invitation to another organization''s workspace rejected','pass',ok);

    INSERT INTO public.audit_events(org_id,actor_user_id,action) VALUES (oa,u1,'test.event');
    ok := false; BEGIN UPDATE public.audit_events SET action='tampered' WHERE org_id=oa; EXCEPTION WHEN insufficient_privilege THEN ok := true; END;
    res := res || jsonb_build_object('n',8,'name','audit event UPDATE rejected','pass',ok);
    ok := false; BEGIN DELETE FROM public.audit_events WHERE org_id=oa; EXCEPTION WHEN insufficient_privilege THEN ok := true; END;
    res := res || jsonb_build_object('n',9,'name','audit event DELETE rejected','pass',ok);

    ok := false; BEGIN SET LOCAL ROLE anon; PERFORM 1 FROM public.workspaces; RESET ROLE; EXCEPTION WHEN insufficient_privilege THEN ok := true; RESET ROLE; END;
    res := res || jsonb_build_object('n',10,'name','anon role cannot select workspaces','pass',ok);
    ok := false; BEGIN SET LOCAL ROLE authenticated; INSERT INTO public.workspace_memberships(workspace_id,org_id,user_id,role) VALUES (wb,ob,u2,'manager'); RESET ROLE; EXCEPTION WHEN insufficient_privilege THEN ok := true; RESET ROLE; END;
    res := res || jsonb_build_object('n',11,'name','authenticated role cannot grant itself a membership','pass',ok);

    RAISE EXCEPTION 'rollback-fixtures';
  EXCEPTION WHEN raise_exception THEN
    GET STACKED DIAGNOSTICS msg = MESSAGE_TEXT;
    IF msg <> 'rollback-fixtures' THEN res := res || jsonb_build_object('n',99,'name','unexpected error','pass',false,'detail',msg); END IF;
  END;

  INSERT INTO t_results SELECT (e->>'n')::int, e->>'name', (e->>'pass')::boolean, e->>'detail' FROM jsonb_array_elements(res) e;
  INSERT INTO t_results SELECT 12, 'fixtures rolled back (no test rows left)',
    NOT EXISTS (SELECT 1 FROM public.organizations WHERE slug LIKE 'zz-test-%')
    AND NOT EXISTS (SELECT 1 FROM public.users WHERE email LIKE '%@test.invalid')
    AND NOT EXISTS (SELECT 1 FROM public.audit_events WHERE action='test.event'), NULL;
  INSERT INTO t_results SELECT 13, 'RLS enabled on all ' || count(*) || ' public tables', bool_and(c.relrowsecurity), string_agg(c.relname, ',') FILTER (WHERE NOT c.relrowsecurity)
    FROM pg_class c JOIN pg_namespace ns ON ns.oid=c.relnamespace WHERE ns.nspname='public' AND c.relkind='r';
  INSERT INTO t_results SELECT 14, 'anon and authenticated hold no table privileges',
    NOT EXISTS (SELECT 1 FROM information_schema.role_table_grants WHERE table_schema='public' AND grantee IN ('anon','authenticated')), NULL;
END $$;

SELECT n, name, pass, coalesce(detail, '') FROM t_results ORDER BY n;
