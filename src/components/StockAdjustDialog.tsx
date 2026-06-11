import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { Product } from '../types';
import { productService } from '../services/productService';

interface StockAdjustDialogProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSuccess?: (updated: Product) => void;
}

export default function StockAdjustDialog({
  open,
  product,
  onClose,
  onSuccess,
}: StockAdjustDialogProps) {
  const { t } = useTranslation();
  const [type, setType] = useState<'in' | 'out'>('in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setType('in');
      setQuantity('');
      setReason('');
      setError('');
      setSubmitting(false);
    }
  }, [open]);

  if (!product) return null;

  const qty = parseInt(quantity, 10);
  const validQty = !isNaN(qty) && qty > 0;
  const delta = type === 'in' ? qty : -qty;
  const nextStock = validQty ? product.stock + delta : product.stock;

  const handleSubmit = async () => {
    if (!validQty) {
      setError(t('adminProductDetail.stockDialog.validation.quantity'));
      return;
    }
    if (type === 'out' && qty > product.stock) {
      setError(t('adminProductDetail.stockDialog.validation.insufficient'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const updated = await productService.adjustStock({
        id: product.id,
        type,
        quantity: qty,
        reason: reason.trim() || undefined,
      });
      onSuccess?.(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminProductDetail.stockDialog.validation.quantity'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: { width: 480, maxWidth: 480, borderRadius: '16px', border: '1px solid #FFFFFF33' },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
          {t('adminProductDetail.stockDialog.title')}
        </Typography>
        <IconButton size="small" onClick={onClose} disabled={submitting} sx={{ borderRadius: '8px' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Current stock */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#F8FAFC',
            borderRadius: '8px',
            p: 2,
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.secondary' }}>
            {t('adminProductDetail.stockDialog.currentStock')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#16A34A' }}>
              {product.stock}
            </Typography>
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
              {t('adminProductDetail.stockDialog.unit')}
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {/* Adjust type */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>
            {t('adminProductDetail.stockDialog.type')}
          </Typography>
          <RadioGroup row value={type} onChange={(e) => setType(e.target.value as 'in' | 'out')}>
            <FormControlLabel
              value="in"
              control={<Radio size="small" />}
              label={
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                  {t('adminProductDetail.stockDialog.typeIn')}
                </Typography>
              }
            />
            <FormControlLabel
              value="out"
              control={<Radio size="small" />}
              label={
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                  {t('adminProductDetail.stockDialog.typeOut')}
                </Typography>
              }
            />
          </RadioGroup>
        </Box>

        {/* Quantity */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>
            {t('adminProductDetail.stockDialog.quantity')}
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={t('adminProductDetail.stockDialog.quantityPlaceholder')}
            slotProps={{ htmlInput: { min: 1 } }}
          />
        </Box>

        {/* Reason */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>
            {t('adminProductDetail.stockDialog.reason')}
          </Typography>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('adminProductDetail.stockDialog.reasonPlaceholder')}
          />
        </Box>

        {/* Preview */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#EFF6FF',
            borderRadius: '8px',
            p: 2,
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.secondary' }}>
            {t('adminProductDetail.stockDialog.preview')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography sx={{ fontSize: 14, color: 'text.disabled' }}>{product.stock}</Typography>
            <ArrowForwardIcon sx={{ fontSize: 16, color: '#2563EB' }} />
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#2563EB' }}>
              {nextStock}
            </Typography>
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
              {t('adminProductDetail.stockDialog.unit')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1.5,
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={submitting}
          sx={{ borderRadius: '8px', textTransform: 'none', borderColor: '#E2E8F0', color: 'text.primary', px: 3 }}
        >
          {t('adminProductDetail.stockDialog.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !validQty}
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 3 }}
        >
          {t('adminProductDetail.stockDialog.confirm')}
        </Button>
      </Box>
    </Dialog>
  );
}
