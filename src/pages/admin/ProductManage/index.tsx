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
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { Product, Category, CreateProductRequest, UpdateProductRequest } from '../../../types';
import { productService } from '../../../services/productService';
import { categoryService } from '../../../services/categoryService';
import PageHeader from '../../../components/PageHeader';
import ConfirmDialog from '../../../components/ConfirmDialog';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';

interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  pointsPrice: string;
  marketPrice: string;
  stock: string;
  status: number;
  description: string;
  imageUrl: string;
}

const INITIAL_FORM: ProductFormData = {
  name: '',
  sku: '',
  category: '',
  pointsPrice: '',
  marketPrice: '',
  stock: '',
  status: 1,
  description: '',
  imageUrl: '',
};

export default function ProductManage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchName, setSearchName] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Status confirm
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<{ id: number; newStatus: number } | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Batch status
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [batchStatus, setBatchStatus] = useState<number>(1);
  const [batchLoading, setBatchLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        size: rowsPerPage,
        ...(searchName ? { name: searchName } : {}),
        ...(categoryFilter ? { category: categoryFilter } : {}),
      };
      const result = await productService.getList(params);
      setProducts(result.records);
      setTotal(result.total);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchName, categoryFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const list = await categoryService.getList();
      setCategories(list);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = () => {
    setPage(0);
    fetchProducts();
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Selection
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(products.map((p) => p.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Create/Edit Dialog
  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormData(INITIAL_FORM);
    setFormError('');
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      pointsPrice: String(product.pointsPrice),
      marketPrice: product.marketPrice != null ? String(product.marketPrice) : '',
      stock: String(product.stock),
      status: product.status,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleFormChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.name || formData.name.length < 2 || formData.name.length > 200) {
      return t('adminProducts.validation.name');
    }
    if (!formData.sku) {
      return t('adminProducts.validation.sku');
    }
    if (!formData.category) {
      return t('adminProducts.validation.category');
    }
    const price = parseInt(formData.pointsPrice, 10);
    if (!formData.pointsPrice || isNaN(price) || price <= 0 || !Number.isInteger(price)) {
      return t('adminProducts.validation.pointsPrice');
    }
    const stock = parseInt(formData.stock, 10);
    if (formData.stock === '' || isNaN(stock) || stock < 0) {
      return t('adminProducts.validation.stock');
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
      if (editingProduct) {
        const data: UpdateProductRequest = {
          id: editingProduct.id,
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          pointsPrice: parseInt(formData.pointsPrice, 10),
          stock: parseInt(formData.stock, 10),
          status: formData.status,
          ...(formData.marketPrice ? { marketPrice: parseFloat(formData.marketPrice) } : {}),
          ...(formData.description ? { description: formData.description } : {}),
          ...(formData.imageUrl ? { imageUrl: formData.imageUrl } : {}),
        };
        await productService.update(data);
      } else {
        const data: CreateProductRequest = {
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          pointsPrice: parseInt(formData.pointsPrice, 10),
          stock: parseInt(formData.stock, 10),
          status: formData.status,
          ...(formData.marketPrice ? { marketPrice: parseFloat(formData.marketPrice) } : {}),
          ...(formData.description ? { description: formData.description } : {}),
          ...(formData.imageUrl ? { imageUrl: formData.imageUrl } : {}),
        };
        await productService.create(data);
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('adminProducts.submitError'));
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
      await productService.delete(deletingId);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchProducts();
    } catch {
      // keep dialog open on failure
    } finally {
      setDeleteLoading(false);
    }
  };

  // Toggle status
  const handleToggleStatus = (id: number, currentStatus: number) => {
    setStatusTarget({ id, newStatus: currentStatus === 1 ? 0 : 1 });
    setStatusDialogOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!statusTarget) return;
    setStatusLoading(true);
    try {
      await productService.updateStatus(statusTarget.id, statusTarget.newStatus);
      setStatusDialogOpen(false);
      setStatusTarget(null);
      fetchProducts();
    } catch {
      // keep dialog open
    } finally {
      setStatusLoading(false);
    }
  };

  // Batch status update
  const handleBatchStatusClick = (status: number) => {
    setBatchStatus(status);
    setBatchDialogOpen(true);
  };

  const handleBatchConfirm = async () => {
    setBatchLoading(true);
    try {
      await productService.batchUpdateStatus(selected, batchStatus);
      setBatchDialogOpen(false);
      setSelected([]);
      fetchProducts();
    } catch {
      // keep dialog open
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      <PageHeader
        title={t('adminProducts.title')}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            {t('adminProducts.create')}
          </Button>
        }
      />

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder={t('adminProducts.searchPlaceholder')}
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ width: 260 }}
        />
        <TextField
          select
          size="small"
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
          sx={{ width: 180 }}
          label={t('adminProducts.categoryFilter')}
        >
          <MenuItem value="">{t('adminProducts.allCategories')}</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
          ))}
        </TextField>
        <Button variant="outlined" onClick={handleSearch}>
          {t('adminProducts.search')}
        </Button>
        {selected.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <Button size="small" variant="outlined" color="success" onClick={() => handleBatchStatusClick(1)}>
              {t('adminProducts.batchActivate')}
            </Button>
            <Button size="small" variant="outlined" color="warning" onClick={() => handleBatchStatusClick(0)}>
              {t('adminProducts.batchDeactivate')}
            </Button>
          </Box>
        )}
      </Box>

      {/* Table */}
      {loading ? (
        <LoadingState type="table" rows={5} />
      ) : products.length === 0 ? (
        <EmptyState message={t('adminProducts.empty')} />
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#F1F5F9', borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < products.length}
                      checked={products.length > 0 && selected.length === products.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>{t('adminProducts.col.name')}</TableCell>
                  <TableCell>{t('adminProducts.col.sku')}</TableCell>
                  <TableCell>{t('adminProducts.col.category')}</TableCell>
                  <TableCell>{t('adminProducts.col.pointsPrice')}</TableCell>
                  <TableCell>{t('adminProducts.col.stock')}</TableCell>
                  <TableCell>{t('adminProducts.col.status')}</TableCell>
                  <TableCell>{t('adminProducts.col.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(product.id)}
                        onChange={() => handleSelectOne(product.id)}
                      />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.pointsPrice.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: product.stock < 10 ? '#DC2626' : 'inherit', fontWeight: product.stock < 10 ? 600 : 400 }}>
                      {product.stock}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.status === 1 ? t('adminProducts.statusActive') : t('adminProducts.statusInactive')}
                        size="small"
                        color={product.status === 1 ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openEditDialog(product)} title={t('adminProducts.edit')}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteClick(product.id)} title={t('adminProducts.delete')}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <Button
                        size="small"
                        onClick={() => handleToggleStatus(product.id, product.status)}
                      >
                        {product.status === 1 ? t('adminProducts.deactivate') : t('adminProducts.activate')}
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? t('adminProducts.editTitle') : t('adminProducts.createTitle')}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField
            label={t('adminProducts.form.name')}
            required
            value={formData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            helperText={t('adminProducts.form.nameHelp')}
          />
          <TextField
            label={t('adminProducts.form.sku')}
            required
            value={formData.sku}
            onChange={(e) => handleFormChange('sku', e.target.value)}
          />
          <TextField
            select
            label={t('adminProducts.form.category')}
            required
            value={formData.category}
            onChange={(e) => handleFormChange('category', e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            label={t('adminProducts.form.pointsPrice')}
            required
            type="number"
            value={formData.pointsPrice}
            onChange={(e) => handleFormChange('pointsPrice', e.target.value)}
          />
          <TextField
            label={t('adminProducts.form.marketPrice')}
            type="number"
            value={formData.marketPrice}
            onChange={(e) => handleFormChange('marketPrice', e.target.value)}
          />
          <TextField
            label={t('adminProducts.form.stock')}
            required
            type="number"
            value={formData.stock}
            onChange={(e) => handleFormChange('stock', e.target.value)}
          />
          <TextField
            select
            label={t('adminProducts.form.status')}
            value={formData.status}
            onChange={(e) => handleFormChange('status', Number(e.target.value))}
          >
            <MenuItem value={1}>{t('adminProducts.statusActive')}</MenuItem>
            <MenuItem value={0}>{t('adminProducts.statusInactive')}</MenuItem>
          </TextField>
          <TextField
            label={t('adminProducts.form.description')}
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
          />
          <TextField
            label={t('adminProducts.form.imageUrl')}
            value={formData.imageUrl}
            onChange={(e) => handleFormChange('imageUrl', e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            {t('adminProducts.cancel')}
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {t('adminProducts.submit')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('adminProducts.deleteTitle')}
        content={t('adminProducts.deleteContent')}
        loading={deleteLoading}
      />

      {/* Status Toggle Confirm Dialog */}
      <ConfirmDialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        onConfirm={handleStatusConfirm}
        title={t('adminProducts.statusTitle')}
        content={statusTarget?.newStatus === 1 ? t('adminProducts.activateContent') : t('adminProducts.deactivateContent')}
        confirmText={t('adminProducts.confirm')}
        loading={statusLoading}
      />

      {/* Batch Status Confirm Dialog */}
      <ConfirmDialog
        open={batchDialogOpen}
        onClose={() => setBatchDialogOpen(false)}
        onConfirm={handleBatchConfirm}
        title={t('adminProducts.batchTitle')}
        content={batchStatus === 1 ? t('adminProducts.batchActivateContent') : t('adminProducts.batchDeactivateContent')}
        confirmText={t('adminProducts.confirm')}
        loading={batchLoading}
      />
    </Box>
  );
}
