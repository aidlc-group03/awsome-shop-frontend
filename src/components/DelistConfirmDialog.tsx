import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import type { Product } from '../types';

interface DelistConfirmDialogProps {
  open: boolean;
  product: Product | null;
  /** intended next status: 0 = delist (下架), 1 = relist (上架) */
  nextStatus: number;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function DelistConfirmDialog({
  open,
  product,
  nextStatus,
  onClose,
  onConfirm,
  loading = false,
}: DelistConfirmDialogProps) {
  const { t } = useTranslation();
  if (!product) return null;

  const isDelist = nextStatus === 0;
  const accent = isDelist ? '#D97706' : '#2563EB';
  const accentBg = isDelist ? '#FEF3C7' : '#DBEAFE';

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: { width: 440, maxWidth: 440, borderRadius: '16px', border: '1px solid #FFFFFF33' },
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
          {isDelist
            ? t('adminProductDetail.delistDialog.title')
            : t('adminProductDetail.delistDialog.relistTitle')}
        </Typography>
        <IconButton size="small" onClick={onClose} disabled={loading} sx={{ borderRadius: '8px' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ px: 3, py: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: accentBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WarningAmberIcon sx={{ fontSize: 28, color: accent }} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
            {isDelist
              ? t('adminProductDetail.delistDialog.message')
              : t('adminProductDetail.delistDialog.relistMessage')}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
            {isDelist
              ? t('adminProductDetail.delistDialog.desc')
              : t('adminProductDetail.delistDialog.relistDesc')}
          </Typography>
        </Box>

        {/* Product info card */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: '#F8FAFC',
            borderRadius: '8px',
            p: 2,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '4px',
              bgcolor: '#DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
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
              <ShoppingBagIcon sx={{ fontSize: 22, color: '#2563EB' }} />
            )}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {product.name}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {t('adminProductDetail.delistDialog.skuStock', {
                sku: product.sku,
                stock: product.stock,
              })}
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
          disabled={loading}
          sx={{ borderRadius: '8px', textTransform: 'none', borderColor: '#E2E8F0', color: 'text.primary', px: 3 }}
        >
          {t('adminProductDetail.delistDialog.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            bgcolor: accent,
            '&:hover': { bgcolor: accent, filter: 'brightness(0.95)' },
          }}
        >
          {isDelist
            ? t('adminProductDetail.delistDialog.confirm')
            : t('adminProductDetail.delistDialog.relistConfirm')}
        </Button>
      </Box>
    </Dialog>
  );
}
