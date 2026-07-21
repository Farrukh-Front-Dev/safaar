/**
 * OpenStreetMap Nominatim orqali manzil qidiruvi (geocoding).
 * API kalit shart emas — bepul, lekin oqilona foydalanish talab qilinadi
 * (debounce bilan chaqiriladi, natija soni cheklangan).
 */

export interface GeocodeResult {
  label: string;
  lat: number;
  lon: number;
}

export async function searchAddress(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    q,
  )}&limit=5&countrycodes=uz&accept-language=uz`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Qidiruvda xatolik yuz berdi");

  const data: Array<{ display_name: string; lat: string; lon: string }> =
    await res.json();

  return data.map((d) => ({
    label: d.display_name,
    lat: Number(d.lat),
    lon: Number(d.lon),
  }));
}
