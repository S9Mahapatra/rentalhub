import {
  Aperture,
  Bike,
  BookOpen,
  Briefcase,
  Camera,
  CarFront,
  ChefHat,
  Drumstick,
  Flame,
  Gamepad2,
  Headphones,
  Lightbulb,
  Monitor,
  Package,
  Radio,
  Shirt,
  SlidersHorizontal,
  Speaker,
  Truck,
  Video,
  Wrench,
  Zap,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

const ICONS: Array<{
  match: RegExp;
  icon: LucideIcon;
}> = [
  { match: /camera|cinema|dslr|mirrorless|photo/i, icon: Camera },
  { match: /video|film|cinematic/i, icon: Video },
  { match: /lens|optics|aperture/i, icon: Aperture },
  { match: /light|lighting|lamp|led/i, icon: Lightbulb },
  { match: /audio|sound|speaker|mic|headphone/i, icon: Speaker },
  { match: /headphone/i, icon: Headphones },
  { match: /drone|aerial/i, icon: Radio },
  { match: /accessor|tools|equipment|gear/i, icon: SlidersHorizontal },
  { match: /kit|bundle|package/i, icon: Briefcase },
  { match: /deal|offer|sale/i, icon: Zap },
  { match: /bestseller|hot|popular/i, icon: Flame },
  { match: /gaming|game/i, icon: Gamepad2 },
  { match: /vehicle|car|transport/i, icon: CarFront },
  { match: /bike|bicycle|cycle|sports/i, icon: Bike },
  { match: /fashion|wear|apparel|cloth/i, icon: Shirt },
  { match: /home|furniture|decor/i, icon: Truck },
  { match: /kitchen|food|cook/i, icon: ChefHat },
  { match: /music|instrument/i, icon: Drumstick },
  { match: /monitor|computer|laptop|display/i, icon: Monitor },
  { match: /wrench|repair|maintenance/i, icon: Wrench },
  { match: /book|education|study/i, icon: BookOpen },
];

export function getCategoryIcon(input: {
  slug?: string;
  icon?: string;
  name?: string;
}) {
  const haystack = `${input.slug || ''} ${input.icon || ''} ${input.name || ''}`;
  const match = ICONS.find((entry) => entry.match.test(haystack));
  return match?.icon || Package;
}
