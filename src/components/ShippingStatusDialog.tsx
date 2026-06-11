import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import type { Order, OrderStatus } from '../types';
import { orderService } from '../services/orderService';

interface ShippingStatusDialogProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onSuccess?: (updated: Order) => void;
}

// Express company options - keep label-only; backend stores raw string
const EXPRESS_COMPANIES = [
  '顺丰速运',
  '京东物流',
  '圆通速递',
  '中通快递',
  '韵达快递',
  'EMS',
];

// Target status options (from current status)
function targetOptions(current: OrderStatus): OrderStatus[] {
  switch (current) {
    case 'pending':
    case 'confirmed':
      return ['shipping', 'completed'];
    case 'shipping':
      return ['completed'];
    default:
      return [];
  }
}

const STATUS_BADGE_KEY: Record<OrderStatus, 'pending' | 'shipping' | 'completed' | 'cancelled'> = {
  pending: 'pending',
  confirmed: 'pending',
  shipping: 'shipping',
  completed: 'completed',
  cancelled: 'cancelled',
};

const STATUS_BADGE_COLOR: Record<'pending' | 'shipping' | 'completed' | 'cancelled', { bg: string; fg: string }> = {
  pending: { bg: '#FFFFFF', fg: '#D97706' },
  shipping: { bg: '#FFFFFF', fg: '#2563EB' },
  completed: { bg: '#FFFFFF', fg: '#16A34A' },
  cancelled: { bg: '#FFFFFF', fg: '#DC2626' },
};

export default function ShippingStatusDialog({
  open,
  order,
  onClose,
  onSuccess,
}: ShippingStatusDialogProps) {
  const { t } = useTranslation();
  const [target, setTarget] = useState<OrderStatus | ''>('');
  const [carrier, setCarrier] = useState('');
  const [tracking, setTracking] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && order) {
      const opts = targetOptions(order.status);
      setTarget(opts[0] ?? '');
      setCarrier(order.expressCompany ?? '');
      setTracking(order.trackingNumber ?? '');
      setNote(order.shippingNote ?? '');
      setError('');
      setSubmitting(false);
    }
  }, [open, order]);

  if (!order) return null;

  const targetList = targetOptions(order.status);
  const requiresShippingFields = target === 'shipping';
  const currentBadgeKey = STATUS_BADGE_KEY[order.status];
  const currentBadge = STATUS_BADGE_COLOR[currentBadgeKey];

  const handleSubmit = async () => {
    if (!target) {
      setError(t('adminOrders.shippingDialog.validation.targetStatus'));
      return;
    }
    if (requiresShippingFields) {
      if (!carrier) {
        setError(t('adminOrders.shippingDialog.validation.expressCompany'));
        return;
      }
      if (!tracking.trim()) {
        setError(t('adminOrders.shippingDialog.validation.trackingNumber'));
        return;
      }
    }
    setSubmitting(true);
    setError('');
    try {
      const updated = await orderService.updateShipping({
        id: order.id,
        status: target as OrderStatus,
        expressCompany: requiresShippingFields ? carrier : undefined,
        trackingNumber: requiresShippingFields ? tracking.trim() : undefined,
        shippingNote: note.trim() || undefined,
      });
      onSuccess?.(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminOrders.shippingDialog.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            width: 480,
            maxWidth: 480,
            borderRadius: '16px',
            border: '1px solid #FFFFFF33',
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              bgcolor: '#DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LocalShippingIcon sx={{ fontSize: 20, color: '#2563EB' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>
              {t('adminOrders.shippingDialog.title')}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{order.orderNo}</Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={submitting} sx={{ borderRadius: '8px' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Current status banner */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: '#FFF7ED',
            borderRadius: '8px',
            px: 2,
            py: 1.5,
          }}
        >
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            {t('adminOrders.shippingDialog.currentStatus')}
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.5,
              borderRadius: 12,
              bgcolor: currentBadge.bg,
              border: '1px solid',
              borderColor: currentBadge.fg,
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: currentBadge.fg }}>
              {t(`adminOrders.statusBadge.${currentBadgeKey}`)}
            </Typography>
          </Box>
          <ArrowForwardIcon sx={{ fontSize: 18, color: 'text.disabled', ml: 'auto' }} />
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {/* Target status */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>
            {t('adminOrders.shippingDialog.targetStatus')}{' '}
            <Box component="span" sx={{ color: 'error.main' }}>
              *
            </Box>
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={target}
            onChange={(e) => setTarget(e.target.value as OrderStatus)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: target ? 'primary.main' : '#E2E8F0',
                  borderWidth: target ? 2 : 1,
                },
              },
            }}
          >
            {targetList.length === 0 && (
              <MenuItem value="" disabled>
                —
              </MenuItem>
            )}
            {targetList.map((s) => (
              <MenuItem key={s} value={s}>
                {t(`adminOrders.statusBadge.${STATUS_BADGE_KEY[s]}`)}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Carrier */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>
            {t('adminOrders.shippingDialog.expressCompany')}
            {requiresShippingFields && (
              <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                *
              </Box>
            )}
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            disabled={!requiresShippingFields}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="" disabled>
              {t('adminOrders.shippingDialog.expressCompanyPlaceholder')}
            </MenuItem>
            {EXPRESS_COMPANIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Tracking number */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>
            {t('adminOrders.shippingDialog.trackingNumber')}
            {requiresShippingFields && (
              <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                *
              </Box>
            )}
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder={t('adminOrders.shippingDialog.trackingNumberPlaceholder')}
            disabled={!requiresShippingFields}
          />
        </Box>

        {/* Note */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>
            {t('adminOrders.shippingDialog.note')}
          </Typography>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('adminOrders.shippingDialog.notePlaceholder')}
          />
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1.5,
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={submitting}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            borderColor: '#E2E8F0',
            color: 'text.primary',
            px: 3,
          }}
        >
          {t('adminOrders.shippingDialog.cancel')}
        </Button>
        <Button
          variant="contained"
          startIcon={<CheckIcon />}
          onClick={handleSubmit}
          disabled={submitting || !target}
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 3 }}
        >
          {t('adminOrders.shippingDialog.confirm')}
        </Button>
      </Box>
    </Dialog>
  );
}
