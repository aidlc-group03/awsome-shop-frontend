import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import HistoryIcon from '@mui/icons-material/History';
import TuneIcon from '@mui/icons-material/Tune';
import GroupIcon from '@mui/icons-material/Group';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import type { UserInfo, UserRole, PointsAccount } from '../../../types';
import { userService } from '../../../services/userService';
import { pointsService } from '../../../services/pointsService';
import PageHeader from '../../../components/PageHeader';
import StatCards from '../../../components/StatCards';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';
import AdjustPointsDialog from '../../../components/AdjustPointsDialog';

interface UserFormData {
  username: string;
  password: string;
  displayName: string;
  email: string;
  empNo: string;
  department: string;
  role: UserRole;
}

const INITIAL_FORM: UserFormData = {
  username: '',
  password: '',
  displayName: '',
  email: '',
  empNo: '',
  department: '',
  role: 'employee',
};

const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#16A34A', '#DC2626', '#D97706', '#0EA5E9'];

function avatarColor(seed: number): string {
  return AVATAR_COLORS[seed % AVATAR_COLORS.length];
}

export default function UserManage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [accounts, setAccounts] = useState<Record<number, PointsAccount>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, newThisMonth: 0 });

  // Create dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Adjust points dialog
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<UserInfo | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        size: rowsPerPage,
        ...(keyword ? { keyword } : {}),
      };
      const result = await userService.getList(params);
      const filtered = roleFilter ? result.records.filter((u) => u.role === roleFilter) : result.records;
      setUsers(filtered);
      setTotal(roleFilter ? filtered.length : result.total);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, keyword, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Load points accounts to fill 积分余额 / 兑换次数
  const loadAccounts = useCallback(async () => {
    try {
      const res = await pointsService.getAccounts({ page: 1, size: 999 });
      const map: Record<number, PointsAccount> = {};
      res.records.forEach((a) => {
        map[a.userId] = a;
      });
      setAccounts(map);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts, users]);

  // Stats
  useEffect(() => {
    userService
      .getList({ page: 1, size: 999 })
      .then((res) => {
        const now = new Date();
        setStats({
          total: res.total,
          active: res.records.filter((u) => u.status === 1).length,
          newThisMonth: res.records.filter((u) => {
            const d = new Date(u.createdAt);
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
          }).length,
        });
      })
      .catch(() => {});
  }, []);

  const handleSearch = () => {
    setPage(0);
    fetchUsers();
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openCreateDialog = () => {
    setFormData(INITIAL_FORM);
    setFormError('');
    setDialogOpen(true);
  };

  const openAdjustDialog = (user: UserInfo) => {
    setAdjustTarget(user);
    setAdjustOpen(true);
  };

  const handleFormChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!formData.username || formData.username.length < 4 || formData.username.length > 32 || !usernameRegex.test(formData.username)) {
      return t('adminUsers.validation.username');
    }
    if (!formData.password || formData.password.length < 6) {
      return t('adminUsers.validation.password');
    }
    if (!formData.displayName || formData.displayName.length < 2 || formData.displayName.length > 50) {
      return t('adminUsers.validation.displayName');
    }
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        return t('adminUsers.validation.email');
      }
    }
    if (!formData.role) {
      return t('adminUsers.validation.role');
    }
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await userService.create({
        username: formData.username,
        password: formData.password,
        displayName: formData.displayName,
        role: formData.role,
        ...(formData.email ? { email: formData.email } : {}),
        ...(formData.empNo ? { empNo: formData.empNo } : {}),
        ...(formData.department ? { department: formData.department } : {}),
      });
      setDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('adminUsers.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      <PageHeader
        title={t('adminUsers.title')}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            {t('adminUsers.create')}
          </Button>
        }
      />

      <StatCards
        items={[
          { key: 'total', label: t('adminUsers.statTotal'), value: stats.total.toLocaleString(), icon: GroupIcon, iconColor: '#2563EB', iconBg: '#EFF6FF' },
          { key: 'active', label: t('adminUsers.statActive'), value: stats.active.toLocaleString(), icon: HowToRegIcon, iconColor: '#16A34A', iconBg: '#DCFCE7' },
          { key: 'new', label: t('adminUsers.statNew'), value: stats.newThisMonth.toLocaleString(), icon: PersonAddIcon, iconColor: '#D97706', iconBg: '#FEF3C7' },
        ]}
      />

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder={t('adminUsers.searchPlaceholder')}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ width: 280 }}
        />
        <TextField
          select
          size="small"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
          sx={{ width: 160 }}
          label={t('adminUsers.col.role')}
        >
          <MenuItem value="">—</MenuItem>
          <MenuItem value="employee">{t('adminUsers.roleEmployee')}</MenuItem>
          <MenuItem value="admin">{t('adminUsers.roleAdmin')}</MenuItem>
        </TextField>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', ml: 'auto' }}>
          {t('adminUsers.totalCount', { count: stats.total })}
        </Typography>
      </Box>

      {/* Table */}
      {loading ? (
        <LoadingState type="table" rows={5} />
      ) : users.length === 0 ? (
        <EmptyState message={t('adminUsers.empty')} />
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#F1F5F9', borderRadius: 'var(--radius-lg, 12px)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>{t('adminUsers.col.userInfo')}</TableCell>
                  <TableCell sx={{ width: 140, fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>{t('adminUsers.col.department')}</TableCell>
                  <TableCell sx={{ width: 110, fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>{t('adminUsers.col.balance')}</TableCell>
                  <TableCell sx={{ width: 100, fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>{t('adminUsers.col.redeemCount')}</TableCell>
                  <TableCell sx={{ width: 110, fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>{t('adminUsers.col.role')}</TableCell>
                  <TableCell sx={{ width: 90, fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>{t('adminUsers.col.status')}</TableCell>
                  <TableCell sx={{ width: 130, fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>{t('adminUsers.col.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => {
                  const account = accounts[user.id];
                  return (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: avatarColor(user.id), fontSize: 14, fontWeight: 600 }}>
                            {user.displayName?.charAt(0) ?? user.username.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{user.displayName}</Typography>
                            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                              {user.empNo ? t('adminUsers.empNoLabel', { empNo: user.empNo }) : user.username}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: 13 }}>{user.department || '-'}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: account && account.balance > 0 ? '#D97706' : 'text.disabled' }}>
                          {account ? account.balance.toLocaleString() : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: 13 }}>{account?.redeemCount ?? '-'}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.25,
                            py: 0.5,
                            borderRadius: 12,
                            bgcolor: user.role === 'admin' ? '#FEF3C7' : '#DBEAFE',
                          }}
                        >
                          <Typography sx={{ fontSize: 11, fontWeight: 500, color: user.role === 'admin' ? '#92400E' : '#1E40AF' }}>
                            {user.role === 'admin' ? t('adminUsers.roleAdmin') : t('adminUsers.roleEmployee')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.25,
                            py: 0.5,
                            borderRadius: 12,
                            bgcolor: user.status === 1 ? '#DCFCE7' : '#FEE2E2',
                          }}
                        >
                          <Typography sx={{ fontSize: 11, fontWeight: 500, color: user.status === 1 ? '#166534' : '#991B1B' }}>
                            {user.status === 1 ? t('adminUsers.statusActive') : t('adminUsers.statusInactive')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                          <IconButton
                            size="small"
                            title={t('adminUsers.adjustPoints')}
                            onClick={() => openAdjustDialog(user)}
                          >
                            <TuneIcon sx={{ fontSize: 18, color: '#D97706' }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            title={t('adminUsers.viewPoints')}
                            onClick={() => navigate(`/admin/users/${user.id}/points`)}
                          >
                            <HistoryIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                          </IconButton>
                          <IconButton size="small" title={t('adminProducts.edit')}>
                            <EditIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            title={user.status === 1 ? t('adminUsers.blockUser') : t('adminUsers.unblockUser')}
                          >
                            {user.status === 1 ? (
                              <BlockIcon sx={{ fontSize: 18, color: '#D97706' }} />
                            ) : (
                              <LockOpenIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                            )}
                          </IconButton>
                        </Box>
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

      {/* Create User Dialog */}
      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('adminUsers.createTitle')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField
            label={t('adminUsers.form.username')}
            required
            value={formData.username}
            onChange={(e) => handleFormChange('username', e.target.value)}
            helperText={t('adminUsers.form.usernameHelp')}
          />
          <TextField
            label={t('adminUsers.form.password')}
            required
            type="password"
            value={formData.password}
            onChange={(e) => handleFormChange('password', e.target.value)}
            helperText={t('adminUsers.form.passwordHelp')}
          />
          <TextField
            label={t('adminUsers.form.displayName')}
            required
            value={formData.displayName}
            onChange={(e) => handleFormChange('displayName', e.target.value)}
            helperText={t('adminUsers.form.displayNameHelp')}
          />
          <TextField
            label={t('adminUsers.form.empNo')}
            value={formData.empNo}
            onChange={(e) => handleFormChange('empNo', e.target.value)}
          />
          <TextField
            label={t('adminUsers.form.department')}
            value={formData.department}
            onChange={(e) => handleFormChange('department', e.target.value)}
          />
          <TextField
            label={t('adminUsers.form.email')}
            type="email"
            value={formData.email}
            onChange={(e) => handleFormChange('email', e.target.value)}
          />
          <TextField
            select
            label={t('adminUsers.form.role')}
            required
            value={formData.role}
            onChange={(e) => handleFormChange('role', e.target.value)}
          >
            <MenuItem value="employee">{t('adminUsers.roleEmployee')}</MenuItem>
            <MenuItem value="admin">{t('adminUsers.roleAdmin')}</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            {t('adminUsers.cancel')}
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {t('adminUsers.submit')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Adjust Points Dialog */}
      <AdjustPointsDialog
        open={adjustOpen}
        user={
          adjustTarget
            ? {
                userId: adjustTarget.id,
                displayName: adjustTarget.displayName,
                username: adjustTarget.username,
                empNo: adjustTarget.empNo,
                department: adjustTarget.department,
                balance: accounts[adjustTarget.id]?.balance ?? 0,
              }
            : null
        }
        onClose={() => setAdjustOpen(false)}
        onSuccess={loadAccounts}
      />
    </Box>
  );
}
