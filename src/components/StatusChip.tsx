import Chip from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';
import type { OrderStatus, TransactionType } from '../types';

interface StatusChipProps {
  status: OrderStatus | TransactionType;
  type: 'order' | 'transaction';
}

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#ED6C02',
  confirmed: '#2563EB',
  shipping: '#7C3AED',
  completed: '#16A34A',
  cancelled: '#9E9E9E',
};

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'orders.status_pending',
  confirmed: 'orders.status_confirmed',
  shipping: 'orders.status_shipping',
  completed: 'orders.status_completed',
  cancelled: 'orders.statusCancelled',
};

const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  earn: '#16A34A',
  admin_add: '#16A34A',
  spend: '#DC2626',
  admin_deduct: '#DC2626',
  refund: '#2563EB',
};

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  earn: 'points.filterEarn',
  admin_add: 'points.filterAdminAdd',
  spend: 'points.filterSpend',
  admin_deduct: 'points.filterAdminDeduct',
  refund: 'points.filterRefund',
};

export default function StatusChip({ status, type }: StatusChipProps) {
  const { t } = useTranslation();

  if (type === 'order') {
    const orderStatus = status as OrderStatus;
    const color = ORDER_STATUS_COLORS[orderStatus];
    return (
      <Chip
        label={t(ORDER_STATUS_LABELS[orderStatus])}
        size="small"
        sx={{
          bgcolor: `${color}14`,
          color,
          fontWeight: 600,
          fontSize: 12,
        }}
      />
    );
  }

  const txType = status as TransactionType;
  const color = TRANSACTION_TYPE_COLORS[txType];

  return (
    <Chip
      label={t(TRANSACTION_TYPE_LABELS[txType])}
      size="small"
      sx={{
        bgcolor: `${color}14`,
        color,
        fontWeight: 600,
        fontSize: 12,
      }}
    />
  );
}
