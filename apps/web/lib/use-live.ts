"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "./supabase/browser";

export type LiveStatus = "connecting" | "live" | "reconnecting" | "synced" | "off";

/**
 * Listens to one private realtime channel ("ws:<workspace>" or "user:<id>"). The database only lets a person
 * join channels they may see. `onEvent` runs for each broadcast; after a dropped connection comes back the
 * status is "synced" for a moment and `onEvent` runs once so the page re-reads what it missed.
 */
export function useLive(topic: string | null, event: string, onEvent: (payload: unknown) => void): LiveStatus {
  const [status, setStatus] = useState<LiveStatus>(topic ? "connecting" : "off");
  const handler = useRef(onEvent);
  useEffect(() => {
    handler.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const sb = topic ? supabaseBrowser() : null;
    if (!sb || !topic) return;
    let dropped = false;
    let syncedTimer: ReturnType<typeof setTimeout> | undefined;
    let channel: ReturnType<typeof sb.channel> | null = null;
    let cancelled = false;
    void (async () => {
      const { data } = await sb.auth.getSession();
      if (cancelled) return;
      if (data.session) await sb.realtime.setAuth(data.session.access_token);
      channel = sb
        .channel(topic, { config: { private: true } })
        .on("broadcast", { event }, (msg) => handler.current(msg.payload))
        .subscribe((s) => {
          if (s === "SUBSCRIBED") {
            if (dropped) {
              dropped = false;
              setStatus("synced");
              handler.current(null);
              syncedTimer = setTimeout(() => setStatus("live"), 2500);
            } else setStatus("live");
          } else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT" || s === "CLOSED") {
            dropped = true;
            setStatus("reconnecting");
          }
        });
    })();
    return () => {
      cancelled = true;
      clearTimeout(syncedTimer);
      if (channel) void sb.removeChannel(channel);
    };
  }, [topic, event]);

  return status;
}
