import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import type { Order, OrderStatus } from '../../../types';
import { orderService } from '../../../services/orderService';
import PageHeader from '../../../components/PageHeader';
import StatusChip from '../../../components/StatusChip';
import ConfirmDialog from '../../../components/ConfirmDialog';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: '', label: 'adminOrders.filterAll' },
  { key: 'pending', label: 'adminOrders.filterPending' },
  { key: 'confirmed', label: 'adminOrders.filterConfirmed' },
  { key: 'shipping', label: 'adminOrders.filterShipping' },
  { key: 'completed', label: 'adminOrders.filterCompleted' },
  { key: 'cancelled', label: 'adminOrders.filterCancelled' },
];

const NEXT_STATUS: Record<string, { next: OrderStatus; action: string }> = {
  pending: { next: 'confirmed', action: 'adminOrders.actionConfirm' },
  confirmed: { next: 'shipping', action: 'adminOrders.actionShip' },
  shipping: { next: 'completed', action: 'adminOrders.actionComplete' },
};

export default function OrderManage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [keyword, setKeyword] = useState('');

  // Status update confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<{ id: number; status: OrderStatus } | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        size: rowsPerPage,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(keyword ? { keyword } : {}),
      };
      const result = await orderService.getAllOrders(params);
      setOrders(result.records);
      setTotal(result.total);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter, keyword]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(0);
  };

  const handleSearch = () => {
    setPage(0);
    fetchOrders();
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusUpdate = (id: number, nextStatus: OrderStatus) => {
    setUpdateTarget({ id, status: nextStatus });
    setConfirmOpen(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!updateTarget) return;
    setUpdateLoading(true);
    try {
      await orderService.updateStatus(updateTarget.id, updateTarget.status);
      setConfirmOpen(false);
      setUpdateTarget(null);
      fetchOrders();
    } catch {
      // keep dialog open on failure
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      <PageHeader title={t('adminOrders.title')} />

      {/* Status Filter */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
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

      {/* Search */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder={t('adminOrders.searchPlaceholder')}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ width: 300 }}
        />
        <Button variant="outlined" onClick={handleSearch}>
          {t('adminOrders.search')}
        </Button>
      </Box>

      {/* Table */}
      {loading ? (
        <LoadingState type="table" rows={5} />
      ) : orders.length === 0 ? (
        <EmptyState message={t('adminOrders.empty')} />
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#F1F5F9', borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell>{t('adminOrders.col.orderNo')}</TableCell>
                  <TableCell>{t('adminOrders.col.productName')}</TableCell>
                  <TableCell>{t('adminOrders.col.points')}</TableCell>
                  <TableCell>{t('adminOrders.col.status')}</TableCell>
                  <TableCell>{t('adminOrders.col.createdAt')}</TableCell>
                  <TableCell>{t('adminOrders.col.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => {
                  const nextAction = NEXT_STATUS[order.status];
                  return (
                    <TableRow key={order.id} hover>
                      <TableCell>{order.orderNo}</TableCell>
                      <TableCell>{order.productName}</TableCell>
                      <TableCell>{order.pointsAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <StatusChip status={order.status} type="order" />
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        {nextAction && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleStatusUpdate(order.id, nextAction.next)}
                          >
                            {t(nextAction.action)}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      {/* Status Update Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmStatusUpdate}
        title={t('adminOrders.confirmTitle')}
        content={t('adminOrders.confirmContent')}
        confirmText={t('adminOrders.confirmBtn')}
        loading={updateLoading}
      />
    </Box>
  );
}
