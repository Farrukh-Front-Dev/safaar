import { TODAY_ISO } from "./data";

/** Oxirgi 30 kunlik daromad dinamikasi (so'm). */
export function buildRevenueSeries(): Array<{
  date: string;
  revenue: number;
  bookings: number;
}> {
  const result: Array<{ date: string; revenue: number; bookings: number }> = [];
  const base = new Date(TODAY_ISO);
  // Deterministik pseudorandom — bir xil bo'lsin
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 29; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    // Dam olish kunlari ko'proq
    const boost = dow === 5 || dow === 6 ? 1.5 : dow === 0 ? 1.3 : 1;
    const bookings = Math.round((3 + rand() * 10) * boost);
    const revenue = bookings * (400_000 + Math.round(rand() * 200_000));
    result.push({
      date: d.toISOString().slice(0, 10),
      revenue,
      bookings,
    });
  }
  return result;
}

/** Bron manbai bo'yicha taqsimot (30 kun). */
export const mockSourceDistribution = [
  { name: "UzBron", value: 145, color: "#1d4ed8" },
  { name: "Walk-in", value: 42, color: "#10b981" },
  { name: "Telefon", value: 68, color: "#64748b" },
  { name: "Booking.com", value: 21, color: "#7c3aed" },
];

/** Xona turi bo'yicha bronlar. */
export const mockRoomTypeDistribution = [
  { name: "Standart", bookings: 152, revenue: 68_400_000 },
  { name: "Lyuks", bookings: 87, revenue: 53_940_000 },
  { name: "Family Suite", bookings: 37, revenue: 32_560_000 },
];

/** 30 kunlik occupancy percent. */
export function buildOccupancySeries(): Array<{
  date: string;
  occupancy: number;
}> {
  const result: Array<{ date: string; occupancy: number }> = [];
  const base = new Date(TODAY_ISO);
  let seed = 17;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 29; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    const boost = dow === 5 || dow === 6 ? 15 : 0;
    const occupancy = Math.min(
      95,
      Math.round(45 + rand() * 40 + boost),
    );
    result.push({ date: d.toISOString().slice(0, 10), occupancy });
  }
  return result;
}
