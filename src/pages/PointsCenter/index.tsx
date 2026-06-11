import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import StarsIcon from '@mui/icons-material/Stars';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import CelebrationIcon from '@mui/icons-material/Celebration';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import type { PointsBalance, PointsTransaction, TransactionType } from '../../types';
import { pointsService } from '../../services/pointsService';
import { orderService } from '../../services/orderService';
import StatusChip from '../../components/StatusChip';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';

const POSITIVE_TYPES: TransactionType[] = ['earn', 'admin_add', 'refund'];

type FilterKey = 'all' | 'get' | 'use';

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'points.filterAll' },
  { key: 'get', label: 'points.filterGet' },
  { key: 'use', label: 'points.filterUse' },
];

export default function PointsCenter() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<PointsBalance | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [redeemCount, setRedeemCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    const init = async () => {
      try {
        const [bal, orders] = await Promise.all([
          pointsService.getBalance(),
          orderService.getMyOrders({ page: 1, size: 1 }),
        ]);
        setBalance(bal);
        setRedeemCount(orders.total);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const result = await pointsService.getTransactions({ page, size: pageSize });
      setTransactions((prev) => (page === 1 ? result.records : [...prev, ...result.records]));
      setHasMore(result.current < result.pages);
    } catch {
      if (page === 1) setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const filtered = transactions.filter((tx) => {
    if (filter === 'all') return true;
    const positive = POSITIVE_TYPES.includes(tx.type);
    return filter === 'get' ? positive : !positive;
  });

  if (loading) {
    return (
      <Box sx={{ p: '32px' }}>
        <LoadingState type="detail" />
      </Box>
    );
  }

  const quickActions = [
    { key: 'qaShop', icon: ShoppingBagIcon, color: '#2563EB', bg: '#EFF6FF', onClick: () => navigate('/') },
    { key: 'qaHistory', icon: ReceiptLongIcon, color: '#D97706', bg: '#FFFBEB', onClick: () => navigate('/orders') },
    { key: 'qaRules', icon: InfoIcon, color: '#16A34A', bg: '#DCFCE7', onClick: () => {} },
    { key: 'qaHelp', icon: HelpIcon, color: '#DC2626', bg: '#FEE2E2', onClick: () => {} },
  ];

  const earnRules = [
    { icon: WorkHistoryIcon, color: '#2563EB', bg: '#EFF6FF', title: t('points.earn1Title'), desc: t('points.earn1Desc'), val: t('points.earn1Val') },
    { icon: MilitaryTechIcon, color: '#D97706', bg: '#FFFBEB', title: t('points.earn2Title'), desc: t('points.earn2Desc'), val: t('points.earn2Val') },
    { icon: CelebrationIcon, color: '#16A34A', bg: '#DCFCE7', title: t('points.earn3Title'), desc: t('points.earn3Desc'), val: t('points.earn3Val') },
    { icon: EmojiEventsIcon, color: '#DC2626', bg: '#FEE2E2', title: t('points.earn4Title'), desc: t('points.earn4Desc'), val: t('points.earn4Val') },
  ];

  const cardSx = {
    borderRadius: 'var(--radius-lg, 12px)',
    border: '1px solid',
    borderColor: '#F1F5F9',
    p: 3,
  } as const;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: '32px 0' }}>
      <Box sx={{ width: 960, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Hero */}
        {balance && (
          <Box
            sx={{
              borderRadius: 'var(--radius-xl, 16px)',
              bgcolor: '#1D4ED8',
              p: '32px 36px',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#BFDBFE' }}>
                  {t('points.heroLabel')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography sx={{ fontSize: 48, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                    {balance.balance.toLocaleString()}
                  </Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#BFDBFE' }}>
                    {t('points.pointsUnit')}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <StarsIcon sx={{ fontSize: 32, color: '#fff' }} />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {[
                { val: balance.totalEarned, label: t('points.statEarned') },
                { val: balance.totalSpent, label: t('points.statUsed') },
                { val: redeemCount, label: t('points.statRedeemCount') },
              ].map((s, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                      {s.val.toLocaleString()}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#BFDBFE' }}>{s.label}</Typography>
                  </Box>
                  {i < 2 && <Box sx={{ width: '1px', height: 36, bgcolor: '#3B82F6' }} />}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Quick Actions */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
          {quickActions.map((qa) => {
            const Icon = qa.icon;
            return (
              <Paper
                key={qa.key}
                elevation={0}
                onClick={qa.onClick}
                sx={{
                  ...cardSx,
                  p: '20px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.25,
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 2 },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: qa.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon sx={{ fontSize: 22, color: qa.color }} />
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{t(`points.${qa.key}`)}</Typography>
              </Paper>
            );
          })}
        </Box>

        {/* Earn Points Rules */}
        <Paper elevation={0} sx={cardSx}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{t('points.earnTitle')}</Typography>
          <Box sx={{ height: '1px', bgcolor: 'divider', my: 2.5 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {earnRules.map((r, i) => {
              const Icon = r.icon;
              return (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md, 8px)',
                      bgcolor: r.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 22, color: r.color }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{r.title}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{r.desc}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'success.main' }}>{r.val}</Typography>
                </Box>
              );
            })}
          </Box>
        </Paper>

        {/* Points Detail */}
        <Paper elevation={0} sx={cardSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{t('points.detailTitle')}</Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <Box
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 'var(--radius-sm, 4px)',
                      cursor: 'pointer',
                      bgcolor: active ? 'primary.main' : 'transparent',
                    }}
                  >
                    <Typography sx={{ fontSize: 13, color: active ? '#fff' : 'text.secondary', fontWeight: active ? 600 : 400 }}>
                      {t(f.label)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
          <Box sx={{ height: '1px', bgcolor: 'divider', my: 2 }} />

          {/* Table header */}
          <Box sx={{ display: 'flex', alignItems: 'center', pb: 1 }}>
            <Typography sx={{ flex: '0 0 150px', fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>{t('points.thTime')}</Typography>
            <Typography sx={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>{t('points.thDesc')}</Typography>
            <Typography sx={{ flex: '0 0 90px', fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>{t('points.thType')}</Typography>
            <Typography sx={{ flex: '0 0 100px', fontSize: 12, fontWeight: 600, color: 'text.secondary', textAlign: 'right' }}>{t('points.thAmount')}</Typography>
            <Typography sx={{ flex: '0 0 100px', fontSize: 12, fontWeight: 600, color: 'text.secondary', textAlign: 'right' }}>{t('points.thBalance')}</Typography>
          </Box>

          {txLoading ? (
            <LoadingState type="table" rows={5} />
          ) : filtered.length === 0 ? (
            <EmptyState message={t('points.noTransactions')} />
          ) : (
            <Box>
              {filtered.map((tx) => {
                const positive = POSITIVE_TYPES.includes(tx.type);
                return (
                  <Box
                    key={tx.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      py: 1.25,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ flex: '0 0 150px', fontSize: 13, color: 'text.secondary' }}>{formatDate(tx.createdAt)}</Typography>
                    <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{tx.description || tx.type}</Typography>
                    <Box sx={{ flex: '0 0 90px' }}>
                      <StatusChip status={tx.type} type="transaction" />
                    </Box>
                    <Typography sx={{ flex: '0 0 100px', fontSize: 13, fontWeight: 600, textAlign: 'right', color: positive ? 'success.main' : 'error.main' }}>
                      {positive ? '+' : '-'}{Math.abs(tx.points).toLocaleString()}
                    </Typography>
                    <Typography sx={{ flex: '0 0 100px', fontSize: 13, fontWeight: 500, textAlign: 'right' }}>{tx.balanceAfter.toLocaleString()}</Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          {hasMore && (
            <Box
              onClick={() => setPage((p) => p + 1)}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, pt: 1.5, cursor: 'pointer' }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'primary.main' }}>{t('points.viewMoreRecords')}</Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
