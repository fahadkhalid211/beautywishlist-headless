"use client";

import Image from "next/image";
import { useState } from "react";

export default function Gallery({ images, alt }: { images: any[]; alt: string }) {
  const [active, setActive] = useState(0);
  const image = images[active];

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        {images.slice(0, 5).map((img, i) => (
          <button
            key={img.id ?? i}
            onClick={() => setActive(i)}
            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${i === active ? "border-purple-600" : "border-transparent"}`}
          >
            <Image src={img.src} alt={img.alt || alt} fill className="object-cover" sizes="64px" />
          </button>
        ))}
      </div>
      <div className="relative aspect-square flex-1 overflow-hidden rounded-3xl bg-purple-50">
        {image && (
          <Image src={image.src} alt={image.alt || alt} fill priority sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
        )}
      </div>
    </div>
  );
}