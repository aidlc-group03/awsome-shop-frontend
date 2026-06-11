import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TollIcon from '@mui/icons-material/Toll';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DownloadIcon from '@mui/icons-material/Download';
import type { Order, OrderStatus } from '../../../types';
import { orderService } from '../../../services/orderService';
import PageHeader from '../../../components/PageHeader';
import StatCards from '../../../components/StatCards';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';

// ============== status badge ==============
type BadgeKey = 'pending' | 'shipping' | 'completed' | 'cancelled';

const BADGE_KEY: Record<OrderStatus, BadgeKey> = {
  pending: 'pending',
  confirmed: 'pending',
  shipping: 'shipping',
  completed: 'completed',
  cancelled: 'cancelled',
};

const BADGE_COLOR: Record<BadgeKey, { bg: string; fg: string }> = {
  pending: { bg: '#FFF7ED', fg: '#D97706' },
  shipping: { bg: '#DBEAFE', fg: '#2563EB' },
  completed: { bg: '#DCFCE7', fg: '#16A34A' },
  cancelled: { bg: '#FEE2E2', fg: '#DC2626' },
};

// Status filter options match design (consolidated 待发货 = pending+confirmed)
const STATUS_OPTIONS: Array<{ value: string; key: string }> = [
  { value: '', key: 'filterStatusAll' },
  { value: 'pending,confirmed', key: 'filterStatusPending' },
  { value: 'shipping', key: 'filterStatusShipping' },
  { value: 'completed', key: 'filterStatusCompleted' },
  { value: 'cancelled', key: 'filterStatusCancelled' },
];

const DATE_RANGE_OPTIONS: Array<{ value: string; key: string }> = [
  { value: 'all', key: 'filterDateAll' },
  { value: '7', key: 'filterDate7' },
  { value: '30', key: 'filterDate30' },
  { value: '90', key: 'filterDate90' },
];

const PAGE_SIZE = 5;

export default function OrderManage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // 1-based for Pagination
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, points: 0 });
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: PAGE_SIZE,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(keyword ? { keyword } : {}),
        ...(dateRange !== 'all' ? { days: parseInt(dateRange, 10) } : {}),
      };
      const result = await orderService.getAllOrders(params);
      setOrders(result.records);
      setTotal(result.total);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, keyword, dateRange]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    // Compute summary stats from the full order set
    orderService
      .getAllOrders({ page: 1, size: 999 })
      .then((res) => {
        const all = res.records;
        setStats({
          total: res.total,
          pending: all.filter((o) => o.status === 'pending' || o.status === 'confirmed').length,
          completed: all.filter((o) => o.status === 'completed').length,
          points: all
            .filter((o) => o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.pointsAmount, 0),
        });
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = () => {
    setPage(1);
    fetchOrders();
  };

  const handleExport = () => {
    setSnack({ open: true, message: t('adminOrders.exportSuccess'), severity: 'info' });
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);
  const fromRow = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const toRow = Math.min(page * PAGE_SIZE, total);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: '24px 32px' }}>
      <PageHeader
        title={t('adminOrders.title')}
        subtitle={t('adminOrders.subtitle')}
        action={
          <Button
            variant="outlined"
            startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
            onClick={handleExport}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              borderColor: '#E2E8F0',
              color: 'text.primary',
              px: 2.5,
              py: 1.25,
              '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
            }}
          >
            {t('adminOrders.exportBtn')}
          </Button>
        }
      />

      {/* Summary stats */}
      <StatCards
        items={[
          {
            key: 'total',
            label: t('adminOrders.statTotal'),
            value: stats.total.toLocaleString(),
            icon: ReceiptLongIcon,
            iconColor: '#2563EB',
            iconBg: '#EFF6FF',
          },
          {
            key: 'pending',
            label: t('adminOrders.statPending'),
            value: stats.pending.toLocaleString(),
            icon: LocalShippingIcon,
            iconColor: '#D97706',
            iconBg: '#FFF7ED',
          },
          {
            key: 'completed',
            label: t('adminOrders.statCompleted'),
            value: stats.completed.toLocaleString(),
            icon: CheckCircleIcon,
            iconColor: '#10B981',
            iconBg: '#ECFDF5',
          },
          {
            key: 'points',
            label: t('adminOrders.statPoints'),
            value: stats.points.toLocaleString(),
            icon: TollIcon,
            iconColor: '#7C3AED',
            iconBg: '#F5F3FF',
          },
        ]}
      />

      {/* Toolbar: search + status filter + date filter */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder={t('adminOrders.searchPlaceholder')}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
          sx={{
            width: 260,
            '& .MuiOutlinedInput-root': {
              height: 38,
              borderRadius: '8px',
              fontSize: 13,
              '& fieldset': { borderColor: '#E2E8F0' },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          sx={{
            minWidth: 120,
            '& .MuiOutlinedInput-root': {
              height: 38,
              borderRadius: '8px',
              fontSize: 13,
              '& fieldset': { borderColor: '#E2E8F0' },
            },
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {t(`adminOrders.${opt.key}`)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          value={dateRange}
          onChange={(e) => {
            setDateRange(e.target.value);
            setPage(1);
          }}
          sx={{
            minWidth: 140,
            '& .MuiOutlinedInput-root': {
              height: 38,
              borderRadius: '8px',
              fontSize: 13,
              '& fieldset': { borderColor: '#E2E8F0' },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
        >
          {DATE_RANGE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {t(`adminOrders.${opt.key}`)}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Table */}
      {loading ? (
        <LoadingState type="table" rows={5} />
      ) : orders.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ border: '1px solid', borderColor: '#F1F5F9', borderRadius: '12px', p: 6 }}
        >
          <EmptyState message={t('adminOrders.empty')} />
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{ border: '1px solid', borderColor: '#F1F5F9', borderRadius: '12px', overflow: 'hidden' }}
        >
          <TableContainer>
            <Table sx={{ '& td, & th': { borderBottom: '1px solid', borderColor: '#F1F5F9' } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ width: 130, fontSize: 12, fontWeight: 600, color: 'text.secondary', py: 1.5 }}>
                    {t('adminOrders.col.orderNo')}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: 1.5 }}>
                    {t('adminOrders.col.productName')}
                  </TableCell>
                  <TableCell sx={{ width: 100, fontSize: 12, fontWeight: 600, color: 'text.secondary', py: 1.5 }}>
                    {t('adminOrders.col.user')}
                  </TableCell>
                  <TableCell sx={{ width: 90, fontSize: 12, fontWeight: 600, color: 'text.secondary', py: 1.5 }}>
                    {t('adminOrders.col.points')}
                  </TableCell>
                  <TableCell sx={{ width: 110, fontSize: 12, fontWeight: 600, color: 'text.secondary', py: 1.5 }}>
                    {t('adminOrders.col.createdAt')}
                  </TableCell>
                  <TableCell sx={{ width: 90, fontSize: 12, fontWeight: 600, color: 'text.secondary', py: 1.5 }}>
                    {t('adminOrders.col.status')}
                  </TableCell>
                  <TableCell sx={{ width: 70, fontSize: 12, fontWeight: 600, color: 'text.secondary', py: 1.5 }}>
                    {t('adminOrders.col.actions')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => {
                  const badgeKey = BADGE_KEY[order.status];
                  const badge = BADGE_COLOR[badgeKey];
                  const iconBg = order.productImageColor || '#DBEAFE';
                  return (
                    <TableRow key={order.id} hover sx={{ '& td': { py: 1.5 } }}>
                      <TableCell>
                        <Typography
                          sx={{ fontSize: 12, fontWeight: 500, color: 'primary.main', cursor: 'pointer' }}
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                        >
                          {order.orderNo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '6px',
                              bgcolor: iconBg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <HeadphonesIcon sx={{ fontSize: 18, color: '#1E293B', opacity: 0.8 }} />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary', lineHeight: 1.3 }}
                              noWrap
                            >
                              {order.productName}
                            </Typography>
                            {order.productSpec && (
                              <Typography sx={{ fontSize: 11, color: 'text.secondary' }} noWrap>
                                {order.productSpec}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 12, color: 'text.primary' }}>
                          {order.recipientName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.primary' }}>
                          {order.pointsAmount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                          {formatDate(order.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            px: 1.25,
                            py: 0.375,
                            borderRadius: 12,
                            bgcolor: badge.bg,
                          }}
                        >
                          <Typography sx={{ fontSize: 11, fontWeight: 600, color: badge.fg }}>
                            {t(`adminOrders.statusBadge.${badgeKey}`)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{ fontSize: 12, fontWeight: 500, color: 'primary.main', cursor: 'pointer' }}
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                        >
                          {t('adminOrders.actionDetail')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Pagination */}
      {!loading && total > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            {t('adminOrders.paginationText', { from: fromRow, to: toRow, total: total.toLocaleString() })}
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            shape="rounded"
            siblingCount={1}
            renderItem={(item) => (
              <PaginationItem
                {...item}
                sx={{
                  fontSize: 13,
                  height: 32,
                  minWidth: 32,
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: '#E2E8F0',
                  bgcolor: '#fff',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: '#fff',
                    borderColor: 'primary.main',
                    fontWeight: 600,
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                }}
              />
            )}
          />
        </Box>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          variant="filled"
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
