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
import Divider from '@mui/material/Divider';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import type { Product, PointsBalance } from '../../types';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { pointsService } from '../../services/pointsService';
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
  const [balance, setBalance] = useState<PointsBalance | null>(null);
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
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [data, bal] = await Promise.all([
          productService.getById(Number(id)),
          pointsService.getBalance(),
        ]);
        setProduct(data);
        setBalance(bal);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.recipientName.trim()) {
      newErrors.recipientName = t('redeem.nameRequired');
    } else if (form.recipientName.trim().length < 2 || form.recipientName.trim().length > 20) {
      newErrors.recipientName = t('redeem.nameLength');
    }
    const phoneRegex = /^1\d{10}$/;
    if (!form.recipientPhone.trim()) {
      newErrors.recipientPhone = t('redeem.phoneRequired');
    } else if (!phoneRegex.test(form.recipientPhone.trim())) {
      newErrors.recipientPhone = t('redeem.phoneFormat');
    }
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
    setSubmitting(true);
    try {
      const order = await orderService.create({
        productId: product.id,
        recipientName: form.recipientName.trim(),
        recipientPhone: form.recipientPhone.trim(),
        recipientAddress: form.recipientAddress.trim(),
      });
      navigate('/redeem/success', { state: { order } });
    } catch (err: unknown) {
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
      <Box sx={{ p: '32px' }}>
        <LoadingState type="detail" />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ p: '32px' }}>
        <Typography>{t('product.notFound')}</Typography>
      </Box>
    );
  }

  const payable = product.pointsPrice;
  const insufficient = balance ? balance.balance < payable : false;
  const remaining = balance ? balance.balance - payable : 0;
  const color = product.colors ? product.colors.split(',')[0].trim() : '';

  const cardSx = {
    borderRadius: 'var(--radius-lg, 12px)',
    border: '1px solid',
    borderColor: '#F1F5F9',
    p: 3,
  } as const;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: '32px 0' }}>
      <Box sx={{ width: 720, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography
              onClick={() => navigate('/')}
              sx={{ fontSize: 13, color: 'primary.main', cursor: 'pointer' }}
            >
              {t('redeem.breadcrumbHome')}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>/</Typography>
            <Typography
              onClick={() => navigate(`/product/${product.id}`)}
              sx={{ fontSize: 13, color: 'primary.main', cursor: 'pointer' }}
            >
              {product.name}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>/</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{t('redeem.title')}</Typography>
          </Box>
          <Typography sx={{ fontSize: 24, fontWeight: 700 }}>{t('redeem.title')}</Typography>
        </Box>

        {/* Product Card */}
        <Paper elevation={0} sx={cardSx}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{t('redeem.productInfo')}</Typography>
          <Divider sx={{ my: 2.5 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 'var(--radius-md, 8px)',
                bgcolor: '#DBEAFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {product.imageUrl ? (
                <Box component="img" src={product.imageUrl} alt={product.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ShoppingBagIcon sx={{ fontSize: 40, color: '#2563EB' }} />
              )}
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{product.name}</Typography>
              {color && (
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {t('redeem.colorLabel')}：{color}
                </Typography>
              )}
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'success.main' }}>
                {t('redeem.stockSufficient')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{t('redeem.quantity')}</Typography>
              <Typography sx={{ fontSize: 15, fontWeight: 600 }}>× 1</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Points Detail Card */}
        <Paper elevation={0} sx={cardSx}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{t('redeem.pointsDetail')}</Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{t('redeem.itemPrice')}</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                {product.pointsPrice.toLocaleString()} {t('redeem.pointsUnit')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{t('redeem.quantity')}</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>× 1</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{t('redeem.payable')}</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'primary.main' }}>
                {payable.toLocaleString()} {t('redeem.pointsUnit')}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Balance Bar */}
        {balance && (
          <Box
            sx={{
              borderRadius: 'var(--radius-md, 8px)',
              bgcolor: '#EFF6FF',
              p: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{t('redeem.balanceLabel')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                {balance.balance.toLocaleString()} {t('redeem.pointsUnit')}
              </Typography>
              <Typography sx={{ fontSize: 14, color: 'text.disabled' }}>→</Typography>
              <Typography
                sx={{ fontSize: 14, fontWeight: 600, color: insufficient ? 'error.main' : 'success.main' }}
              >
                {insufficient ? t('redeem.insufficientBalance') : t('redeem.afterRedeem', { points: remaining.toLocaleString() })}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Delivery Form Card */}
        <Paper elevation={0} sx={cardSx}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{t('redeem.receiverInfo')}</Typography>
          <Divider sx={{ my: 2.5 }} />
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

        {/* Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={handleSubmit}
            disabled={submitting || insufficient}
            sx={{ height: 48, borderRadius: 'var(--radius-md, 8px)', fontSize: 16, fontWeight: 600, textTransform: 'none' }}
          >
            {submitting ? t('redeem.submitting') : t('redeem.confirm')}
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate(`/product/${product.id}`)}
            sx={{ height: 48, borderRadius: 'var(--radius-md, 8px)', fontSize: 14, fontWeight: 500, textTransform: 'none', color: 'text.secondary', borderColor: '#E2E8F0' }}
          >
            {t('redeem.backToProduct')}
          </Button>
        </Box>

        {/* Notes */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, pb: 2 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
            {t('redeem.noteTitle')}
          </Typography>
          {[t('redeem.note1'), t('redeem.note2'), t('redeem.note3')].map((note, i) => (
            <Typography key={i} sx={{ fontSize: 12, color: 'text.disabled' }}>
              {note}
            </Typography>
          ))}
        </Box>

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
    </Box>
  );
}
