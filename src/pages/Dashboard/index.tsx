import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import GroupIcon from '@mui/icons-material/Group';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TollIcon from '@mui/icons-material/Toll';
import type { Order } from '../../types';
import { orderService } from '../../services/orderService';
import StatusChip from '../../components/StatusChip';
import LoadingState from '../../components/LoadingState';

const METRICS = [
  {
    key: 'totalProducts',
    value: '128',
    change: '+12 本月新增',
    changeColor: '#16A34A',
    icon: Inventory2Icon,
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
  },
  {
    key: 'totalUsers',
    value: '356',
    change: '+28 本月新增',
    changeColor: '#16A34A',
    icon: GroupIcon,
    iconColor: '#16A34A',
    iconBg: '#DCFCE7',
  },
  {
    key: 'monthlyRedemptions',
    value: '89',
    change: '+15 较上月',
    changeColor: '#D97706',
    icon: ShoppingCartIcon,
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
  },
  {
    key: 'pointsCirculation',
    value: '52,800',
    change: '本月发放总量',
    changeColor: '#64748B',
    icon: TollIcon,
    iconColor: '#7C3AED',
    iconBg: '#EDE9FE',
  },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const result = await orderService.getAllOrders({ page: 1, size: 5 });
        setOrders(result.records);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentOrders();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px', p: '32px' }}>
      {/* Dashboard Header */}
      <Typography sx={{ fontSize: 24, fontWeight: 700, color: 'text.primary' }}>
        {t('admin.dashboard')}
      </Typography>

      {/* Metric Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {METRICS.map((metric) => {
          const IconComp = metric.icon;
          return (
            <Paper
              key={metric.key}
              elevation={0}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: '#F1F5F9',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {t(`admin.metrics.${metric.key}`)}
                </Typography>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: metric.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconComp sx={{ fontSize: 20, color: metric.iconColor }} />
                </Box>
              </Box>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: 'text.primary' }}>
                {metric.value}
              </Typography>
              <Typography sx={{ fontSize: 12, color: metric.changeColor }}>
                {metric.change}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {/* Recent Orders Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: '#F1F5F9',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2.5,
            py: 2,
            borderBottom: '1px solid',
            borderColor: '#F1F5F9',
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary' }}>
            {t('admin.recentOrders')}
          </Typography>
          <Link
            component="button"
            underline="none"
            sx={{ fontSize: 13, color: 'primary.main' }}
          >
            {t('admin.viewAll')} →
          </Link>
        </Box>

        {loading ? (
          <Box sx={{ p: 2.5 }}>
            <LoadingState type="table" rows={5} />
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ '& .MuiTableCell-root': { borderColor: '#F1F5F9' } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 120, py: '10px', px: '20px' }}>
                    {t('admin.table.user')}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>
                    {t('admin.table.product')}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 80, py: '10px', px: '20px' }}>
                    {t('admin.table.points')}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 90, py: '10px', px: '20px' }}>
                    {t('admin.table.status')}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 120, py: '10px', px: '20px' }}>
                    {t('admin.table.time')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ fontSize: 13, py: '12px', px: '20px' }}>{order.recipientName}</TableCell>
                    <TableCell sx={{ fontSize: 13, py: '12px', px: '20px' }}>{order.productName}</TableCell>
                    <TableCell sx={{ fontSize: 13, py: '12px', px: '20px' }}>{order.pointsAmount.toLocaleString()}</TableCell>
                    <TableCell sx={{ py: '12px', px: '20px' }}>
                      <StatusChip status={order.status} type="order" />
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: 'text.secondary', py: '12px', px: '20px' }}>
                      {formatDate(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
