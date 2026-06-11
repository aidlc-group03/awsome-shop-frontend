import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TollIcon from '@mui/icons-material/Toll';
import type { Order } from '../../types';

export default function RedemptionSuccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const order = (location.state as { order?: Order })?.order;

  if (!order) {
    return (
      <Box sx={{ p: '24px 32px', textAlign: 'center' }}>
        <Typography>{t('redeem.noOrderData')}</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2, textTransform: 'none' }}>
          {t('redeem.continueShopping')}
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        p: '24px 32px',
      }}
    >
      <Paper
        sx={{
          p: 5,
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2.5,
          maxWidth: 480,
          width: '100%',
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 72, color: '#16A34A' }} />

        <Typography sx={{ fontSize: 24, fontWeight: 700, color: 'text.primary' }}>
          {t('redeem.successTitle')}
        </Typography>

        <Typography sx={{ fontSize: 14, color: 'text.secondary', textAlign: 'center' }}>
          {t('redeem.successMessage')}
        </Typography>

        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            bgcolor: '#F8FAFC',
            borderRadius: '12px',
            p: 3,
            mt: 1,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('redeem.orderNumber')}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              {order.orderNo}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('redeem.productName')}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              {order.productName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('redeem.recipient')}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              {order.recipientName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('redeem.pointsDeducted')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TollIcon sx={{ fontSize: 16, color: '#D97706' }} />
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#D97706' }}>
                -{order.pointsAmount.toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('redeem.estDelivery')}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'success.main' }}>
              {t('redeem.estDeliveryValue')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2, width: '100%' }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate(`/orders/${order.id}`)}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, height: 48 }}
          >
            {t('redeem.viewOrder')}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate('/')}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, height: 48, borderColor: '#E2E8F0', color: 'text.primary' }}
          >
            {t('redeem.continueShopping')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
