import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const MAX_IMAGES = 10;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED = ['image/jpeg', 'image/png'];

interface ImageUploadDialogProps {
  open: boolean;
  /** initial images (data URLs or remote URLs); first is the main image */
  images?: string[];
  onClose: () => void;
  onSave: (images: string[]) => void;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('read error'));
    reader.readAsDataURL(file);
  });
}

export default function ImageUploadDialog({
  open,
  images = [],
  onClose,
  onSave,
}: ImageUploadDialogProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setItems(images.filter(Boolean));
      setError('');
      setDragOver(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError('');
    const files = Array.from(fileList);
    const accepted: string[] = [];
    for (const file of files) {
      if (!ACCEPTED.includes(file.type)) {
        setError(t('adminProductDetail.uploadDialog.errorType'));
        continue;
      }
      if (file.size > MAX_SIZE) {
        setError(t('adminProductDetail.uploadDialog.errorSize'));
        continue;
      }
      accepted.push(await readAsDataUrl(file));
    }
    setItems((prev) => {
      const merged = [...prev, ...accepted];
      if (merged.length > MAX_IMAGES) {
        setError(t('adminProductDetail.uploadDialog.errorMax', { max: MAX_IMAGES }));
        return merged.slice(0, MAX_IMAGES);
      }
      return merged;
    });
  };

  const handleRemove = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(items);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { width: 560, maxWidth: 560, borderRadius: '16px', border: '1px solid #FFFFFF33' },
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
          {t('adminProductDetail.uploadDialog.title')}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ borderRadius: '8px' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          hidden
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {/* Drop zone */}
        <Box
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          sx={{
            height: 160,
            borderRadius: '12px',
            bgcolor: '#EFF6FF',
            border: '2px dashed',
            borderColor: dragOver ? '#1D4ED8' : '#2563EB',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            cursor: 'pointer',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 24, color: '#2563EB' }} />
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
            {t('adminProductDetail.uploadDialog.dropText')}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            {t('adminProductDetail.uploadDialog.hint')}
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
          >
            {t('adminProductDetail.uploadDialog.selectFile')}
          </Button>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {/* Preview label */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
            {t('adminProductDetail.uploadDialog.uploaded', { count: items.length, max: MAX_IMAGES })}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            {t('adminProductDetail.uploadDialog.sortHint')}
          </Typography>
        </Box>

        {/* Preview grid */}
        {items.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {items.map((src, index) => (
              <Box
                key={`${src.slice(0, 24)}-${index}`}
                sx={{
                  position: 'relative',
                  width: 120,
                  height: 120,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '2px solid',
                  borderColor: index === 0 ? 'primary.main' : '#E2E8F0',
                }}
              >
                <Box
                  component="img"
                  src={src}
                  alt={`preview-${index}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {index === 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      bgcolor: 'primary.main',
                      borderRadius: '4px',
                      px: 0.75,
                      py: 0.25,
                    }}
                  >
                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#fff' }}>
                      {t('adminProductDetail.uploadDialog.mainBadge')}
                    </Typography>
                  </Box>
                )}
                <IconButton
                  size="small"
                  onClick={() => handleRemove(index)}
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 20,
                    height: 20,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 12, color: '#fff' }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
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
          sx={{ borderRadius: '8px', textTransform: 'none', borderColor: '#E2E8F0', color: 'text.primary', px: 3 }}
        >
          {t('adminProductDetail.uploadDialog.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 3 }}
        >
          {t('adminProductDetail.uploadDialog.save')}
        </Button>
      </Box>
    </Dialog>
  );
}
