import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Pagination from '@mui/material/Pagination';
import TuneIcon from '@mui/icons-material/Tune';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import type { PointsAccount, PointsTransaction, TransactionType, UserInfo } from '../../../types';
import { pointsService } from '../../../services/pointsService';
import { userService } from '../../../services/userService';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';
import AdjustPointsDialog from '../../../components/AdjustPointsDialog';

const TYPE_STYLE: Record<TransactionType, { fg: string; bg: string }> = {
  admin_add: { fg: '#2563EB', bg: '#DBEAFE' },
  admin_deduct: { fg: '#2563EB', bg: '#DBEAFE' },
  spend: { fg: '#DC2626', bg: '#FEE2E2' },
  earn: { fg: '#16A34A', bg: '#DCFCE7' },
  refund: { fg: '#7C3AED', bg: '#F3E8FF' },
};

export default function UserPointsHistory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const [user, setUser] = useState<UserInfo | null>(null);
  const [account, setAccount] = useState<PointsAccount | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [adjustOpen, setAdjustOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [userList, acc, txns, allTxns] = await Promise.all([
        userService.getList({ page: 1, size: 999 }),
        pointsService.getUserAccount(userId),
        pointsService.getUserTransactions(userId, { page, size: pageSize }),
        pointsService.getUserTransactions(userId, { page: 1, size: 999 }),
      ]);
      const matched = userList.records.find((u) => u.id === userId) || null;
      setUser(matched);
      setAccount(acc);
      setTransactions(txns.records);
      setTotal(txns.total);
      setTotalPages(txns.pages);
      setAllTransactions(allTxns.records);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [userId, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Box sx={{ p: '32px' }}>
        <LoadingState type="detail" />
      </Box>
    );
  }

  if (!user || !account) {
    return (
      <Box sx={{ p: '32px' }}>
        <Typography>{t('common.noData')}</Typography>
      </Box>
    );
  }

  const formatDate = (s: string) =>
    new Date(s).toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  // Stats from all transactions
  const manualNet = allTransactions.reduce((sum, t) => {
    if (t.type === 'admin_add' || t.type === 'admin_deduct') return sum + t.points;
    return sum;
  }, 0);

  const cardSx = {
    borderRadius: 'var(--radius-lg, 12px)',
    border: '1px solid',
    borderColor: '#F1F5F9',
    p: 2,
    bgcolor: 'background.paper',
  } as const;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography
              onClick={() => navigate('/admin/users')}
              sx={{ fontSize: 13, color: 'primary.main', cursor: 'pointer' }}
            >
              {t('adminUsers.title')}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>/</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('adminPoints.history.breadcrumb')}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 22, fontWeight: 700, mt: 1 }}>
            {t('adminPoints.history.pageTitle', { name: user.displayName })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* User badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 2,
              py: 1,
              borderRadius: 'var(--radius-md, 8px)',
              bgcolor: '#F8FAFC',
              border: '1px solid',
              borderColor: '#F1F5F9',
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14, fontWeight: 600 }}>
              {user.displayName.charAt(0)}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                {user.empNo || user.username}
                {user.department ? ` · ${user.department}` : ''}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{user.displayName}</Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<TuneIcon sx={{ fontSize: 18 }} />}
            onClick={() => setAdjustOpen(true)}
            sx={{ borderRadius: 'var(--radius-md, 8px)', textTransform: 'none', fontWeight: 600 }}
          >
            {t('adminPoints.adjust')}
          </Button>
        </Box>
      </Box>

      {/* Stat cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
        <Box sx={cardSx}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{t('adminPoints.history.stats.earned')}</Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#16A34A', my: 0.5 }}>
            {account.totalEarned.toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
            {t('adminPoints.history.stats.earnedHint')}
          </Typography>
        </Box>
        <Box sx={cardSx}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{t('adminPoints.history.stats.spent')}</Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#DC2626', my: 0.5 }}>
            {account.totalSpent.toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
            {t('adminPoints.history.stats.spentHint')}
          </Typography>
        </Box>
        <Box sx={cardSx}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{t('adminPoints.history.stats.manual')}</Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#2563EB', my: 0.5 }}>
            {manualNet >= 0 ? '+' : ''}
            {manualNet.toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
            {t('adminPoints.history.stats.manualHint')}
          </Typography>
        </Box>
        <Box sx={cardSx}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{t('adminPoints.history.stats.count')}</Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 700, my: 0.5 }}>{allTransactions.length}</Typography>
          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
            {t('adminPoints.history.stats.countHint')}
          </Typography>
        </Box>
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.75,
            height: 38,
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid',
            borderColor: '#E2E8F0',
            bgcolor: 'background.paper',
          }}
        >
          <Typography sx={{ fontSize: 13 }}>{t('adminPoints.history.filterAll')}</Typography>
          <KeyboardArrowDownIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.75,
            height: 38,
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid',
            borderColor: '#E2E8F0',
            bgcolor: 'background.paper',
          }}
        >
          <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography sx={{ fontSize: 13 }}>{t('adminPoints.history.filterRecent')}</Typography>
          <KeyboardArrowDownIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        </Box>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', ml: 'auto' }}>
          {t('adminPoints.history.totalCount', { count: total })}
        </Typography>
      </Box>

      {/* Table */}
      <Paper
        elevation={0}
        sx={{ borderRadius: 'var(--radius-lg, 12px)', border: '1px solid', borderColor: '#F1F5F9', overflow: 'hidden' }}
      >
        {/* Head */}
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#F8FAFC', px: 2.5, py: 1.5 }}>
          <Typography sx={{ flex: '0 0 160px', fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
            {t('adminPoints.history.col.time')}
          </Typography>
          <Typography sx={{ flex: '0 0 110px', fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
            {t('adminPoints.history.col.type')}
          </Typography>
          <Typography sx={{ flex: '0 0 110px', fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
            {t('adminPoints.history.col.amount')}
          </Typography>
          <Typography sx={{ flex: '0 0 110px', fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
            {t('adminPoints.history.col.balance')}
          </Typography>
          <Typography sx={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
            {t('adminPoints.history.col.reason')}
          </Typography>
          <Typography sx={{ flex: '0 0 110px', fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
            {t('adminPoints.history.col.operator')}
          </Typography>
        </Box>

        {/* Rows */}
        {transactions.length === 0 ? (
          <EmptyState message={t('points.noTransactions')} />
        ) : (
          transactions.map((tx) => {
            const style = TYPE_STYLE[tx.type];
            const isAdmin = tx.type === 'admin_add' || tx.type === 'admin_deduct';
            const positive = tx.points >= 0;
            // For admin adjustments show selected reason + note; for others show description only
            const reason = isAdmin
              ? [tx.referenceId, tx.description].filter(Boolean).join(' · ')
              : tx.description || '';
            return (
              <Box
                key={tx.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2.5,
                  py: 1.5,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography sx={{ flex: '0 0 160px', fontSize: 12, color: 'text.secondary' }}>
                  {formatDate(tx.createdAt)}
                </Typography>
                <Box sx={{ flex: '0 0 110px' }}>
                  <Box sx={{ display: 'inline-block', bgcolor: style.bg, borderRadius: 12, px: 1.25, py: 0.4 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 500, color: style.fg }}>
                      {t(`adminPoints.history.type.${tx.type}`)}
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ flex: '0 0 110px', fontSize: 13, fontWeight: 600, color: positive ? '#16A34A' : '#DC2626' }}>
                  {positive ? '+' : ''}
                  {tx.points.toLocaleString()}
                </Typography>
                <Typography sx={{ flex: '0 0 110px', fontSize: 13, fontWeight: 500 }}>
                  {tx.balanceAfter.toLocaleString()}
                </Typography>
                <Typography sx={{ flex: 1, fontSize: 12 }}>{reason}</Typography>
                <Typography sx={{ flex: '0 0 110px', fontSize: 12, color: 'text.secondary' }}>
                  {isAdmin ? t('adminPoints.history.operatorAdmin') : t('adminPoints.history.operatorSystem')}
                </Typography>
              </Box>
            );
          })
        )}
      </Paper>

      {/* Pager */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            {t('adminPoints.history.totalCount', { count: total })}
          </Typography>
          <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" shape="rounded" />
        </Box>
      )}

      {/* Adjust Dialog */}
      <AdjustPointsDialog
        open={adjustOpen}
        user={{
          userId: user.id,
          displayName: user.displayName,
          username: user.username,
          empNo: user.empNo,
          department: user.department,
          balance: account.balance,
        }}
        onClose={() => setAdjustOpen(false)}
        onSuccess={() => {
          setPage(1);
          fetchData();
        }}
      />
    </Box>
  );
}
