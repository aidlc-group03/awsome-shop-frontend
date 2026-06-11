import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AddIcon from '@mui/icons-material/Add';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import type { Product, UpdateProductRequest } from '../../../types';
import { productService } from '../../../services/productService';
import LoadingState from '../../../components/LoadingState';
import ConfirmDialog from '../../../components/ConfirmDialog';
import StockAdjustDialog from '../../../components/StockAdjustDialog';
import DelistConfirmDialog from '../../../components/DelistConfirmDialog';
import ImageUploadDialog from '../../../components/ImageUploadDialog';

const cardSx = {
  borderRadius: '12px',
  border: '1px solid #F1F5F9',
  bgcolor: '#fff',
  p: 3,
} as const;

function formatDateTime(s: string | null | undefined): string {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}:${pad(d.getSeconds())}`;
}

function Field({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'text.secondary' }}>{label}</Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 500, color: accent ?? 'text.primary' }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function AdminProductDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [mainIdx, setMainIdx] = useState(0);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>(
    { open: false, message: '', severity: 'success' },
  );

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const p = await productService.getById(Number(id));
      setProduct(p);
      setMainIdx(0);
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Box sx={{ p: '24px 32px' }}>
        <LoadingState type="detail" />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ p: '24px 32px' }}>
        <Typography>{t('adminProductDetail.notFound')}</Typography>
        <Button onClick={() => navigate('/admin/products')} sx={{ mt: 2, textTransform: 'none' }}>
          {t('adminProductDetail.back')}
        </Button>
      </Box>
    );
  }

  const isActive = product.status === 1;
  const colors = product.colors
    ? product.colors.split(',').map((c) => c.trim()).filter(Boolean)
    : [];
  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];
  const activeIdx = gallery.length > 0 ? Math.min(mainIdx, gallery.length - 1) : 0;
  const mainImage = gallery[activeIdx] ?? null;

  const handleStatusConfirm = async () => {
    setStatusLoading(true);
    try {
      await productService.updateStatus(product.id, isActive ? 0 : 1);
      setStatusOpen(false);
      setSnack({ open: true, message: t('adminProductDetail.delistDialog.success'), severity: 'success' });
      fetchData();
    } catch (err) {
      setSnack({
        open: true,
        message: err instanceof Error ? err.message : t('adminProducts.submitError'),
        severity: 'error',
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await productService.delete(product.id);
      setDeleteOpen(false);
      navigate('/admin/products');
    } catch (err) {
      setSnack({
        open: true,
        message: err instanceof Error ? err.message : t('adminProducts.submitError'),
        severity: 'error',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleImageSave = async (images: string[]) => {
    try {
      const data: UpdateProductRequest = {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        pointsPrice: product.pointsPrice,
        stock: product.stock,
        status: product.status,
        imageUrl: images[0] ?? '',
        images,
        ...(product.brand ? { brand: product.brand } : {}),
        ...(product.marketPrice != null ? { marketPrice: product.marketPrice } : {}),
        ...(product.description ? { description: product.description } : {}),
        ...(product.subtitle ? { subtitle: product.subtitle } : {}),
        ...(product.deliveryMethod ? { deliveryMethod: product.deliveryMethod } : {}),
        ...(product.serviceGuarantee ? { serviceGuarantee: product.serviceGuarantee } : {}),
        ...(product.promotion ? { promotion: product.promotion } : {}),
        ...(product.colors ? { colors: product.colors } : {}),
        ...(product.specs ? { specs: product.specs } : {}),
      };
      const updated = await productService.update(data);
      setProduct(updated);
      setMainIdx(0);
      setSnack({ open: true, message: t('adminProductDetail.edit.saveSuccess'), severity: 'success' });
    } catch (err) {
      setSnack({
        open: true,
        message: err instanceof Error ? err.message : t('adminProducts.submitError'),
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography
              onClick={() => navigate('/admin/products')}
              sx={{ fontSize: 13, color: 'primary.main', cursor: 'pointer' }}
            >
              {t('adminProductDetail.breadcrumbList')}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>/</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('adminProductDetail.breadcrumbDetail')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: 'text.primary' }}>
              {product.name}
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                px: 1.5,
                py: 0.5,
                borderRadius: 12,
                bgcolor: isActive ? '#DCFCE7' : '#FEE2E2',
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: isActive ? '#166534' : '#991B1B' }}>
                {isActive
                  ? t('adminProductDetail.statusActive')
                  : t('adminProductDetail.statusInactive')}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Button
            variant="outlined"
            startIcon={isActive ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
            onClick={() => setStatusOpen(true)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: 13,
              fontWeight: 500,
              borderColor: isActive ? '#D97706' : '#2563EB',
              color: isActive ? '#D97706' : '#2563EB',
              px: 2,
              py: 1,
            }}
          >
            {isActive ? t('adminProductDetail.actions.delist') : t('adminProductDetail.actions.relist')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Inventory2Icon sx={{ fontSize: 18 }} />}
            onClick={() => setStockOpen(true)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: 13,
              fontWeight: 500,
              borderColor: '#E2E8F0',
              color: 'text.primary',
              px: 2,
              py: 1,
            }}
          >
            {t('adminProductDetail.actions.adjustStock')}
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
            sx={{ borderRadius: '8px', textTransform: 'none', fontSize: 13, fontWeight: 600, px: 2, py: 1 }}
          >
            {t('adminProductDetail.actions.edit')}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon sx={{ fontSize: 18 }} />}
            onClick={() => setDeleteOpen(true)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: 13,
              fontWeight: 500,
              borderColor: 'error.main',
              color: 'error.main',
              px: 2,
              py: 1,
            }}
          >
            {t('adminProductDetail.actions.delete')}
          </Button>
        </Box>
      </Box>

      {/* Content row: image + info */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* Image card */}
        <Paper elevation={0} sx={{ ...cardSx, width: 480, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
              {t('adminProductDetail.imageTitle')}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddPhotoAlternateIcon sx={{ fontSize: 16 }} />}
              onClick={() => setUploadOpen(true)}
              sx={{
                borderRadius: '4px',
                textTransform: 'none',
                fontSize: 12,
                fontWeight: 500,
                borderColor: '#2563EB',
                color: '#2563EB',
                px: 1.25,
                py: 0.5,
              }}
            >
              {t('adminProductDetail.uploadImage')}
            </Button>
          </Box>
          <Box sx={{ borderTop: '1px solid #F1F5F9', my: 2 }} />
          <Box
            sx={{
              height: 300,
              borderRadius: '8px',
              bgcolor: mainImage ? '#F8FAFC' : '#DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {mainImage ? (
              <Box
                component="img"
                src={mainImage}
                alt={product.name}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <ShoppingBagIcon sx={{ fontSize: 80, color: '#2563EB' }} />
            )}
          </Box>

          {/* Thumbnail row */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {gallery.map((src, index) => {
              const selected = index === activeIdx;
              return (
                <Box
                  key={`${src.slice(0, 24)}-${index}`}
                  onClick={() => setMainIdx(index)}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '4px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: selected ? 'primary.main' : '#E2E8F0',
                    ...(selected && { borderWidth: 2 }),
                  }}
                >
                  <Box
                    component="img"
                    src={src}
                    alt={`${product.name}-${index}`}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              );
            })}
            {/* Add thumbnail */}
            <Box
              onClick={() => setUploadOpen(true)}
              sx={{
                width: 80,
                height: 80,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '1px dashed #E2E8F0',
                color: '#CBD5E1',
                '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
              }}
            >
              <AddIcon sx={{ fontSize: 24 }} />
            </Box>
          </Box>
        </Paper>

        {/* Info card */}
        <Paper elevation={0} sx={{ ...cardSx, flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
            {t('adminProductDetail.basicInfo')}
          </Typography>
          <Box sx={{ borderTop: '1px solid #F1F5F9', my: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Field label={t('adminProductDetail.field.name')} value={product.name} />
              <Field label={t('adminProductDetail.field.sku')} value={product.sku} />
            </Box>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Field label={t('adminProductDetail.field.category')} value={product.category} />
              <Field
                label={t('adminProductDetail.field.brand')}
                value={product.brand || t('adminProductDetail.empty')}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Field
                label={t('adminProductDetail.field.pointsPrice')}
                accent="#2563EB"
                value={
                  <Box component="span" sx={{ fontSize: 18, fontWeight: 700 }}>
                    {product.pointsPrice.toLocaleString()} {t('adminProductDetail.pointsUnit')}
                  </Box>
                }
              />
              <Field
                label={t('adminProductDetail.field.marketPrice')}
                value={product.marketPrice != null ? `¥ ${product.marketPrice.toLocaleString()}` : t('adminProductDetail.empty')}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Field
                label={t('adminProductDetail.field.stock')}
                value={
                  <Box component="span" sx={{ fontSize: 18, fontWeight: 700, color: '#16A34A' }}>
                    {product.stock}{' '}
                    <Box component="span" sx={{ fontSize: 14, fontWeight: 400, color: 'text.secondary' }}>
                      {t('adminProductDetail.stockUnit')}
                    </Box>
                  </Box>
                }
              />
              <Field
                label={t('adminProductDetail.field.sold')}
                value={`${product.soldCount} ${t('adminProductDetail.stockUnit')}`}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Field label={t('adminProductDetail.field.created')} value={formatDateTime(product.createdAt)} />
              <Field label={t('adminProductDetail.field.updated')} value={formatDateTime(product.updatedAt)} />
            </Box>
            {(product.deliveryMethod || product.serviceGuarantee) && (
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Field
                  label={t('adminProductDetail.field.delivery')}
                  value={product.deliveryMethod || t('adminProductDetail.empty')}
                />
                <Field
                  label={t('adminProductDetail.field.service')}
                  value={product.serviceGuarantee || t('adminProductDetail.empty')}
                />
              </Box>
            )}
            {(product.promotion || colors.length > 0) && (
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Field
                  label={t('adminProductDetail.field.promo')}
                  accent="#2563EB"
                  value={product.promotion || t('adminProductDetail.empty')}
                />
                <Field
                  label={t('adminProductDetail.field.color')}
                  value={colors.length > 0 ? colors.join(' / ') : t('adminProductDetail.empty')}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Description */}
      {product.description && (
        <Paper elevation={0} sx={cardSx}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
            {t('adminProductDetail.descTitle')}
          </Typography>
          <Box sx={{ borderTop: '1px solid #F1F5F9', my: 2 }} />
          <Typography sx={{ fontSize: 14, color: 'text.secondary', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {product.description}
          </Typography>
        </Paper>
      )}

      {/* Specs */}
      {product.specs && product.specs.length > 0 && (
        <Paper elevation={0} sx={cardSx}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
            {t('adminProductDetail.specTitle')}
          </Typography>
          <Box sx={{ borderTop: '1px solid #F1F5F9', my: 2 }} />
          <Box>
            {product.specs.map((spec, index) => (
              <Box
                key={`${spec.key}-${index}`}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 1.25,
                  borderBottom: index < product.specs!.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary' }}>
                  {spec.key}
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary' }}>
                  {spec.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* Dialogs */}
      <StockAdjustDialog
        open={stockOpen}
        product={product}
        onClose={() => setStockOpen(false)}
        onSuccess={(updated) => {
          setProduct(updated);
          setSnack({ open: true, message: t('adminProductDetail.stockDialog.success'), severity: 'success' });
        }}
      />
      <DelistConfirmDialog
        open={statusOpen}
        product={product}
        nextStatus={isActive ? 0 : 1}
        onClose={() => setStatusOpen(false)}
        onConfirm={handleStatusConfirm}
        loading={statusLoading}
      />
      <ImageUploadDialog
        open={uploadOpen}
        images={gallery}
        onClose={() => setUploadOpen(false)}
        onSave={handleImageSave}
      />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('adminProductDetail.deleteTitle')}
        content={t('adminProductDetail.deleteContent')}
        loading={deleteLoading}
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
