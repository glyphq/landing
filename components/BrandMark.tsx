import Image from "next/image";

export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <Image
        className="brand-mark-image"
        src="/brand/glyph-mark.png"
        alt=""
        width={256}
        height={256}
        decoding="async"
        unoptimized
      />
    </span>
  );
}
