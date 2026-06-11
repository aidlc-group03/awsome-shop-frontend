import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import type { Category } from '../../../types';
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from './categoryIcons';

export interface CategoryFormPayload {
  name: string;
  iconUrl: string;
  sortOrder: number;
  parentId: number | null;
  status: number;
  description: string;
}

interface CategoryFormDialogProps {
  open: boolean;
  /** The category being edited; null when creating. */
  editing: Category | null;
  /** Parent id preset when using "add sub-category"; ignored while editing. */
  presetParentId: number | null;
  /** Top-level categories available as parent options. */
  parentOptions: Category[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CategoryFormPayload) => void;
}

interface FormState {
  name: string;
  parentId: number | null;
  iconUrl: string;
  sortOrder: string;
  status: number;
  description: string;
}

const EMPTY: FormState = {
  name: '',
  parentId: null,
  iconUrl: '',
  sortOrder: '100',
  status: 1,
  description: '',
};

export default function CategoryFormDialog({
  open,
  editing,
  presetParentId,
  parentOptions,
  submitting,
  onClose,
  onSubmit,
}: CategoryFormDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        name: editing.name,
        parentId: editing.parentId,
        iconUrl: editing.iconUrl || '',
        sortOrder: editing.sortOrder != null ? String(editing.sortOrder) : '100',
        status: editing.status,
        description: editing.description || '',
      });
    } else {
      setForm({ ...EMPTY, parentId: presetParentId });
    }
    setError('');
  }, [open, editing, presetParentId]);

  const change = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setError(t('adminCategories.validation.name'));
      return;
    }
    onSubmit({
      name: form.name.trim(),
      iconUrl: form.iconUrl,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      parentId: form.parentId,
      status: form.status,
      description: form.description.trim(),
    });
  };

  // A category cannot be its own parent.
  const availableParents = parentOptions.filter((c) => c.id !== editing?.id);

  return (
    <Dialog open={open} onClose={() => !submitting && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editing ? t('adminCategories.editTitle') : t('adminCategories.createTitle')}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label={t('adminCategories.form.name')}
          required
          value={form.name}
          onChange={(e) => change('name', e.target.value)}
          placeholder={t('adminCategories.form.namePlaceholder')}
          fullWidth
        />

        <TextField
          select
          label={t('adminCategories.form.parent')}
          value={form.parentId == null ? '' : String(form.parentId)}
          onChange={(e) => change('parentId', e.target.value === '' ? null : Number(e.target.value))}
          fullWidth
        >
          <MenuItem value="">{t('adminCategories.form.parentNone')}</MenuItem>
          {availableParents.map((c) => (
            <MenuItem key={c.id} value={String(c.id)}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label={t('adminCategories.form.icon')}
          value={form.iconUrl}
          onChange={(e) => change('iconUrl', e.target.value)}
          fullWidth
          SelectProps={{
            renderValue: (value) => {
              const opt = getCategoryIcon(value as string);
              const Icon = opt.Icon;
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon sx={{ fontSize: 20, color: opt.color }} />
                  <Typography sx={{ fontSize: 14 }}>
                    {value ? (value as string) : t('adminCategories.form.iconNone')}
                  </Typography>
                </Box>
              );
            },
          }}
        >
          <MenuItem value="">{t('adminCategories.form.iconNone')}</MenuItem>
          {CATEGORY_ICON_OPTIONS.map((opt) => {
            const Icon = opt.Icon;
            return (
              <MenuItem key={opt.key} value={opt.key}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon sx={{ fontSize: 20, color: opt.color }} />
                  <Typography sx={{ fontSize: 14 }}>{opt.key}</Typography>
                </Box>
              </MenuItem>
            );
          })}
        </TextField>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label={t('adminCategories.form.sortOrder')}
            type="number"
            value={form.sortOrder}
            onChange={(e) => change('sortOrder', e.target.value)}
            sx={{ flex: 1 }}
          />
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary', mb: 0.5 }}>
              {t('adminCategories.form.status')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch
                checked={form.status === 1}
                onChange={(e) => change('status', e.target.checked ? 1 : 0)}
              />
              <Typography sx={{ fontSize: 13 }}>
                {form.status === 1
                  ? t('adminCategories.statusActive')
                  : t('adminCategories.statusInactive')}
              </Typography>
            </Box>
          </Box>
        </Box>

        <TextField
          label={t('adminCategories.form.description')}
          value={form.description}
          onChange={(e) => change('description', e.target.value)}
          placeholder={t('adminCategories.form.descriptionPlaceholder')}
          multiline
          rows={3}
          fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={submitting}>
          {t('adminCategories.cancel')}
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {editing ? t('adminCategories.saveButton') : t('adminCategories.createButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
