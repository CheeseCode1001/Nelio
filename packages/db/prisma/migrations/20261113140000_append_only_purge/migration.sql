-- Append-only tables still have to disappear when their workspace or person is erased (data deletion,
-- privacy requests). Deletes are allowed only inside a transaction that sets nelio.allow_purge = 'on'
-- (SET LOCAL), which only the deletion workflow and tests do. Updates stay forbidden.
CREATE OR REPLACE FUNCTION "append_only"() RETURNS trigger
  LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'DELETE' AND current_setting('nelio.allow_purge', true) = 'on' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION '% is append-only', TG_TABLE_NAME USING ERRCODE = 'insufficient_privilege';
END;
$$;

CREATE OR REPLACE FUNCTION "agent_authorizations_revoke_only"() RETURNS trigger
  LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF current_setting('nelio.allow_purge', true) = 'on' THEN
      RETURN OLD;
    END IF;
    RAISE EXCEPTION 'agent_authorizations is append-only' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF OLD."revoked_at" IS NOT NULL OR NEW."revoked_at" IS NULL
     OR (to_jsonb(NEW) - 'revoked_at') IS DISTINCT FROM (to_jsonb(OLD) - 'revoked_at') THEN
    RAISE EXCEPTION 'an authorization can only be revoked, once' USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN NEW;
END;
$$;
