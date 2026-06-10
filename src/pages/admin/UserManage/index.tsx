import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
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
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import type { UserInfo, UserRole } from '../../../types';
import { userService } from '../../../services/userService';
import PageHeader from '../../../components/PageHeader';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';

interface UserFormData {
  username: string;
  password: string;
  displayName: string;
  email: string;
  role: UserRole;
}

const INITIAL_FORM: UserFormData = {
  username: '',
  password: '',
  displayName: '',
  email: '',
  role: 'employee',
};

export default function UserManage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');

  // Create dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        size: rowsPerPage,
        ...(keyword ? { keyword } : {}),
      };
      const result = await userService.getList(params);
      setUsers(result.records);
      setTotal(result.total);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, keyword]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  // Create Dialog
  const openCreateDialog = () => {
    setFormData(INITIAL_FORM);
    setFormError('');
    setDialogOpen(true);
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
      });
      setDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('adminUsers.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
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

      {/* Search */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder={t('adminUsers.searchPlaceholder')}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ width: 300 }}
        />
        <Button variant="outlined" onClick={handleSearch}>
          {t('adminUsers.search')}
        </Button>
      </Box>

      {/* Table */}
      {loading ? (
        <LoadingState type="table" rows={5} />
      ) : users.length === 0 ? (
        <EmptyState message={t('adminUsers.empty')} />
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#F1F5F9', borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell>{t('adminUsers.col.username')}</TableCell>
                  <TableCell>{t('adminUsers.col.displayName')}</TableCell>
                  <TableCell>{t('adminUsers.col.email')}</TableCell>
                  <TableCell>{t('adminUsers.col.role')}</TableCell>
                  <TableCell>{t('adminUsers.col.status')}</TableCell>
                  <TableCell>{t('adminUsers.col.createdAt')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.displayName}</TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role === 'admin' ? t('adminUsers.roleAdmin') : t('adminUsers.roleEmployee')}
                        size="small"
                        color={user.role === 'admin' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status === 1 ? t('adminUsers.statusActive') : t('adminUsers.statusInactive')}
                        size="small"
                        color={user.status === 1 ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
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
    </Box>
  );
}
