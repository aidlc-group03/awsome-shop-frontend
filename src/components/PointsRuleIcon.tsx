import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { SvgIconComponent } from '@mui/icons-material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CakeIcon from '@mui/icons-material/Cake';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CelebrationIcon from '@mui/icons-material/Celebration';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SchoolIcon from '@mui/icons-material/School';
import CampaignIcon from '@mui/icons-material/Campaign';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import StarsIcon from '@mui/icons-material/Stars';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import RedeemIcon from '@mui/icons-material/Redeem';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import SavingsIcon from '@mui/icons-material/Savings';

// Maps stored Material Symbol names (snake_case) to MUI icon components.
export const RULE_ICON_MAP: Record<string, SvgIconComponent> = {
  calendar_month: CalendarMonthIcon,
  workspace_premium: WorkspacePremiumIcon,
  cake: CakeIcon,
  trending_up: TrendingUpIcon,
  person_add: PersonAddIcon,
  celebration: CelebrationIcon,
  event_available: EventAvailableIcon,
  school: SchoolIcon,
  campaign: CampaignIcon,
  sentiment_satisfied: SentimentSatisfiedIcon,
  lightbulb: LightbulbIcon,
  military_tech: MilitaryTechIcon,
  stars: StarsIcon,
  card_giftcard: CardGiftcardIcon,
  redeem: RedeemIcon,
  emoji_events: EmojiEventsIcon,
  volunteer_activism: VolunteerActivismIcon,
  savings: SavingsIcon,
};

// Icons offered in the dialog picker.
export const SELECTABLE_RULE_ICONS: string[] = [
  'calendar_month',
  'workspace_premium',
  'cake',
  'trending_up',
  'person_add',
  'celebration',
  'event_available',
  'school',
  'campaign',
  'sentiment_satisfied',
  'lightbulb',
  'military_tech',
  'stars',
  'card_giftcard',
  'redeem',
  'emoji_events',
  'volunteer_activism',
  'savings',
];

const DEFAULT_ICON = StarsIcon;

interface PointsRuleIconProps extends SvgIconProps {
  name: string;
}

export default function PointsRuleIcon({ name, ...props }: PointsRuleIconProps) {
  const Icon = RULE_ICON_MAP[name] ?? DEFAULT_ICON;
  return <Icon {...props} />;
}
