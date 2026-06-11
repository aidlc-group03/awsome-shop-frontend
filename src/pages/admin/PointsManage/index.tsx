import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import TuneIcon from '@mui/icons-material/Tune';
import HistoryIcon from '@mui/icons-material/History';
import type { PointsAccount } from '../../../types';
import { pointsService } from '../../../services/pointsService';
import PageHeader from '../../../components/PageHeader';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';
import AdjustPointsDialog from '../../../components/AdjustPointsDialog';

export default function PointsManage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<PointsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');

  // Adjust dialog
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<PointsAccount | null>(null);
  const [adjustMode, setAdjustMode] = useState<'add' | 'deduct'>('add');

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        size: rowsPerPage,
        ...(keyword ? { keyword } : {}),
      };
      const result = await pointsService.getAccounts(params);
      setAccounts(result.records);
      setTotal(result.total);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, keyword]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSearch = () => {
    setPage(0);
    fetchAccounts();
  };

  const openAdjust = (account: PointsAccount, mode: 'add' | 'deduct') => {
    setAdjustTarget(account);
    setAdjustMode(mode);
    setAdjustOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      <PageHeader title={t('adminPoints.title')} />

      {/* Search */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder={t('adminPoints.searchPlaceholder')}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ width: 300 }}
        />
        <Button variant="outlined" onClick={handleSearch}>
          {t('adminPoints.search')}
        </Button>
      </Box>

      {/* Table */}
      {loading ? (
        <LoadingState type="table" rows={5} />
      ) : accounts.length === 0 ? (
        <EmptyState message={t('adminPoints.empty')} />
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#F1F5F9', borderRadius: 'var(--radius-lg, 12px)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell>{t('adminPoints.col.username')}</TableCell>
                  <TableCell>{t('adminPoints.col.displayName')}</TableCell>
                  <TableCell>{t('adminPoints.col.balance')}</TableCell>
                  <TableCell>{t('adminPoints.col.totalEarned')}</TableCell>
                  <TableCell>{t('adminPoints.col.totalSpent')}</TableCell>
                  <TableCell sx={{ width: 200 }}>{t('adminPoints.col.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id} hover>
                    <TableCell>{account.username}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{account.displayName}</Typography>
                        {account.department && (
                          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{account.department}</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#D97706' }}>{account.balance.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: '#16A34A' }}>{account.totalEarned.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: '#DC2626' }}>{account.totalSpent.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
                        onClick={() => openAdjust(account, 'add')}
                        sx={{ textTransform: 'none', mr: 0.5 }}
                      >
                        {t('adminPoints.adjust')}
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/users/${account.userId}/points`)}
                        title={t('adminUsers.viewPoints')}
                      >
                        <HistoryIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      {/* Adjust Dialog */}
      <AdjustPointsDialog
        open={adjustOpen}
        user={
          adjustTarget
            ? {
                userId: adjustTarget.userId,
                displayName: adjustTarget.displayName,
                username: adjustTarget.username,
                empNo: adjustTarget.empNo,
                department: adjustTarget.department,
                balance: adjustTarget.balance,
              }
            : null
        }
        initialMode={adjustMode}
        onClose={() => setAdjustOpen(false)}
        onSuccess={fetchAccounts}
      />
    </Box>
  );
}
