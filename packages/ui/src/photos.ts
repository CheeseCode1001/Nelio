export type PhotoKey = "p1" | "p2" | "p3" | "p4" | "p5" | "p6" | "p7" | "p8" | "p9" | "p10";

/** File names in docs/design/E_hifi/photos (shipped from /photos until the CDN exists). */
export const PHOTO_FILES: Record<PhotoKey, string> = {
  p1: "p1-host-glasses.jpg", p2: "p2-host-books.jpg", p3: "p3-host-cap.jpg", p4: "p4-host-beard.jpg", p5: "p5-host-dark.jpg",
  p6: "p6-host-sofa.jpg", p7: "p7-host-blue.jpg", p8: "p8-host-blonde.jpg", p9: "p9-host-wide.jpg", p10: "p10-host-green.jpg",
};
export const photoSrc = (k: PhotoKey, base = "/photos") => `${base}/${PHOTO_FILES[k]}`;
