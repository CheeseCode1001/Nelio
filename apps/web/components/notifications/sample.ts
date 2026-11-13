import type { NotificationRow } from "@/lib/notifications";

/** The NT-01 boards' sample notifications, for design previews only. */
export const PREVIEW_NOTIFICATIONS: NotificationRow[] = [
  { id: "n1", title: "Chioma approved Instagram for “5 budgeting myths”", body: "Acme Foods · YouTube still needs changes", href: null, unread: true, ago: "2m", icon: "check", tone: "ok" },
  { id: "n2", title: "Render finished: “Stop budgeting like this”", body: "Ready to review", href: null, unread: true, ago: "10m", icon: "film", tone: "lime" },
  { id: "n3", title: "Chef Kemi’s license ends in 5 days", body: "4 drafts use it", href: null, unread: true, ago: "1h", icon: "shield", tone: "blue" },
  { id: "n4", title: "80% of this week’s budget used", body: "Budget Shorts · 240 of 300 credits", href: null, unread: false, ago: "3h", icon: "wallet", tone: "warn" },
  { id: "n5", title: "YouTube upload failed", body: "Daily upload limit reached. Retry after 00:00 UTC.", href: null, unread: false, ago: "5h", icon: "x", tone: "err" },
  { id: "n6", title: "New sign-in from Chrome on Windows", body: "Lagos, Nigeria · wasn’t you? Secure your account", href: null, unread: false, ago: "1d", icon: "search", tone: "ai" },
];
