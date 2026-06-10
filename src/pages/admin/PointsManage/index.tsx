import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import type { PointsAccount } from '../../../types';
import { pointsService } from '../../../services/pointsService';
import PageHeader from '../../../components/PageHeader';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';

interface PointsFormData {
  points: string;
  description: string;
}

const INITIAL_FORM: PointsFormData = {
  points: '',
  description: '',
};

export default function PointsManage() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<PointsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');

  // Grant dialog
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantTarget, setGrantTarget] = useState<PointsAccount | null>(null);
  const [grantForm, setGrantForm] = useState<PointsFormData>(INITIAL_FORM);
  const [grantError, setGrantError] = useState('');
  const [grantLoading, setGrantLoading] = useState(false);

  // Deduct dialog
  const [deductOpen, setDeductOpen] = useState(false);
  const [deductTarget, setDeductTarget] = useState<PointsAccount | null>(null);
  const [deductForm, setDeductForm] = useState<PointsFormData>(INITIAL_FORM);
  const [deductError, setDeductError] = useState('');
  const [deductLoading, setDeductLoading] = useState(false);

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

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Grant Points
  const openGrantDialog = (account: PointsAccount) => {
    setGrantTarget(account);
    setGrantForm(INITIAL_FORM);
    setGrantError('');
    setGrantOpen(true);
  };

  const handleGrantSubmit = async () => {
    if (!grantTarget) return;
    const points = parseInt(grantForm.points, 10);
    if (!grantForm.points || isNaN(points) || points <= 0 || !Number.isInteger(points)) {
      setGrantError(t('adminPoints.validation.points'));
      return;
    }
    if (!grantForm.description.trim()) {
      setGrantError(t('adminPoints.validation.description'));
      return;
    }
    setGrantLoading(true);
    setGrantError('');
    try {
      await pointsService.grant({
        userId: grantTarget.userId,
        points,
        description: grantForm.description.trim(),
      });
      setGrantOpen(false);
      fetchAccounts();
    } catch (err) {
      setGrantError(err instanceof Error ? err.message : t('adminPoints.submitError'));
    } finally {
      setGrantLoading(false);
    }
  };

  // Deduct Points
  const openDeductDialog = (account: PointsAccount) => {
    setDeductTarget(account);
    setDeductForm(INITIAL_FORM);
    setDeductError('');
    setDeductOpen(true);
  };

  const handleDeductSubmit = async () => {
    if (!deductTarget) return;
    const points = parseInt(deductForm.points, 10);
    if (!deductForm.points || isNaN(points) || points <= 0 || !Number.isInteger(points)) {
      setDeductError(t('adminPoints.validation.points'));
      return;
    }
    if (points > deductTarget.balance) {
      setDeductError(t('adminPoints.validation.exceedsBalance'));
      return;
    }
    if (!deductForm.description.trim()) {
      setDeductError(t('adminPoints.validation.description'));
      return;
    }
    setDeductLoading(true);
    setDeductError('');
    try {
      await pointsService.deduct({
        userId: deductTarget.userId,
        points,
        description: deductForm.description.trim(),
      });
      setDeductOpen(false);
      fetchAccounts();
    } catch (err) {
      setDeductError(err instanceof Error ? err.message : t('adminPoints.submitError'));
    } finally {
      setDeductLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      <PageHeader
        title={t('adminPoints.title')}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" startIcon={<AddIcon />} color="success" onClick={() => accounts.length > 0 && openGrantDialog(accounts[0])}>
              {t('adminPoints.grant')}
            </Button>
            <Button variant="contained" startIcon={<RemoveIcon />} color="warning" onClick={() => accounts.length > 0 && openDeductDialog(accounts[0])}>
              {t('adminPoints.deduct')}
            </Button>
          </Box>
        }
      />

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
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#F1F5F9', borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell>{t('adminPoints.col.username')}</TableCell>
                  <TableCell>{t('adminPoints.col.displayName')}</TableCell>
                  <TableCell>{t('adminPoints.col.balance')}</TableCell>
                  <TableCell>{t('adminPoints.col.totalEarned')}</TableCell>
                  <TableCell>{t('adminPoints.col.totalSpent')}</TableCell>
                  <TableCell>{t('adminPoints.col.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id} hover>
                    <TableCell>{account.username}</TableCell>
                    <TableCell>{account.displayName}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{account.balance.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: '#16A34A' }}>{account.totalEarned.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: '#DC2626' }}>{account.totalSpent.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button size="small" color="success" onClick={() => openGrantDialog(account)}>
                        {t('adminPoints.grantBtn')}
                      </Button>
                      <Button size="small" color="warning" onClick={() => openDeductDialog(account)}>
                        {t('adminPoints.deductBtn')}
                      </Button>
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
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      {/* Grant Points Dialog */}
      <Dialog open={grantOpen} onClose={() => !grantLoading && setGrantOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('adminPoints.grantTitle')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {grantError && <Alert severity="error">{grantError}</Alert>}
          {grantTarget && (
            <Typography variant="body2" color="text.secondary">
              {t('adminPoints.targetUser')}: {grantTarget.displayName} ({grantTarget.username})
            </Typography>
          )}
          <TextField
            label={t('adminPoints.form.points')}
            required
            type="number"
            value={grantForm.points}
            onChange={(e) => setGrantForm((prev) => ({ ...prev, points: e.target.value }))}
            inputProps={{ min: 1 }}
          />
          <TextField
            label={t('adminPoints.form.description')}
            required
            multiline
            rows={3}
            value={grantForm.description}
            onChange={(e) => setGrantForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setGrantOpen(false)} disabled={grantLoading}>
            {t('adminPoints.cancel')}
          </Button>
          <Button variant="contained" color="success" onClick={handleGrantSubmit} disabled={grantLoading}>
            {t('adminPoints.submit')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deduct Points Dialog */}
      <Dialog open={deductOpen} onClose={() => !deductLoading && setDeductOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('adminPoints.deductTitle')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {deductError && <Alert severity="error">{deductError}</Alert>}
          {deductTarget && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t('adminPoints.targetUser')}: {deductTarget.displayName} ({deductTarget.username})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t('adminPoints.currentBalance')}: {deductTarget.balance.toLocaleString()}
              </Typography>
            </Box>
          )}
          <TextField
            label={t('adminPoints.form.points')}
            required
            type="number"
            value={deductForm.points}
            onChange={(e) => setDeductForm((prev) => ({ ...prev, points: e.target.value }))}
            inputProps={{ min: 1, max: deductTarget?.balance }}
            helperText={deductTarget ? `${t('adminPoints.maxDeduct')}: ${deductTarget.balance}` : ''}
          />
          <TextField
            label={t('adminPoints.form.description')}
            required
            multiline
            rows={3}
            value={deductForm.description}
            onChange={(e) => setDeductForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeductOpen(false)} disabled={deductLoading}>
            {t('adminPoints.cancel')}
          </Button>
          <Button variant="contained" color="warning" onClick={handleDeductSubmit} disabled={deductLoading}>
            {t('adminPoints.submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
