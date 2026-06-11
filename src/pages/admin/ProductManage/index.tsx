import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import type { Product, Category, CreateProductRequest, UpdateProductRequest } from '../../../types';
import { productService } from '../../../services/productService';
import { categoryService } from '../../../services/categoryService';
import PageHeader from '../../../components/PageHeader';
import ConfirmDialog from '../../../components/ConfirmDialog';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  数码电子: { bg: '#DBEAFE', fg: '#2563EB' },
  生活家居: { bg: '#FEF3C7', fg: '#D97706' },
  美食餐饮: { bg: '#DCFCE7', fg: '#16A34A' },
  礼品卡券: { bg: '#DCFCE7', fg: '#16A34A' },
  办公用品: { bg: '#EDE9FE', fg: '#7C3AED' },
  运动户外: { bg: '#FCE7F3', fg: '#DB2777' },
  _default: { bg: '#DBEAFE', fg: '#2563EB' },
};

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
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const rowsPerPage = 12;
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

  // Selection
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
    navigate(`/admin/products/${product.id}/edit`);
  };

  const goToDetail = (id: number) => {
    navigate(`/admin/products/${id}`);
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
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder={t('adminProducts.searchPlaceholder')}
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ width: 280 }}
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
        <Typography sx={{ fontSize: 13, color: 'text.secondary', ml: 1 }}>
          {t('adminProducts.totalCount', { count: total })}
        </Typography>
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

      {/* Card Grid */}
      {loading ? (
        <LoadingState type="card" />
      ) : products.length === 0 ? (
        <EmptyState message={t('adminProducts.empty')} />
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {products.map((product) => {
              const palette = CATEGORY_COLORS[product.category] || CATEGORY_COLORS._default;
              const isSelected = selected.includes(product.id);
              return (
                <Paper
                  key={product.id}
                  elevation={0}
                  sx={{
                    borderRadius: 'var(--radius-lg, 12px)',
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : '#F1F5F9',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Selection checkbox */}
                  <Checkbox
                    size="small"
                    checked={isSelected}
                    onChange={() => handleSelectOne(product.id)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      zIndex: 1,
                      bgcolor: 'rgba(255,255,255,0.8)',
                      borderRadius: 1,
                      p: 0.5,
                    }}
                  />
                  {/* Image */}
                  <Box
                    onClick={() => goToDetail(product.id)}
                    sx={{
                      height: 140,
                      bgcolor: palette.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                  >
                    {product.imageUrl ? (
                      <Box component="img" src={product.imageUrl} alt={product.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ShoppingBagIcon sx={{ fontSize: 48, color: palette.fg }} />
                    )}
                  </Box>
                  {/* Body */}
                  <Box sx={{ p: '16px 16px 12px', display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1 }}>
                    <Typography
                      onClick={() => goToDetail(product.id)}
                      sx={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                    >
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ bgcolor: '#EFF6FF', borderRadius: '10px', px: 1, py: 0.25 }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#2563EB' }}>{product.category}</Typography>
                      </Box>
                      <Box
                        onClick={() => handleToggleStatus(product.id, product.status)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: product.status === 1 ? '#DCFCE7' : '#FEE2E2',
                          borderRadius: '10px',
                          px: 1,
                          py: 0.25,
                        }}
                      >
                        <Typography sx={{ fontSize: 11, fontWeight: 500, color: product.status === 1 ? '#166534' : '#991B1B' }}>
                          {product.status === 1 ? t('adminProducts.statusActiveBadge') : t('adminProducts.statusInactiveBadge')}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#D97706' }}>
                        {product.pointsPrice.toLocaleString()} {t('points.pointsUnit')}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: product.stock < 10 ? 'error.main' : 'text.secondary', fontWeight: product.stock < 10 ? 600 : 400 }}>
                        {t('adminProducts.stockLabel', { count: product.stock })}
                      </Typography>
                    </Box>
                  </Box>
                  {/* Actions */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, p: '0 12px 12px' }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                      onClick={() => openEditDialog(product)}
                      sx={{ minWidth: 'auto', color: 'text.secondary', textTransform: 'none', fontSize: 12 }}
                    >
                      {t('adminProducts.edit')}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                      onClick={() => handleDeleteClick(product.id)}
                      sx={{ minWidth: 'auto', color: 'error.main', textTransform: 'none', fontSize: 12 }}
                    >
                      {t('adminProducts.delete')}
                    </Button>
                  </Box>
                </Paper>
              );
            })}
          </Box>

          {/* Pager */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('adminProducts.showingRange', {
                from: total === 0 ? 0 : page * rowsPerPage + 1,
                to: Math.min((page + 1) * rowsPerPage, total),
                total,
              })}
            </Typography>
            <Pagination
              count={Math.max(1, Math.ceil(total / rowsPerPage))}
              page={page + 1}
              onChange={(_, value) => setPage(value - 1)}
              color="primary"
              shape="rounded"
            />
          </Box>
        </>
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
