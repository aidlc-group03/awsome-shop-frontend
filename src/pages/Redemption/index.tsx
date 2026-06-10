import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import TollIcon from '@mui/icons-material/Toll';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { Product } from '../../types';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import LoadingState from '../../components/LoadingState';

interface FormData {
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
}

interface FormErrors {
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress?: string;
}

export default function Redemption() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const [form, setForm] = useState<FormData>({
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await productService.getById(Number(id));
        setProduct(data);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // recipientName: required, 2-20 chars
    if (!form.recipientName.trim()) {
      newErrors.recipientName = t('redeem.nameRequired');
    } else if (form.recipientName.trim().length < 2 || form.recipientName.trim().length > 20) {
      newErrors.recipientName = t('redeem.nameLength');
    }

    // recipientPhone: required, 11 digits starting with 1 (BR-F3.4)
    const phoneRegex = /^1\d{10}$/;
    if (!form.recipientPhone.trim()) {
      newErrors.recipientPhone = t('redeem.phoneRequired');
    } else if (!phoneRegex.test(form.recipientPhone.trim())) {
      newErrors.recipientPhone = t('redeem.phoneFormat');
    }

    // recipientAddress: required, 5-200 chars
    if (!form.recipientAddress.trim()) {
      newErrors.recipientAddress = t('redeem.addressRequired');
    } else if (form.recipientAddress.trim().length < 5 || form.recipientAddress.trim().length > 200) {
      newErrors.recipientAddress = t('redeem.addressLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !product) return;

    // BR-F3.5: Button disabled during submit
    setSubmitting(true);
    try {
      const order = await orderService.create({
        productId: product.id,
        recipientName: form.recipientName.trim(),
        recipientPhone: form.recipientPhone.trim(),
        recipientAddress: form.recipientAddress.trim(),
      });
      // BR-F3.6: Success -> navigate to success page with order data
      navigate('/redeem/success', { state: { order } });
    } catch (err: unknown) {
      // BR-F3.7: Failure -> show specific error message
      const message = err instanceof Error ? err.message : t('redeem.submitFailed');
      setErrorMessage(message);
      setShowError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
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
        <Typography>{t('product.notFound')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px', maxWidth: 800 }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
      >
        {t('common.back')}
      </Button>

      <Typography sx={{ fontSize: 24, fontWeight: 700 }}>
        {t('redeem.title')}
      </Typography>

      {/* Product Summary */}
      <Paper sx={{ p: 3, borderRadius: '12px', display: 'flex', gap: 2, alignItems: 'center' }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '8px',
            bgcolor: '#DBEAFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {product.imageUrl ? (
            <Box
              component="img"
              src={product.imageUrl}
              alt={product.name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <ShoppingBagIcon sx={{ fontSize: 40, color: '#2563EB' }} />
          )}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{product.name}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <TollIcon sx={{ fontSize: 18, color: '#D97706' }} />
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#D97706' }}>
              {product.pointsPrice.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', ml: 0.5 }}>
              {t('redeem.pointsToDeduct')}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Delivery Form */}
      <Paper sx={{ p: 3, borderRadius: '12px' }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 3 }}>
          {t('redeem.deliveryInfo')}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label={t('redeem.recipientName')}
            value={form.recipientName}
            onChange={handleFieldChange('recipientName')}
            error={!!errors.recipientName}
            helperText={errors.recipientName}
            fullWidth
            size="small"
            placeholder={t('redeem.namePlaceholder')}
          />

          <TextField
            label={t('redeem.recipientPhone')}
            value={form.recipientPhone}
            onChange={handleFieldChange('recipientPhone')}
            error={!!errors.recipientPhone}
            helperText={errors.recipientPhone}
            fullWidth
            size="small"
            placeholder={t('redeem.phonePlaceholder')}
          />

          <TextField
            label={t('redeem.recipientAddress')}
            value={form.recipientAddress}
            onChange={handleFieldChange('recipientAddress')}
            error={!!errors.recipientAddress}
            helperText={errors.recipientAddress}
            fullWidth
            size="small"
            multiline
            rows={3}
            placeholder={t('redeem.addressPlaceholder')}
          />
        </Box>
      </Paper>

      {/* Submit Button */}
      <Button
        variant="contained"
        size="large"
        onClick={handleSubmit}
        disabled={submitting}
        sx={{
          borderRadius: '8px',
          py: 1.5,
          fontSize: 16,
          fontWeight: 600,
          textTransform: 'none',
        }}
      >
        {submitting ? t('redeem.submitting') : t('redeem.confirm')}
      </Button>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={4000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setShowError(false)}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
