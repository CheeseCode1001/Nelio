import type { MetadataRoute } from "next";

/** Web app manifest for the installable PWA (D-02). Opens straight into the signed-in person's home. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Nelio",
    short_name: "Nelio",
    description: "Your AI content team, under your control.",
    start_url: "/auth/continue",
    scope: "/",
    display: "standalone",
    background_color: "#F4F6FB",
    theme_color: "#F4F6FB",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
