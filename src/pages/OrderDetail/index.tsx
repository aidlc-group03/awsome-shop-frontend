import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import type { Order, OrderStatus } from '../../types';
import { orderService } from '../../services/orderService';
import StatusChip from '../../components/StatusChip';
import LoadingState from '../../components/LoadingState';

const STATUS_SEQUENCE: OrderStatus[] = ['pending', 'confirmed', 'shipping', 'completed'];

function getStatusIndex(status: OrderStatus): number {
  if (status === 'cancelled') return -1;
  return STATUS_SEQUENCE.indexOf(status);
}

export default function OrderDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await orderService.getById(Number(id));
      setOrder(data);
    } catch {
      // error handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: '32px' }}>
        <LoadingState type="detail" />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: '32px' }}>
        <Typography>{t('orders.notFound')}</Typography>
      </Box>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

  const handleConfirmReceipt = async () => {
    await orderService.updateStatus(order.id, 'completed');
    setSnack(true);
    fetchOrder();
  };

  const cardSx = {
    borderRadius: 'var(--radius-lg, 12px)',
    border: '1px solid',
    borderColor: '#F1F5F9',
    p: 3,
  } as const;

  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{label}</Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 500, textAlign: 'right', maxWidth: 360 }}>{value}</Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: '32px 0' }}>
      <Box sx={{ width: 780, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 700 }}>{t('orders.orderDetailTitle')}</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
              {t('orders.orderNo')}：{order.orderNo}
            </Typography>
          </Box>
          <StatusChip status={order.status} type="order" />
        </Box>

        {/* Status Card / Timeline */}
        <Paper elevation={0} sx={cardSx}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{t('orders.orderStatus')}</Typography>
          <Divider sx={{ my: 2.5 }} />
          {isCancelled ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircleIcon sx={{ fontSize: 22, color: '#9E9E9E' }} />
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{t('orders.statusCancelled')}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{formatDate(order.updatedAt)}</Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {STATUS_SEQUENCE.map((status, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isLast = index === STATUS_SEQUENCE.length - 1;
                return (
                  <Box key={status} sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
                      {isCompleted ? (
                        <CheckCircleIcon sx={{ fontSize: 22, color: 'success.main' }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: 22, color: '#CBD5E1' }} />
                      )}
                      {!isLast && (
                        <Box
                          sx={{
                            width: '2px',
                            flex: 1,
                            minHeight: 28,
                            my: 0.5,
                            bgcolor: index < currentStatusIndex ? 'success.main' : '#E2E8F0',
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ pb: isLast ? 0 : 2 }}>
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: isCompleted ? 600 : 400,
                          color: isCompleted ? 'text.primary' : 'text.secondary',
                        }}
                      >
                        {t(`orders.status_${status}`)}
                      </Typography>
                      {isCompleted && index === currentStatusIndex && (
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{formatDate(order.updatedAt)}</Typography>
                      )}
                      {index === 0 && (
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{formatDate(order.createdAt)}</Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Paper>

        {/* Product Card */}
        <Paper elevation={0} sx={cardSx}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{t('orders.productInfo')}</Typography>
          <Divider sx={{ my: 2.5 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: 'var(--radius-md, 8px)',
                bgcolor: '#DBEAFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShoppingBagIcon sx={{ fontSize: 36, color: '#2563EB' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{order.productName}</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
                {t('orders.colorQty', { qty: order.quantity })}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#D97706' }}>
              {order.pointsAmount.toLocaleString()} {t('orders.pointsUnit')}
            </Typography>
          </Box>
        </Paper>

        {/* Points Card */}
        <Paper elevation={0} sx={cardSx}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{t('orders.pointsDetail')}</Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <InfoRow label={t('orders.itemPrice')} value={`${order.pointsAmount.toLocaleString()} ${t('orders.pointsUnit')}`} />
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{t('orders.actualPaid')}</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'primary.main' }}>
                {order.pointsAmount.toLocaleString()} {t('orders.pointsUnit')}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Delivery Card */}
        <Paper elevation={0} sx={cardSx}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{t('orders.deliveryInfo')}</Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <InfoRow label={t('orders.recipientName')} value={order.recipientName} />
            <InfoRow label={t('orders.contactPhone')} value={order.recipientPhone} />
            <InfoRow label={t('orders.recipientAddress')} value={order.recipientAddress} />
          </Box>
        </Paper>

        {/* Order Info Card */}
        <Paper elevation={0} sx={cardSx}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{t('orders.orderInfo')}</Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <InfoRow label={t('orders.orderNo')} value={order.orderNo} />
            <InfoRow label={t('orders.createdTime')} value={formatDate(order.createdAt)} />
            <InfoRow label={t('orders.payMethod')} value={t('orders.payMethodPoints')} />
            <InfoRow label={t('orders.orderSource')} value={t('orders.orderSourceValue')} />
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/orders')}
              sx={{ borderRadius: 'var(--radius-md, 8px)', px: 3, fontWeight: 600, textTransform: 'none' }}
            >
              {t('orders.backToList')}
            </Button>
          </Box>
          {order.status === 'shipping' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleConfirmReceipt}
              sx={{ borderRadius: 'var(--radius-md, 8px)', px: 3, fontWeight: 600, textTransform: 'none' }}
            >
              {t('orders.confirmReceipt')}
            </Button>
          )}
        </Box>

        <Snackbar
          open={snack}
          autoHideDuration={2500}
          onClose={() => setSnack(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSnack(false)}>
            {t('orders.receiptConfirmed')}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
