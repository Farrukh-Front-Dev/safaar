export type PropertyType = "hotel" | "dacha" | "guesthouse" | "sanatorium" | "resort";

export interface SearchDefaults {
  cityId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}
