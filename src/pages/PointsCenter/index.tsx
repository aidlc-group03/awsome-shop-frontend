import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Pagination from '@mui/material/Pagination';
import TollIcon from '@mui/icons-material/Toll';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import type { PointsBalance, PointsTransaction, TransactionType } from '../../types';
import { pointsService } from '../../services/pointsService';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';

const TYPE_FILTERS: Array<{ key: string; label: string }> = [
  { key: '', label: 'points.filterAll' },
  { key: 'earn', label: 'points.filterEarn' },
  { key: 'spend', label: 'points.filterSpend' },
  { key: 'refund', label: 'points.filterRefund' },
  { key: 'admin_add', label: 'points.filterAdminAdd' },
  { key: 'admin_deduct', label: 'points.filterAdminDeduct' },
];

const POSITIVE_TYPES: TransactionType[] = ['earn', 'admin_add', 'refund'];

export default function PointsCenter() {
  const { t } = useTranslation();
  const [balance, setBalance] = useState<PointsBalance | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await pointsService.getBalance();
        setBalance(data);
      } catch {
        // error handled
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const params = {
        page,
        size: pageSize,
        ...(typeFilter ? { type: typeFilter } : {}),
      };
      const result = await pointsService.getTransactions(params);
      setTransactions(result.records);
      setTotalPages(result.pages);
    } catch {
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
    setPage(1);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const getPointsDisplay = (tx: PointsTransaction) => {
    const isPositive = POSITIVE_TYPES.includes(tx.type);
    return {
      prefix: isPositive ? '+' : '-',
      color: isPositive ? '#16A34A' : '#DC2626',
    };
  };

  if (loading) {
    return (
      <Box sx={{ p: '24px 32px' }}>
        <LoadingState type="detail" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      <PageHeader title={t('points.title')} subtitle={t('points.subtitle')} />

      {/* Balance Section */}
      {balance && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Main Balance Card */}
          <Paper
            sx={{
              flex: 2,
              p: 3,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <TollIcon sx={{ fontSize: 36, color: 'rgba(255,255,255,0.8)' }} />
            <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
              {t('points.currentBalance')}
            </Typography>
            <Typography sx={{ fontSize: 40, fontWeight: 700 }}>
              {balance.balance.toLocaleString()}
            </Typography>
          </Paper>

          {/* Total Earned */}
          <Paper
            sx={{
              flex: 1,
              p: 3,
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 28, color: '#16A34A' }} />
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('points.totalEarned')}
            </Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#16A34A' }}>
              {balance.totalEarned.toLocaleString()}
            </Typography>
          </Paper>

          {/* Total Spent */}
          <Paper
            sx={{
              flex: 1,
              p: 3,
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <TrendingDownIcon sx={{ fontSize: 28, color: '#DC2626' }} />
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('points.totalSpent')}
            </Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#DC2626' }}>
              {balance.totalSpent.toLocaleString()}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Type Filter */}
      <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {TYPE_FILTERS.map((filter) => (
          <Chip
            key={filter.key}
            label={t(filter.label)}
            onClick={() => handleTypeChange(filter.key)}
            sx={{
              borderRadius: '20px',
              fontSize: 13,
              fontWeight: typeFilter === filter.key ? 600 : 400,
              color: typeFilter === filter.key ? '#fff' : '#64748B',
              bgcolor: typeFilter === filter.key ? '#2563EB' : '#fff',
              border: typeFilter === filter.key ? 'none' : '1px solid #E2E8F0',
              '&:hover': {
                bgcolor: typeFilter === filter.key ? '#2563EB' : '#F8FAFC',
              },
            }}
          />
        ))}
      </Box>

      {/* Transactions List */}
      {txLoading ? (
        <LoadingState type="table" rows={5} />
      ) : transactions.length === 0 ? (
        <EmptyState message={t('points.noTransactions')} />
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {transactions.map((tx) => {
              const { prefix, color } = getPointsDisplay(tx);
              return (
                <Paper
                  key={tx.id}
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <StatusChip status={tx.type as TransactionType} type="transaction" />
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                        {tx.description || tx.type}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {formatDate(tx.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, color }}>
                    {prefix}{tx.points.toLocaleString()}
                  </Typography>
                </Paper>
              );
            })}
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
