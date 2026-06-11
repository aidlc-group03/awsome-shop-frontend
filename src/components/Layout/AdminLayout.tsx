import { Outlet, useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import RedeemIcon from '@mui/icons-material/Redeem';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import RuleIcon from '@mui/icons-material/Rule';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import GroupIcon from '@mui/icons-material/Group';
import AvatarMenu from '../AvatarMenu';

const SIDEBAR_WIDTH = 240;

const NAV_ITEMS = [
  { key: 'dashboard', path: '/admin', icon: DashboardIcon },
  { key: 'products', path: '/admin/products', icon: Inventory2Icon },
  { key: 'categories', path: '/admin/categories', icon: CategoryIcon },
  { key: 'pointRules', path: '/admin/point-rules', icon: RuleIcon },
  { key: 'orders', path: '/admin/orders', icon: ReceiptLongIcon },
  { key: 'users', path: '/admin/users', icon: GroupIcon },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar - design: $bg-sidebar #1E293B, width 240, padding [24,0] */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          bgcolor: '#0F172A',
          display: 'flex',
          flexDirection: 'column',
          pt: 3,
        }}
      >
        {/* Header - design: gap 10, padding [0,20,24,20] */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', px: '20px', pb: '24px' }}>
          <RedeemIcon sx={{ fontSize: 28, color: '#60A5FA' }} />
          <Typography sx={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>
            AWSome {t('admin.title')}
          </Typography>
        </Box>

        {/* Divider - must use '1px' not 1 (MUI interprets 1 as 100%) */}
        <Box sx={{ height: '1px', bgcolor: '#1E293B', flexShrink: 0 }} />

        {/* Nav Items - design: gap 2, padding [12,8] */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', p: '12px 8px' }}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);
            const IconComp = item.icon;
            return (
              <ButtonBase
                key={item.key}
                onClick={() => navigate(item.path)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderRadius: '8px',
                  px: '12px',
                  py: '10px',
                  width: '100%',
                  justifyContent: 'flex-start',
                  bgcolor: isActive ? '#2563EB' : 'transparent',
                  '&:hover': {
                    bgcolor: isActive ? '#2563EB' : '#334155',
                  },
                }}
              >
                <IconComp
                  sx={{ fontSize: 20, color: isActive ? '#fff' : '#94A3B8' }}
                />
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? '#fff' : '#94A3B8',
                  }}
                >
                  {t(`admin.nav.${item.key}`)}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          bgcolor: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Header Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            height: 64,
            px: 4,
            flexShrink: 0,
          }}
        >
          <AvatarMenu />
        </Box>
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
