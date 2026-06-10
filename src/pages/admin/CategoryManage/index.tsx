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
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../../types';
import { categoryService } from '../../../services/categoryService';
import PageHeader from '../../../components/PageHeader';
import ConfirmDialog from '../../../components/ConfirmDialog';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';

interface CategoryFormData {
  name: string;
  iconUrl: string;
  sortOrder: string;
}

const INITIAL_FORM: CategoryFormData = {
  name: '',
  iconUrl: '',
  sortOrder: '',
};

export default function CategoryManage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const list = await categoryService.getList();
      setCategories(list);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Create/Edit Dialog
  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData(INITIAL_FORM);
    setFormError('');
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      iconUrl: category.iconUrl || '',
      sortOrder: category.sortOrder != null ? String(category.sortOrder) : '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleFormChange = (field: keyof CategoryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return t('adminCategories.validation.name');
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
      if (editingCategory) {
        const data: UpdateCategoryRequest = {
          id: editingCategory.id,
          name: formData.name.trim(),
          ...(formData.iconUrl ? { iconUrl: formData.iconUrl } : {}),
          ...(formData.sortOrder ? { sortOrder: parseInt(formData.sortOrder, 10) } : {}),
        };
        await categoryService.update(data);
      } else {
        const data: CreateCategoryRequest = {
          name: formData.name.trim(),
          ...(formData.iconUrl ? { iconUrl: formData.iconUrl } : {}),
          ...(formData.sortOrder ? { sortOrder: parseInt(formData.sortOrder, 10) } : {}),
        };
        await categoryService.create(data);
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('adminCategories.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingId === null) return;
    setDeleteLoading(true);
    try {
      await categoryService.delete(deletingId);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchCategories();
    } catch {
      // keep dialog open on failure
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      <PageHeader
        title={t('adminCategories.title')}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            {t('adminCategories.create')}
          </Button>
        }
      />

      {/* Table */}
      {loading ? (
        <LoadingState type="table" rows={5} />
      ) : categories.length === 0 ? (
        <EmptyState message={t('adminCategories.empty')} />
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#F1F5F9', borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell>{t('adminCategories.col.name')}</TableCell>
                  <TableCell>{t('adminCategories.col.iconUrl')}</TableCell>
                  <TableCell>{t('adminCategories.col.sortOrder')}</TableCell>
                  <TableCell>{t('adminCategories.col.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>{category.name}</TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {category.iconUrl || '-'}
                    </TableCell>
                    <TableCell>{category.sortOrder}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openEditDialog(category)} title={t('adminCategories.edit')}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteClick(category.id)} title={t('adminCategories.delete')}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? t('adminCategories.editTitle') : t('adminCategories.createTitle')}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField
            label={t('adminCategories.form.name')}
            required
            value={formData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
          />
          <TextField
            label={t('adminCategories.form.iconUrl')}
            value={formData.iconUrl}
            onChange={(e) => handleFormChange('iconUrl', e.target.value)}
          />
          <TextField
            label={t('adminCategories.form.sortOrder')}
            type="number"
            value={formData.sortOrder}
            onChange={(e) => handleFormChange('sortOrder', e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            {t('adminCategories.cancel')}
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {t('adminCategories.submit')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('adminCategories.deleteTitle')}
        content={t('adminCategories.deleteContent')}
        loading={deleteLoading}
      />
    </Box>
  );
}
