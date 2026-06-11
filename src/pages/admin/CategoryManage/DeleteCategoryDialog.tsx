import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ErrorIcon from '@mui/icons-material/Error';
import type { Category } from '../../../types';
import { getCategoryIcon } from './categoryIcons';

interface DeleteCategoryDialogProps {
  open: boolean;
  category: Category | null;
  childCount: number;
  productCount: number;
  parentName: string | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteCategoryDialog({
  open,
  category,
  childCount,
  productCount,
  parentName,
  loading,
  onClose,
  onConfirm,
}: DeleteCategoryDialogProps) {
  const { t } = useTranslation();
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (open) setConfirmText('');
  }, [open, category]);

  if (!category) return null;

  const iconOpt = getCategoryIcon(category.iconUrl);
  const Icon = iconOpt.Icon;
  const matched = confirmText.trim() === category.name;

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, width: 480, maxWidth: '90vw' } }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '20px 24px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DeleteForeverIcon sx={{ fontSize: 20, color: '#DC2626' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary' }}>
              {t('adminCategories.deleteTitle')}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {t('adminCategories.deleteSubtitle')}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={loading}>
          <CloseIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        </IconButton>
      </Box>

      <Box sx={{ height: '1px', bgcolor: '#E2E8F0' }} />

      {/* Body */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: '20px 24px' }}>
        {/* Warning box */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.25,
            bgcolor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            p: '12px 14px',
          }}
        >
          <ErrorIcon sx={{ fontSize: 18, color: '#DC2626', mt: '1px' }} />
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#991B1B', mb: 0.5 }}>
              {t('adminCategories.deleteImpactTitle')}
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#B91C1C', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
              {t('adminCategories.deleteImpactChildren', { count: childCount })}
              {'\n'}
              {t('adminCategories.deleteImpactProducts', { count: productCount })}
            </Typography>
          </Box>
        </Box>

        {/* Category info card */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.75,
            bgcolor: '#F8FAFC',
            border: '1px solid #F1F5F9',
            borderRadius: '8px',
            p: '14px 16px',
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              bgcolor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ fontSize: 24, color: iconOpt.color }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>
              {category.name}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {t('adminCategories.deleteInfoLine', {
                parent: parentName || t('adminCategories.form.parentNone'),
                count: productCount,
              })}
            </Typography>
          </Box>
        </Box>

        {/* Type-to-confirm */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary', mb: 1 }}>
            {t('adminCategories.deleteConfirmPrefix')}
            <Box component="span" sx={{ color: '#DC2626', fontWeight: 700, mx: 0.5 }}>
              {category.name}
            </Box>
            {t('adminCategories.deleteConfirmSuffix')}
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={t('adminCategories.deleteConfirmPlaceholder', { name: category.name })}
            disabled={loading}
          />
        </Box>
      </Box>

      <Box sx={{ height: '1px', bgcolor: '#E2E8F0' }} />

      {/* Footer */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, p: '16px 24px 20px' }}>
        <Button
          fullWidth
          variant="contained"
          color="error"
          disabled={!matched || loading}
          onClick={onConfirm}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverIcon />
          }
          sx={{ height: 42 }}
        >
          {t('adminCategories.deleteConfirmButton')}
        </Button>
        <Button fullWidth variant="outlined" color="inherit" onClick={onClose} disabled={loading} sx={{ height: 42 }}>
          {t('adminCategories.cancel')}
        </Button>
      </Box>
    </Dialog>
  );
}
