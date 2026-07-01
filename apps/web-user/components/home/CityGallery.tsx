"use client";

import { useRouter } from "next/navigation";
import CircularGallery from "./CircularGallery";

interface CityGalleryItem {
  image: string;
  text: string;
  href: string;
}

/**
 * CircularGallery wrapper — click'da `/hotels?city=...` ga yo'naltiradi.
 * "use client" bu yerda, CircularGallery ham client.
 */
export function CityGallery({
  items,
  ...props
}: {
  items: CityGalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  fontUrl?: string;
  scrollSpeed?: number;
}) {
  const router = useRouter();

  function handleItemClick(index: number) {
    const item = items[index];
    if (item?.href) router.push(item.href);
  }

  return (
    <CircularGallery
      items={items}
      onItemClick={handleItemClick}
      {...props}
    />
  );
}
