import { Building2, Home, TreePine, HeartPulse, Mountain } from "lucide-react";
import type { PropertyType } from "./types";

export const PT_TYPES: PropertyType[] = ["hotel", "dacha", "guesthouse", "sanatorium", "resort"];

export const PT_ICONS: Record<PropertyType, React.ReactNode> = {
  hotel: <Building2 className="h-4 w-4" />,
  dacha: <Home className="h-4 w-4" />,
  guesthouse: <TreePine className="h-4 w-4" />,
  sanatorium: <HeartPulse className="h-4 w-4" />,
  resort: <Mountain className="h-4 w-4" />,
};
