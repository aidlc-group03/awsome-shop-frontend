import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import Popover from '@mui/material/Popover';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import type {
  PointsRule,
  PointsRuleType,
  PointsRuleScope,
  PointsRuleGrantMethod,
} from '../types';
import { pointsRuleService } from '../services/pointsRuleService';
import PointsRuleIcon, { SELECTABLE_RULE_ICONS } from './PointsRuleIcon';

interface PointsRuleDialogProps {
  open: boolean;
  rule: PointsRule | null; // null => create mode
  onClose: () => void;
  onSuccess?: (rule: PointsRule) => void;
}

const RULE_TYPES: PointsRuleType[] = ['fixed', 'event', 'performance', 'holiday'];
const SCOPES: PointsRuleScope[] = ['all', 'fulltime', 'probation', 'department'];
const GRANT_METHODS: PointsRuleGrantMethod[] = ['auto', 'manual'];

interface FormState {
  name: string;
  type: PointsRuleType | '';
  pointsValue: string;
  triggerCondition: string;
  scope: PointsRuleScope;
  grantMethod: PointsRuleGrantMethod;
  enabled: boolean;
  icon: string;
  description: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  type: '',
  pointsValue: '',
  triggerCondition: '',
  scope: 'all',
  grantMethod: 'auto',
  enabled: true,
  icon: '',
  description: '',
};

export default function PointsRuleDialog({ open, rule, onClose, onSuccess }: PointsRuleDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!rule;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [iconAnchor, setIconAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      if (rule) {
        setForm({
          name: rule.name,
          type: rule.type,
          pointsValue: rule.pointsValue,
          triggerCondition: rule.triggerCondition,
          scope: rule.scope,
          grantMethod: rule.grantMethod,
          enabled: rule.enabled,
          icon: rule.icon,
          description: rule.description ?? '',
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setError('');
      setSubmitting(false);
      setIconAnchor(null);
    }
  }, [open, rule]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError(t('adminPointRules.dialog.validation.name'));
      return;
    }
    if (!form.type) {
      setError(t('adminPointRules.dialog.validation.type'));
      return;
    }
    if (!form.pointsValue.trim()) {
      setError(t('adminPointRules.dialog.validation.points'));
      return;
    }
    if (!form.triggerCondition.trim()) {
      setError(t('adminPointRules.dialog.validation.trigger'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type as PointsRuleType,
        pointsValue: form.pointsValue.trim(),
        triggerCondition: form.triggerCondition.trim(),
        scope: form.scope,
        grantMethod: form.grantMethod,
        enabled: form.enabled,
        icon: form.icon || 'stars',
        description: form.description.trim() || undefined,
      };
      const saved = isEdit
        ? await pointsRuleService.update({ id: rule!.id, ...payload })
        : await pointsRuleService.create(payload);
      onSuccess?.(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminPointRules.dialog.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const labelSx = { fontSize: 13, fontWeight: 500, color: 'text.primary', mb: 0.75 } as const;
  const requiredMark = (
    <Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>
      *
    </Box>
  );
  const fieldInputSx = {
    '& .MuiOutlinedInput-root': {
      height: 40,
      borderRadius: '8px',
      fontSize: 13,
      '& fieldset': { borderColor: '#E2E8F0' },
    },
  } as const;

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { width: 560, maxWidth: 560, borderRadius: '16px' } } }}
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
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          {isEdit ? t('adminPointRules.dialog.editTitle') : t('adminPointRules.dialog.addTitle')}
        </Typography>
        <IconButton size="small" onClick={onClose} disabled={submitting} sx={{ borderRadius: '8px' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.25 }}>
        {error && <Alert severity="error">{error}</Alert>}

        {/* Row 1: name / type / points */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={labelSx}>
              {t('adminPointRules.dialog.name')}
              {requiredMark}
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder={t('adminPointRules.dialog.namePlaceholder')}
              sx={fieldInputSx}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={labelSx}>
              {t('adminPointRules.dialog.type')}
              {requiredMark}
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={form.type}
              onChange={(e) => set('type', e.target.value as PointsRuleType)}
              slotProps={{ select: { displayEmpty: true } }}
              sx={fieldInputSx}
            >
              <MenuItem value="" disabled>
                {t('adminPointRules.dialog.typePlaceholder')}
              </MenuItem>
              {RULE_TYPES.map((tp) => (
                <MenuItem key={tp} value={tp}>
                  {t(`adminPointRules.type.${tp}`)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={labelSx}>
              {t('adminPointRules.dialog.points')}
              {requiredMark}
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={form.pointsValue}
              onChange={(e) => set('pointsValue', e.target.value)}
              placeholder={t('adminPointRules.dialog.pointsPlaceholder')}
              sx={fieldInputSx}
            />
          </Box>
        </Box>

        {/* Trigger condition */}
        <Box>
          <Typography sx={labelSx}>
            {t('adminPointRules.dialog.trigger')}
            {requiredMark}
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={form.triggerCondition}
            onChange={(e) => set('triggerCondition', e.target.value)}
            placeholder={t('adminPointRules.dialog.triggerPlaceholder')}
            sx={fieldInputSx}
          />
        </Box>

        {/* Row 2: scope / method */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={labelSx}>{t('adminPointRules.dialog.scope')}</Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={form.scope}
              onChange={(e) => set('scope', e.target.value as PointsRuleScope)}
              sx={fieldInputSx}
            >
              {SCOPES.map((s) => (
                <MenuItem key={s} value={s}>
                  {t(`adminPointRules.scope.${s}`)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={labelSx}>{t('adminPointRules.dialog.method')}</Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={form.grantMethod}
              onChange={(e) => set('grantMethod', e.target.value as PointsRuleGrantMethod)}
              sx={fieldInputSx}
            >
              {GRANT_METHODS.map((m) => (
                <MenuItem key={m} value={m}>
                  {t(`adminPointRules.method.${m}`)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        {/* Row 3: status / icon */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={labelSx}>{t('adminPointRules.dialog.status')}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: 40 }}>
              <Switch
                checked={form.enabled}
                onChange={(e) => set('enabled', e.target.checked)}
                size="small"
              />
              <Typography sx={{ fontSize: 13 }}>
                {form.enabled
                  ? t('adminPointRules.dialog.statusOn')
                  : t('adminPointRules.dialog.statusOff')}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={labelSx}>{t('adminPointRules.dialog.icon')}</Typography>
            <Box
              onClick={(e) => setIconAnchor(e.currentTarget)}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer' }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: form.icon ? '#EFF6FF' : '#F8FAFC',
                  border: '1px solid',
                  borderColor: form.icon ? 'primary.main' : '#E2E8F0',
                  flexShrink: 0,
                }}
              >
                {form.icon ? (
                  <PointsRuleIcon name={form.icon} sx={{ fontSize: 20, color: 'primary.main' }} />
                ) : (
                  <AddPhotoAlternateIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                )}
              </Box>
              {form.icon ? (
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{form.icon}</Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                    {t('adminPointRules.dialog.iconChange')}
                  </Typography>
                </Box>
              ) : (
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  {t('adminPointRules.dialog.iconSelect')}
                </Typography>
              )}
            </Box>
            <Popover
              open={!!iconAnchor}
              anchorEl={iconAnchor}
              onClose={() => setIconAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              slotProps={{ paper: { sx: { p: 1.5, borderRadius: '12px', maxWidth: 280 } } }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.75 }}>
                {SELECTABLE_RULE_ICONS.map((name) => {
                  const active = form.icon === name;
                  return (
                    <Box
                      key={name}
                      onClick={() => {
                        set('icon', name);
                        setIconAnchor(null);
                      }}
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        bgcolor: active ? '#EFF6FF' : 'transparent',
                        border: '1px solid',
                        borderColor: active ? 'primary.main' : 'transparent',
                        '&:hover': { bgcolor: '#F1F5F9' },
                      }}
                    >
                      <PointsRuleIcon
                        name={name}
                        sx={{ fontSize: 20, color: active ? 'primary.main' : 'text.secondary' }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Popover>
          </Box>
        </Box>

        {/* Description */}
        <Box>
          <Typography sx={labelSx}>{t('adminPointRules.dialog.description')}</Typography>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder={t('adminPointRules.dialog.descriptionPlaceholder')}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13, '& fieldset': { borderColor: '#E2E8F0' } } }}
          />
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
          {t('adminPointRules.dialog.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 3 }}
        >
          {isEdit ? t('adminPointRules.dialog.save') : t('adminPointRules.dialog.create')}
        </Button>
      </Box>
    </Dialog>
  );
}
