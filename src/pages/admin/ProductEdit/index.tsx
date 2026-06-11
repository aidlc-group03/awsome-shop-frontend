import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import type { Category, Product, UpdateProductRequest } from '../../../types';
import { productService } from '../../../services/productService';
import { categoryService } from '../../../services/categoryService';
import LoadingState from '../../../components/LoadingState';

const cardSx = {
  borderRadius: '12px',
  border: '1px solid #F1F5F9',
  bgcolor: '#fff',
  p: 3,
} as const;

interface SpecRow {
  key: string;
  value: string;
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>
      {label}
      {required && (
        <Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>
          *
        </Box>
      )}
    </Typography>
  );
}

export default function AdminProductEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [pointsPrice, setPointsPrice] = useState('');
  const [marketPrice, setMarketPrice] = useState('');
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState<SpecRow[]>([]);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [p, cats] = await Promise.all([
        productService.getById(Number(id)),
        categoryService.getList().catch(() => [] as Category[]),
      ]);
      setProduct(p);
      setCategories(cats);
      setName(p.name);
      setCategory(p.category);
      setBrand(p.brand || '');
      setPointsPrice(String(p.pointsPrice));
      setMarketPrice(p.marketPrice != null ? String(p.marketPrice) : '');
      setDescription(p.description || '');
      setSpecs(p.specs && p.specs.length > 0 ? p.specs.map((s) => ({ ...s })) : []);
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validate = (): string | null => {
    if (!name || name.trim().length < 2) return t('adminProductDetail.edit.validation.name');
    if (!category) return t('adminProductDetail.edit.validation.category');
    const pp = parseInt(pointsPrice, 10);
    if (!pointsPrice || isNaN(pp) || pp <= 0) return t('adminProductDetail.edit.validation.pointsPrice');
    return null;
  };

  const handleSave = async () => {
    if (!product) return;
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const cleanedSpecs = specs
        .map((s) => ({ key: s.key.trim(), value: s.value.trim() }))
        .filter((s) => s.key && s.value);
      const data: UpdateProductRequest = {
        id: product.id,
        name: name.trim(),
        sku: product.sku,
        category,
        pointsPrice: parseInt(pointsPrice, 10),
        stock: product.stock,
        status: product.status,
        ...(brand.trim() ? { brand: brand.trim() } : {}),
        ...(marketPrice ? { marketPrice: parseFloat(marketPrice) } : {}),
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(product.imageUrl ? { imageUrl: product.imageUrl } : {}),
        ...(product.images && product.images.length > 0 ? { images: product.images } : {}),
        ...(product.subtitle ? { subtitle: product.subtitle } : {}),
        ...(product.deliveryMethod ? { deliveryMethod: product.deliveryMethod } : {}),
        ...(product.serviceGuarantee ? { serviceGuarantee: product.serviceGuarantee } : {}),
        ...(product.promotion ? { promotion: product.promotion } : {}),
        ...(product.colors ? { colors: product.colors } : {}),
        ...(cleanedSpecs.length > 0 ? { specs: cleanedSpecs } : {}),
      };
      await productService.update(data);
      setSnack(true);
      setTimeout(() => navigate(`/admin/products/${product.id}`), 600);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('adminProducts.submitError'));
      setSaving(false);
    }
  };

  const updateSpec = (index: number, field: keyof SpecRow, value: string) => {
    setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

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
            <Typography
              onClick={() => navigate(`/admin/products/${product.id}`)}
              sx={{ fontSize: 13, color: 'primary.main', cursor: 'pointer' }}
            >
              {t('adminProductDetail.breadcrumbDetail')}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>/</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('adminProductDetail.breadcrumbEdit')}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: 'text.primary' }}>
            {t('adminProductDetail.edit.title')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/admin/products/${product.id}`)}
            disabled={saving}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: 13,
              fontWeight: 500,
              borderColor: '#E2E8F0',
              color: 'text.primary',
              px: 2.5,
              py: 1,
            }}
          >
            {t('adminProductDetail.edit.cancel')}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon sx={{ fontSize: 18 }} />}
            onClick={handleSave}
            disabled={saving}
            sx={{ borderRadius: '8px', textTransform: 'none', fontSize: 13, fontWeight: 600, px: 2.5, py: 1 }}
          >
            {t('adminProductDetail.edit.save')}
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Basic info */}
      <Paper elevation={0} sx={cardSx}>
        <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
          {t('adminProductDetail.edit.basicInfo')}
        </Typography>
        <Box sx={{ borderTop: '1px solid #F1F5F9', my: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 2.5 }}>
            <Box sx={{ flex: 1 }}>
              <FieldLabel label={t('adminProductDetail.edit.field.name')} required />
              <TextField fullWidth size="small" value={name} onChange={(e) => setName(e.target.value)} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FieldLabel label={t('adminProductDetail.edit.field.sku')} required />
              <TextField fullWidth size="small" value={product.sku} disabled />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2.5 }}>
            <Box sx={{ flex: 1 }}>
              <FieldLabel label={t('adminProductDetail.edit.field.category')} required />
              <TextField
                select
                fullWidth
                size="small"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.length === 0 && (
                  <MenuItem value={category}>{category}</MenuItem>
                )}
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ flex: 1 }}>
              <FieldLabel label={t('adminProductDetail.edit.field.brand')} />
              <TextField fullWidth size="small" value={brand} onChange={(e) => setBrand(e.target.value)} />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2.5 }}>
            <Box sx={{ flex: 1 }}>
              <FieldLabel label={t('adminProductDetail.edit.field.pointsPrice')} required />
              <TextField
                fullWidth
                size="small"
                type="number"
                value={pointsPrice}
                onChange={(e) => setPointsPrice(e.target.value)}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FieldLabel label={t('adminProductDetail.edit.field.marketPrice')} />
              <TextField
                fullWidth
                size="small"
                type="number"
                value={marketPrice}
                onChange={(e) => setMarketPrice(e.target.value)}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Description */}
      <Paper elevation={0} sx={cardSx}>
        <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
          {t('adminProductDetail.edit.descTitle')}
        </Typography>
        <Box sx={{ borderTop: '1px solid #F1F5F9', my: 2 }} />
        <TextField
          fullWidth
          multiline
          minRows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Paper>

      {/* Spec params */}
      <Paper elevation={0} sx={cardSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
            {t('adminProductDetail.edit.specTitle')}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            onClick={() => setSpecs((prev) => [...prev, { key: '', value: '' }])}
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
            {t('adminProductDetail.edit.addSpec')}
          </Button>
        </Box>
        <Box sx={{ borderTop: '1px solid #F1F5F9', my: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {specs.map((spec, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <TextField
                size="small"
                value={spec.key}
                placeholder={t('adminProductDetail.edit.specKeyPlaceholder')}
                onChange={(e) => updateSpec(index, 'key', e.target.value)}
                sx={{ width: 160, flexShrink: 0 }}
              />
              <TextField
                size="small"
                fullWidth
                value={spec.value}
                placeholder={t('adminProductDetail.edit.specValuePlaceholder')}
                onChange={(e) => updateSpec(index, 'value', e.target.value)}
              />
              <IconButton
                size="small"
                onClick={() => setSpecs((prev) => prev.filter((_, i) => i !== index))}
                sx={{ color: 'text.disabled' }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ))}
          {specs.length === 0 && (
            <Typography sx={{ fontSize: 13, color: 'text.disabled', py: 1 }}>
              {t('adminProductDetail.empty')}
            </Typography>
          )}
        </Box>
      </Paper>

      <Snackbar
        open={snack}
        autoHideDuration={2000}
        onClose={() => setSnack(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSnack(false)}>
          {t('adminProductDetail.edit.saveSuccess')}
        </Alert>
      </Snackbar>
    </Box>
  );
}
