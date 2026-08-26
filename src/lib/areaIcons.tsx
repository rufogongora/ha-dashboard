import {
  Armchair,
  Bed,
  Car,
  ChefHat,
  DoorOpen,
  Flower2,
  Home,
  LayoutGrid,
  type LucideIcon,
  Monitor,
  Shirt,
  Sparkles,
  Sun,
  Utensils,
  Warehouse,
} from "lucide-react";

const RULES: Array<[RegExp, LucideIcon]> = [
  [/bed/i, Bed],
  [/living/i, Armchair],
  [/kitchen/i, ChefHat],
  [/dining/i, Utensils],
  [/office/i, Monitor],
  [/garage/i, Car],
  [/attic/i, Warehouse],
  [/closet/i, Shirt],
  [/entry|hall/i, DoorOpen],
  [/backyard|garden|yard/i, Flower2],
  [/driveway/i, Car],
  [/decoration/i, Sparkles],
  [/patio|porch|outdoor/i, Sun],
];

export function areaIcon(name: string): LucideIcon {
  for (const [pattern, icon] of RULES) {
    if (pattern.test(name)) return icon;
  }
  return Home;
}

export const OVERVIEW_ICON: LucideIcon = LayoutGrid;
