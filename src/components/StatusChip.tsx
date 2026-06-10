import Chip from '@mui/material/Chip';
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

const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  earn: '#16A34A',
  admin_add: '#16A34A',
  spend: '#DC2626',
  admin_deduct: '#DC2626',
  refund: '#2563EB',
};

const TRANSACTION_TYPE_PREFIX: Record<TransactionType, string> = {
  earn: '+',
  admin_add: '+',
  spend: '-',
  admin_deduct: '-',
  refund: '+',
};

export default function StatusChip({ status, type }: StatusChipProps) {
  if (type === 'order') {
    const color = ORDER_STATUS_COLORS[status as OrderStatus];
    return (
      <Chip
        label={status}
        size="small"
        sx={{
          bgcolor: `${color}14`,
          color,
          fontWeight: 600,
          fontSize: 12,
          textTransform: 'capitalize',
        }}
      />
    );
  }

  const txType = status as TransactionType;
  const color = TRANSACTION_TYPE_COLORS[txType];
  const prefix = TRANSACTION_TYPE_PREFIX[txType];

  return (
    <Chip
      label={`${prefix} ${status}`}
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
