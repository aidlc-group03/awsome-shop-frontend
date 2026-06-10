import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import TollIcon from '@mui/icons-material/Toll';
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

  useEffect(() => {
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
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: '24px 32px' }}>
        <LoadingState type="detail" />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: '24px 32px' }}>
        <Typography>{t('orders.notFound')}</Typography>
      </Box>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/orders')}
        sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
      >
        {t('common.back')}
      </Button>

      {/* Order Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
            {t('orders.orderNo')}: {order.orderNo}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
            {t('orders.createdAt')}: {formatDate(order.createdAt)}
          </Typography>
        </Box>
        <StatusChip status={order.status} type="order" />
      </Box>

      {/* Product Info */}
      <Paper sx={{ p: 3, borderRadius: '12px' }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>
          {t('orders.productInfo')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('orders.productName')}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
              {order.productName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('orders.pointsAmount')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TollIcon sx={{ fontSize: 16, color: '#D97706' }} />
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#D97706' }}>
                {order.pointsAmount.toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('orders.quantity')}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
              {order.quantity}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Delivery Info */}
      <Paper sx={{ p: 3, borderRadius: '12px' }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>
          {t('orders.deliveryInfo')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('orders.recipientName')}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
              {order.recipientName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('orders.recipientPhone')}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
              {order.recipientPhone}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('orders.recipientAddress')}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500, maxWidth: 300, textAlign: 'right' }}>
              {order.recipientAddress}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Status Timeline */}
      <Paper sx={{ p: 3, borderRadius: '12px' }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 3 }}>
          {t('orders.statusTimeline')}
        </Typography>

        {isCancelled ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CheckCircleIcon sx={{ fontSize: 20, color: '#9E9E9E' }} />
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                {t('orders.statusCancelled')}
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                {formatDate(order.updatedAt)}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {STATUS_SEQUENCE.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isLast = index === STATUS_SEQUENCE.length - 1;
              return (
                <Box key={status}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {isCompleted ? (
                      <CheckCircleIcon sx={{ fontSize: 20, color: '#16A34A' }} />
                    ) : (
                      <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: '#CBD5E1' }} />
                    )}
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: isCompleted ? 600 : 400,
                          color: isCompleted ? 'text.primary' : 'text.secondary',
                        }}
                      >
                        {t(`orders.status_${status}`)}
                      </Typography>
                      {isCompleted && index === currentStatusIndex && (
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                          {formatDate(order.updatedAt)}
                        </Typography>
                      )}
                      {isCompleted && index === 0 && (
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                          {formatDate(order.createdAt)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {!isLast && (
                    <Divider
                      orientation="vertical"
                      sx={{
                        ml: '10px',
                        height: 24,
                        borderColor: isCompleted ? '#16A34A' : '#E2E8F0',
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
