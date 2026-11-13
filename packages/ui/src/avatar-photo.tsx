import { photoSrc, type PhotoKey } from "./photos";

/** Round creator photo with an ink ring (generator `avatar_photo`). Decorative. */
export function AvatarPhoto({ photo, size = 72, ring = "#FFD43B" }: { photo: PhotoKey; size?: number; ring?: string }) {
  return (
    <span className="relative inline-block flex-none overflow-hidden rounded-full border-[3px] border-outline" style={{ width: size, height: size, background: ring }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- small decorative crop */}
      <img src={photoSrc(photo)} alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover object-[center_top]" />
    </span>
  );
}
