import type { SvgIconComponent } from '@mui/icons-material';
import DevicesIcon from '@mui/icons-material/Devices';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import WatchIcon from '@mui/icons-material/Watch';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import RedeemIcon from '@mui/icons-material/Redeem';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HomeIcon from '@mui/icons-material/Home';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CategoryIcon from '@mui/icons-material/Category';

export interface CategoryIconOption {
  key: string;
  Icon: SvgIconComponent;
  color: string;
}

// Preset icons selectable in the category form, mirroring the design system.
export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { key: 'devices', Icon: DevicesIcon, color: '#2563EB' },
  { key: 'headphones', Icon: HeadphonesIcon, color: '#2563EB' },
  { key: 'watch', Icon: WatchIcon, color: '#0EA5E9' },
  { key: 'keyboard', Icon: KeyboardIcon, color: '#6366F1' },
  { key: 'redeem', Icon: RedeemIcon, color: '#F59E0B' },
  { key: 'shopping_bag', Icon: ShoppingBagIcon, color: '#F97316' },
  { key: 'restaurant', Icon: RestaurantIcon, color: '#EF4444' },
  { key: 'home', Icon: HomeIcon, color: '#10B981' },
  { key: 'business_center', Icon: BusinessCenterIcon, color: '#6366F1' },
  { key: 'fitness_center', Icon: FitnessCenterIcon, color: '#9CA3AF' },
  { key: 'local_offer', Icon: LocalOfferIcon, color: '#DB2777' },
  { key: 'checkroom', Icon: CheckroomIcon, color: '#8B5CF6' },
  { key: 'sports_esports', Icon: SportsEsportsIcon, color: '#16A34A' },
  { key: 'book', Icon: MenuBookIcon, color: '#0891B2' },
];

const ICON_MAP: Record<string, CategoryIconOption> = CATEGORY_ICON_OPTIONS.reduce(
  (acc, opt) => {
    acc[opt.key] = opt;
    return acc;
  },
  {} as Record<string, CategoryIconOption>,
);

export function getCategoryIcon(key: string | null | undefined): CategoryIconOption {
  if (key && ICON_MAP[key]) {
    return ICON_MAP[key];
  }
  return { key: 'category', Icon: CategoryIcon, color: '#64748B' };
}
