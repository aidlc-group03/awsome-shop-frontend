import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';
import TollIcon from '@mui/icons-material/Toll';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import type { Order, OrderStatus } from '../../types';
import { orderService } from '../../services/orderService';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: '', label: 'orders.filterAll' },
  { key: 'pending', label: 'orders.filterPending' },
  { key: 'confirmed', label: 'orders.filterConfirmed' },
  { key: 'shipping', label: 'orders.filterShipping' },
  { key: 'completed', label: 'orders.filterCompleted' },
  { key: 'cancelled', label: 'orders.filterCancelled' },
];

export default function Orders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: pageSize,
        ...(statusFilter ? { status: statusFilter } : {}),
      };
      const result = await orderService.getMyOrders(params);
      setOrders(result.records);
      setTotalPages(result.pages);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      <PageHeader title={t('orders.title')} subtitle={t('orders.subtitle')} />

      {/* Status Filter */}
      <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map((filter) => (
          <Chip
            key={filter.key}
            label={t(filter.label)}
            onClick={() => handleStatusChange(filter.key)}
            sx={{
              borderRadius: '20px',
              fontSize: 13,
              fontWeight: statusFilter === filter.key ? 600 : 400,
              color: statusFilter === filter.key ? '#fff' : '#64748B',
              bgcolor: statusFilter === filter.key ? '#2563EB' : '#fff',
              border: statusFilter === filter.key ? 'none' : '1px solid #E2E8F0',
              '&:hover': {
                bgcolor: statusFilter === filter.key ? '#2563EB' : '#F8FAFC',
              },
            }}
          />
        ))}
      </Box>

      {/* Orders List */}
      {loading ? (
        <LoadingState type="table" rows={5} />
      ) : orders.length === 0 ? (
        <EmptyState message={t('orders.empty')} />
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {orders.map((order) => (
              <Paper
                key={order.id}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: '#F1F5F9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                {/* Order meta row */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {t('orders.orderNo')}: {order.orderNo} · {formatDate(order.createdAt)}
                  </Typography>
                  <StatusChip status={order.status as OrderStatus} type="order" />
                </Box>

                {/* Product row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '8px',
                      bgcolor: '#DBEAFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ShoppingBagIcon sx={{ fontSize: 28, color: '#2563EB' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{order.productName}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <TollIcon sx={{ fontSize: 16, color: '#D97706' }} />
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#D97706' }}>
                        {order.pointsAmount.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/orders/${order.id}`)}
                      sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 500, borderColor: '#E2E8F0', color: 'text.secondary' }}
                    >
                      {t('orders.viewDetail')}
                    </Button>
                    {order.status === 'shipping' && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => navigate(`/orders/${order.id}`)}
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                      >
                        {t('orders.confirmReceipt')}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
