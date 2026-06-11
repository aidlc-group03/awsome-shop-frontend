import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Address } from '../../types';
import { addressService, formatAddress } from '../../services/addressService';
import LoadingState from '../../components/LoadingState';

// Static region data for the new-address form (mock backend)
const REGIONS: Record<string, string[]> = {
  北京市: ['北京市'],
  上海市: ['上海市'],
  广东省: ['广州市', '深圳市', '珠海市', '东莞市'],
  浙江省: ['杭州市', '宁波市', '温州市'],
  江苏省: ['南京市', '苏州市', '无锡市'],
  四川省: ['成都市', '绵阳市'],
};
const PROVINCES = Object.keys(REGIONS);

interface NewAddressForm {
  recipientName: string;
  recipientPhone: string;
  province: string;
  city: string;
  zipCode: string;
  detailAddress: string;
  isDefault: boolean;
}

interface FormErrors {
  recipientName?: string;
  recipientPhone?: string;
  region?: string;
  detailAddress?: string;
}

const emptyForm: NewAddressForm = {
  recipientName: '',
  recipientPhone: '',
  province: '',
  city: '',
  zipCode: '',
  detailAddress: '',
  isDefault: false,
};

export default function DeliveryInfo() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<NewAddressForm>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const list = await addressService.getList();
        setAddresses(list);
        const def = list.find((a) => a.isDefault) ?? list[0];
        if (def) {
          setSelectedId(def.id);
        } else {
          // No saved addresses: open the form so the user can add one
          setFormOpen(true);
        }
      } catch {
        setFormOpen(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cityOptions = useMemo(
    () => (form.province ? REGIONS[form.province] ?? [] : []),
    [form.province],
  );

  const handleField =
    (field: keyof NewAddressForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const validateForm = (): boolean => {
    const next: FormErrors = {};
    if (!form.recipientName.trim()) {
      next.recipientName = t('delivery.nameRequired');
    }
    const phoneRegex = /^1\d{10}$/;
    if (!form.recipientPhone.trim()) {
      next.recipientPhone = t('delivery.phoneRequired');
    } else if (!phoneRegex.test(form.recipientPhone.trim())) {
      next.recipientPhone = t('delivery.phoneFormat');
    }
    if (!form.province || !form.city) {
      next.region = t('delivery.regionRequired');
    }
    const detail = form.detailAddress.trim();
    if (!detail) {
      next.detailAddress = t('delivery.detailRequired');
    } else if (detail.length < 5 || detail.length > 200) {
      next.detailAddress = t('delivery.detailLength');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // Continue to the confirm page with the chosen address
  const goConfirm = (address: Address) => {
    navigate(`/redeem/${id}`, { state: { address } });
  };

  const handleSaveAndUse = async () => {
    // When the form is open, create a new address; otherwise use the selected one
    if (formOpen) {
      if (!validateForm()) return;
      setSubmitting(true);
      try {
        const created = await addressService.create({
          recipientName: form.recipientName.trim(),
          recipientPhone: form.recipientPhone.trim(),
          province: form.province,
          city: form.city,
          zipCode: form.zipCode.trim() || undefined,
          detailAddress: form.detailAddress.trim(),
          isDefault: form.isDefault,
        });
        goConfirm(created);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : t('redeem.submitFailed'));
        setShowError(true);
      } finally {
        setSubmitting(false);
      }
      return;
    }
    const selected = addresses.find((a) => a.id === selectedId);
    if (!selected) {
      setErrorMessage(t('redeem.noAddressHint'));
      setShowError(true);
      return;
    }
    goConfirm(selected);
  };

  if (loading) {
    return (
      <Box sx={{ p: '32px 0', display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: 720 }}>
          <LoadingState type="detail" />
        </Box>
      </Box>
    );
  }

  const cardSx = {
    borderRadius: 'var(--radius-lg, 12px)',
    border: '1px solid',
    borderColor: '#F1F5F9',
    p: 3,
  } as const;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: '32px 0' }}>
      <Box sx={{ width: 720, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Page header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 700 }}>{t('delivery.title')}</Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
            {t('delivery.subtitle')}
          </Typography>
        </Box>

        {/* Saved addresses */}
        <Paper elevation={0} sx={cardSx}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
            {t('delivery.savedAddresses')}
          </Typography>
          <Divider sx={{ my: 2 }} />
          {addresses.length === 0 ? (
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
              {t('delivery.emptyAddresses')}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {addresses.map((addr) => {
                const active = selectedId === addr.id;
                return (
                  <Box
                    key={addr.id}
                    onClick={() => setSelectedId(addr.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      borderRadius: 'var(--radius-md, 8px)',
                      border: '1px solid',
                      borderColor: active ? 'primary.main' : '#E2E8F0',
                      ...(active && { borderWidth: 2 }),
                      p: '12px 16px',
                      cursor: 'pointer',
                    }}
                  >
                    <Radio checked={active} size="small" sx={{ p: 0 }} />
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                          {addr.recipientName}
                        </Typography>
                        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                          {addr.recipientPhone}
                        </Typography>
                        {addr.isDefault && (
                          <Chip
                            label={t('delivery.defaultBadge')}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: 11,
                              fontWeight: 500,
                              bgcolor: '#EFF6FF',
                              color: 'primary.main',
                            }}
                          />
                        )}
                      </Box>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                        {formatAddress(addr)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Paper>

        {/* New address form */}
        <Paper elevation={0} sx={cardSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
              {t('delivery.addNewAddress')}
            </Typography>
            <Box
              onClick={() => setFormOpen((v) => !v)}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer' }}
            >
              <AddCircleIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'primary.main' }}>
                {formOpen ? t('delivery.collapseForm') : t('delivery.expandForm')}
              </Typography>
            </Box>
          </Box>

          {formOpen && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label={t('delivery.fieldName')}
                    required
                    value={form.recipientName}
                    onChange={handleField('recipientName')}
                    error={!!errors.recipientName}
                    helperText={errors.recipientName}
                    size="small"
                    fullWidth
                    placeholder={t('delivery.namePlaceholder')}
                  />
                  <TextField
                    label={t('delivery.fieldPhone')}
                    required
                    value={form.recipientPhone}
                    onChange={handleField('recipientPhone')}
                    error={!!errors.recipientPhone}
                    helperText={errors.recipientPhone}
                    size="small"
                    fullWidth
                    placeholder={t('delivery.phonePlaceholder')}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                    <TextField
                      select
                      label={t('delivery.fieldRegion')}
                      required
                      value={form.province}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, province: e.target.value, city: '' }))
                      }
                      error={!!errors.region}
                      helperText={errors.region}
                      size="small"
                      sx={{ flex: 1 }}
                    >
                      <MenuItem value="" disabled>
                        {t('delivery.provincePlaceholder')}
                      </MenuItem>
                      {PROVINCES.map((p) => (
                        <MenuItem key={p} value={p}>
                          {p}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      label={t('delivery.cityPlaceholder')}
                      value={form.city}
                      onChange={handleField('city')}
                      disabled={!form.province}
                      size="small"
                      sx={{ flex: 1 }}
                    >
                      <MenuItem value="" disabled>
                        {t('delivery.cityPlaceholder')}
                      </MenuItem>
                      {cityOptions.map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                  <TextField
                    label={t('delivery.fieldZip')}
                    value={form.zipCode}
                    onChange={handleField('zipCode')}
                    size="small"
                    sx={{ width: 160 }}
                    placeholder={t('delivery.zipPlaceholder')}
                  />
                </Box>

                <TextField
                  label={t('delivery.fieldDetail')}
                  required
                  value={form.detailAddress}
                  onChange={handleField('detailAddress')}
                  error={!!errors.detailAddress}
                  helperText={errors.detailAddress}
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder={t('delivery.detailPlaceholder')}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.isDefault}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, isDefault: e.target.checked }))
                      }
                      size="small"
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                      {t('delivery.setDefault')}
                    </Typography>
                  }
                />
              </Box>
            </>
          )}
        </Paper>

        {/* Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 2 }}>
          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={handleSaveAndUse}
            disabled={submitting}
            sx={{
              height: 48,
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: 16,
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            {t('delivery.saveAndUse')}
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate(id ? `/product/${id}` : '/')}
            sx={{
              height: 48,
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: 14,
              fontWeight: 500,
              textTransform: 'none',
              color: 'text.secondary',
              borderColor: '#E2E8F0',
            }}
          >
            {t('delivery.back')}
          </Button>
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
