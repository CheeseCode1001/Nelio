"use client";

import { GooeyToaster, gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import { useEffect, useState } from "react";
import { playSound } from "@/lib/sound";

/**
 * Gooey toasts (Delight board): a pill that grows into a blob when there is more to say. Desktop top right
 * under the header, mobile top and full width; at most three visible. Success and info last 4 s, warnings
 * 6 s, errors stay until dismissed or acted on. Each toast plays its interface sound.
 */
export function Toaster() {
  const [mobile, setMobile] = useState(false);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(max-width: 767px)");
    const read = () => {
      setMobile(mq.matches);
      setDark(document.documentElement.dataset.theme === "dark");
    };
    read();
    mq.addEventListener("change", read);
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      mq.removeEventListener("change", read);
      obs.disconnect();
    };
  }, []);
  return <GooeyToaster position={mobile ? "top-center" : "top-right"} offset={mobile ? 12 : 76} visibleToasts={3} theme={dark ? "dark" : "light"} closeOnEscape swipeToDismiss showTimestamp />;
}

type Action = { label: string; onClick: () => void };
type Opts = { description?: string; action?: Action; id?: string | number };

const FILL = () => (typeof document !== "undefined" && document.documentElement.dataset.theme === "dark" ? "#1A1A1A" : "#FFFFFF");

/** App-wide toasts with Nelio timings and sounds. */
export const toast = {
  success(title: string, o: Opts = {}) {
    playSound("success");
    return gooeyToast.success(title, { description: o.description, action: o.action, id: o.id, duration: 4000, fillColor: FILL() });
  },
  info(title: string, o: Opts = {}) {
    playSound("pop");
    return gooeyToast.info(title, { description: o.description, action: o.action, id: o.id, duration: 4000, fillColor: FILL() });
  },
  warning(title: string, o: Opts = {}) {
    playSound("pop");
    return gooeyToast.warning(title, { description: o.description, action: o.action, id: o.id, duration: 6000, fillColor: FILL() });
  },
  error(title: string, o: Opts = {}) {
    playSound("error");
    return gooeyToast.error(title, { description: o.description, action: o.action, id: o.id, duration: Infinity, fillColor: FILL() });
  },
  dismiss(id?: string | number) {
    gooeyToast.dismiss(id);
  },
};
