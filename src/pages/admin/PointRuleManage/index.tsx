import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import AddIcon from '@mui/icons-material/Add';
import RuleIcon from '@mui/icons-material/Rule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TollIcon from '@mui/icons-material/Toll';
import GroupIcon from '@mui/icons-material/Group';
import type { PointsRule, PointsRuleStats } from '../../../types';
import { pointsRuleService } from '../../../services/pointsRuleService';
import PageHeader from '../../../components/PageHeader';
import StatCards from '../../../components/StatCards';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';
import PointsRuleDialog from '../../../components/PointsRuleDialog';
import PointsRuleIcon from '../../../components/PointsRuleIcon';

const PAGE_SIZE = 6;

export default function PointRuleManage() {
  const { t } = useTranslation();
  const [rules, setRules] = useState<PointsRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<PointsRuleStats>({
    total: 0,
    enabled: 0,
    monthlyGranted: 0,
    coveredEmployees: 0,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PointsRule | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const result = await pointsRuleService.getRules({ page, size: PAGE_SIZE });
      setRules(result.records);
      setTotal(result.total);
    } catch {
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchStats = useCallback(async () => {
    try {
      const s = await pointsRuleService.getStats();
      setStats(s);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);
  const fromRow = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const toRow = Math.min(page * PAGE_SIZE, total);

  const openCreate = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };

  const openEdit = (rule: PointsRule) => {
    setEditTarget(rule);
    setDialogOpen(true);
  };

  const handleDialogSuccess = (saved: PointsRule) => {
    setSnack({
      open: true,
      message: editTarget ? t('adminPointRules.updateSuccess') : t('adminPointRules.createSuccess'),
      severity: 'success',
    });
    fetchRules();
    fetchStats();
    void saved;
  };

  const handleToggle = async (rule: PointsRule) => {
    try {
      await pointsRuleService.toggle(rule.id, !rule.enabled);
      setSnack({
        open: true,
        message: rule.enabled ? t('adminPointRules.disableSuccess') : t('adminPointRules.enableSuccess'),
        severity: 'success',
      });
      fetchRules();
      fetchStats();
    } catch (err) {
      setSnack({
        open: true,
        message: err instanceof Error ? err.message : t('adminPointRules.dialog.submitError'),
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: '24px 32px' }}>
      <PageHeader
        title={t('adminPointRules.title')}
        subtitle={t('adminPointRules.subtitle')}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
            onClick={openCreate}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 2.5, py: 1.25 }}
          >
            {t('adminPointRules.addRule')}
          </Button>
        }
      />

      {/* Stats */}
      <StatCards
        items={[
          {
            key: 'total',
            label: t('adminPointRules.statTotal'),
            value: stats.total.toLocaleString(),
            icon: RuleIcon,
            iconColor: '#2563EB',
            iconBg: '#EFF6FF',
          },
          {
            key: 'enabled',
            label: t('adminPointRules.statEnabled'),
            value: stats.enabled.toLocaleString(),
            icon: CheckCircleIcon,
            iconColor: '#10B981',
            iconBg: '#ECFDF5',
          },
          {
            key: 'monthly',
            label: t('adminPointRules.statMonthly'),
            value: stats.monthlyGranted.toLocaleString(),
            icon: TollIcon,
            iconColor: '#F59E0B',
            iconBg: '#FFF7ED',
          },
          {
            key: 'covered',
            label: t('adminPointRules.statCovered'),
            value: stats.coveredEmployees.toLocaleString(),
            icon: GroupIcon,
            iconColor: '#8B5CF6',
            iconBg: '#F5F3FF',
          },
        ]}
      />

      {/* Table */}
      {loading ? (
        <LoadingState type="table" rows={6} />
      ) : rules.length === 0 ? (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#F1F5F9', borderRadius: '12px', p: 6 }}>
          <EmptyState message={t('adminPointRules.empty')} />
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#F1F5F9', borderRadius: '12px', overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ '& td, & th': { borderBottom: '1px solid', borderColor: '#F1F5F9' } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: 1.75 }}>
                    {t('adminPointRules.col.name')}
                  </TableCell>
                  <TableCell sx={{ width: 100, fontSize: 12, fontWeight: 600, color: 'text.secondary', py: 1.75 }}>
                    {t('adminPointRules.col.type')}
                  </TableCell>
                  <TableCell sx={{ width: 100, fontSize: 12, fontWeight: 600, color: 'text.secondary', py: 1.75 }}>
                    {t('adminPointRules.col.points')}
                  </TableCell>
                  <TableCell sx={{ width: 180, fontSize: 12, fontWeight: 600, color: 'text.secondary', py: 1.75 }}>
                    {t('adminPointRules.col.trigger')}
                  </TableCell>
                  <TableCell sx={{ width: 70, fontSize: 12, fontWeight: 600, color: 'text.secondary', py: 1.75 }}>
                    {t('adminPointRules.col.status')}
                  </TableCell>
                  <TableCell sx={{ width: 90, fontSize: 12, fontWeight: 600, color: 'text.secondary', py: 1.75 }}>
                    {t('adminPointRules.col.actions')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id} hover sx={{ opacity: rule.enabled ? 1 : 0.6, '& td': { py: 1.75 } }}>
                    {/* Name + desc */}
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '6px',
                              bgcolor: rule.iconBg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <PointsRuleIcon name={rule.icon} sx={{ fontSize: 16, color: rule.iconColor }} />
                          </Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>
                            {rule.name}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 11, color: 'text.secondary', pl: '36px' }}>
                          {rule.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    {/* Type chip */}
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          px: 1,
                          py: '3px',
                          borderRadius: '4px',
                          bgcolor: rule.iconBg,
                        }}
                      >
                        <Typography sx={{ fontSize: 11, fontWeight: 500, color: rule.iconColor }}>
                          {t(`adminPointRules.type.${rule.type}`)}
                        </Typography>
                      </Box>
                    </TableCell>
                    {/* Points */}
                    <TableCell>
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary' }}>
                        {rule.pointsValue}
                      </Typography>
                    </TableCell>
                    {/* Trigger */}
                    <TableCell>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {rule.triggerCondition}
                      </Typography>
                    </TableCell>
                    {/* Status */}
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          px: 1.25,
                          py: 0.5,
                          borderRadius: 12,
                          bgcolor: rule.enabled ? '#DCFCE7' : '#FEE2E2',
                        }}
                      >
                        <Typography
                          sx={{ fontSize: 11, fontWeight: 500, color: rule.enabled ? '#166534' : '#991B1B' }}
                        >
                          {rule.enabled
                            ? t('adminPointRules.statusEnabled')
                            : t('adminPointRules.statusDisabled')}
                        </Typography>
                      </Box>
                    </TableCell>
                    {/* Actions */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography
                          onClick={() => openEdit(rule)}
                          sx={{ fontSize: 12, fontWeight: 500, color: 'primary.main', cursor: 'pointer' }}
                        >
                          {t('adminPointRules.actionEdit')}
                        </Typography>
                        <Typography
                          onClick={() => handleToggle(rule)}
                          sx={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: rule.enabled ? '#D97706' : '#10B981',
                            cursor: 'pointer',
                          }}
                        >
                          {rule.enabled
                            ? t('adminPointRules.actionDisable')
                            : t('adminPointRules.actionEnable')}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Pagination */}
      {!loading && total > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            {t('adminPointRules.paginationText', { from: fromRow, to: toRow, total })}
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

      {/* Add / Edit Dialog */}
      <PointsRuleDialog
        open={dialogOpen}
        rule={editTarget}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleDialogSuccess}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
