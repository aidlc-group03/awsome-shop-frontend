import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import TollIcon from '@mui/icons-material/Toll';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import CheckIcon from '@mui/icons-material/Check';
import { pointsService } from '../services/pointsService';

interface UserSummary {
  userId: number;
  displayName: string;
  username: string;
  empNo: string | null;
  department: string | null;
  balance: number;
}

interface AdjustPointsDialogProps {
  open: boolean;
  user: UserSummary | null;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'add' | 'deduct';
}

export default function AdjustPointsDialog({ open, user, onClose, onSuccess, initialMode = 'add' }: AdjustPointsDialogProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'add' | 'deduct'>(initialMode);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setAmount('');
      setReason('');
      setNote('');
      setError('');
      setSubmitting(false);
    }
  }, [open, initialMode]);

  if (!user) return null;

  const reasons = [
    { value: 'activity', label: t('adminPoints.adjustDialog.reasonActivity') },
    { value: 'holiday', label: t('adminPoints.adjustDialog.reasonHoliday') },
    { value: 'reward', label: t('adminPoints.adjustDialog.reasonReward') },
    { value: 'correction', label: t('adminPoints.adjustDialog.reasonCorrection') },
    { value: 'expire', label: t('adminPoints.adjustDialog.reasonExpire') },
    { value: 'violation', label: t('adminPoints.adjustDialog.reasonViolation') },
    { value: 'other', label: t('adminPoints.adjustDialog.reasonOther') },
  ];

  const parsedAmount = parseInt(amount, 10);
  const validAmount = !isNaN(parsedAmount) && parsedAmount > 0 && Number.isInteger(parsedAmount);
  const exceedsBalance = mode === 'deduct' && validAmount && parsedAmount > user.balance;
  const afterBalance = validAmount ? (mode === 'add' ? user.balance + parsedAmount : user.balance - parsedAmount) : user.balance;

  const handleSubmit = async () => {
    if (!validAmount) {
      setError(t('adminPoints.validation.points'));
      return;
    }
    if (exceedsBalance) {
      setError(t('adminPoints.adjustDialog.exceedBalance'));
      return;
    }
    if (!reason) {
      setError(t('adminPoints.adjustDialog.reasonPlaceholder'));
      return;
    }
    if (!note.trim()) {
      setError(t('adminPoints.validation.description'));
      return;
    }
    const reasonLabel = reasons.find((r) => r.value === reason)?.label || reason;
    setSubmitting(true);
    setError('');
    try {
      if (mode === 'add') {
        await pointsService.grant({
          userId: user.userId,
          points: parsedAmount,
          description: note.trim(),
          reason: reasonLabel,
        });
      } else {
        await pointsService.deduct({
          userId: user.userId,
          points: parsedAmount,
          description: note.trim(),
          reason: reasonLabel,
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminPoints.submitError'));
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
      slotProps={{ paper: { sx: { width: 500, maxWidth: 500, borderRadius: 'var(--radius-xl, 16px)' } } }}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              bgcolor: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TollIcon sx={{ fontSize: 20, color: '#D97706' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
              {t('adminPoints.adjustDialog.title')}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {t('adminPoints.adjustDialog.subtitle')}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={submitting} sx={{ borderRadius: 1 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* User info card */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#F8FAFC',
            border: '1px solid',
            borderColor: '#F1F5F9',
            borderRadius: 'var(--radius-md, 8px)',
            px: 2,
            py: 1.75,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: 16, fontWeight: 600 }}>
              {user.displayName.charAt(0)}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{user.displayName}</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                {user.empNo || user.username}
                {user.department ? ` · ${user.department}` : ''}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
              {t('adminPoints.adjustDialog.currentBalance')}
            </Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#D97706' }}>
              {user.balance.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {/* Adjust type */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 1 }}>
            {t('adminPoints.adjustDialog.typeLabel')} <Box component="span" sx={{ color: 'error.main' }}>*</Box>
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {(['add', 'deduct'] as const).map((m) => {
              const active = mode === m;
              const Icon = m === 'add' ? AddCircleIcon : RemoveCircleIcon;
              return (
                <Box
                  key={m}
                  onClick={() => setMode(m)}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    px: 2,
                    py: 1.5,
                    borderRadius: 'var(--radius-md, 8px)',
                    cursor: 'pointer',
                    bgcolor: active ? '#EFF6FF' : 'transparent',
                    border: '1px solid',
                    borderColor: active ? 'primary.main' : '#E2E8F0',
                    ...(active && { borderWidth: 2 }),
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: active ? 'primary.main' : '#E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {active && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />}
                  </Box>
                  <Icon sx={{ fontSize: 20, color: active ? 'primary.main' : 'text.secondary' }} />
                  <Typography sx={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? 'primary.main' : 'text.primary' }}>
                    {m === 'add' ? t('adminPoints.adjustDialog.typeAdd') : t('adminPoints.adjustDialog.typeSub')}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Amount */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>
            {t('adminPoints.adjustDialog.amountLabel')} <Box component="span" sx={{ color: 'error.main' }}>*</Box>
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t('adminPoints.adjustDialog.amountPlaceholder')}
            slotProps={{ htmlInput: { min: 1 } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: validAmount ? 'primary.main' : '#E2E8F0', borderWidth: validAmount ? 2 : 1 },
              },
            }}
          />
          {validAmount && (
            <Typography sx={{ fontSize: 12, color: exceedsBalance ? 'error.main' : 'text.secondary', mt: 0.75 }}>
              {exceedsBalance
                ? t('adminPoints.adjustDialog.exceedBalance')
                : t('adminPoints.adjustDialog.afterBalance', { balance: afterBalance.toLocaleString() })}
            </Typography>
          )}
        </Box>

        {/* Reason */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>
            {t('adminPoints.adjustDialog.reasonLabel')} <Box component="span" sx={{ color: 'error.main' }}>*</Box>
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="" disabled>
              {t('adminPoints.adjustDialog.reasonPlaceholder')}
            </MenuItem>
            {reasons.map((r) => (
              <MenuItem key={r.value} value={r.value}>
                {r.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Note */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>
            {t('adminPoints.adjustDialog.noteLabel')}
          </Typography>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('adminPoints.adjustDialog.notePlaceholder')}
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
          sx={{ borderRadius: 'var(--radius-md, 8px)', textTransform: 'none', borderColor: '#E2E8F0', color: 'text.primary' }}
        >
          {t('adminPoints.adjustDialog.cancel')}
        </Button>
        <Button
          variant="contained"
          startIcon={<CheckIcon />}
          onClick={handleSubmit}
          disabled={submitting}
          sx={{ borderRadius: 'var(--radius-md, 8px)', textTransform: 'none', fontWeight: 600 }}
        >
          {t('adminPoints.adjustDialog.confirm')}
        </Button>
      </Box>
    </Dialog>
  );
}
