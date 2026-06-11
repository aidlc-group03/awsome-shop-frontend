import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RedeemIcon from '@mui/icons-material/Redeem';
import { useAuthStore } from '../../store/useAuthStore';
import { getTheme } from '../../theme';

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const lightTheme = useMemo(() => getTheme('light'), []);

  // Login page always uses browser language, not stored preference
  useEffect(() => {
    const browserLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
    if (i18n.language !== browserLang) {
      i18n.changeLanguage(browserLang);
    }
  }, [i18n]);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = async () => {
    setError(false);
    const success = await login(username, password);
    if (success) {
      const user = useAuthStore.getState().user;
      navigate(user?.role === 'admin' ? '/admin' : '/');
    } else {
      setError(true);
    }
  };

  return (
    <ThemeProvider theme={lightTheme}>
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Left Brand Panel */}
      <Box
        sx={{
          width: 640,
          flexShrink: 0,
          bgcolor: 'primary.main',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          p: '60px',
        }}
      >
        <RedeemIcon sx={{ fontSize: 64, color: '#fff' }} />
        <Typography
          sx={{
            color: '#fff',
            fontSize: 40,
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {t('login.brand')}
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 18,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {t('login.brandSubtitle')}
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 15,
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.6,
            textAlign: 'center',
            maxWidth: 300,
            whiteSpace: 'pre-line',
          }}
        >
          {t('login.brandDesc')}
        </Typography>
      </Box>

      {/* Right Login Panel */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#fff',
          p: '80px',
        }}
      >
        <Box sx={{ width: 400, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 700,
                color: 'text.primary',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {t('login.title')}
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                color: 'text.secondary',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {t('login.subtitle')}
            </Typography>
          </Box>

          {/* Error & Hint */}
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {t('login.loginFailed')}
            </Alert>
          )}
          {import.meta.env.VITE_USE_MOCK === 'true' && (
            <Alert severity="info" sx={{ borderRadius: 2, fontSize: 13 }}>
              {t('login.hint')}
            </Alert>
          )}

          {/* Form Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'text.primary',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {t('login.usernameLabel')}
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder={t('login.usernamePlaceholder')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      height: 44,
                      borderRadius: '8px',
                      fontFamily: 'Inter, sans-serif',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                      '& input::placeholder': { color: '#CBD5E1', opacity: 1 },
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'text.primary',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {t('login.passwordLabel')}
              </Typography>
              <TextField
                fullWidth
                size="small"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                          ) : (
                            <VisibilityOffIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      height: 44,
                      borderRadius: '8px',
                      fontFamily: 'Inter, sans-serif',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                      '& input::placeholder': { color: '#CBD5E1', opacity: 1 },
                    },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Login Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleLogin}
            sx={{
              height: 48,
              borderRadius: '8px',
              fontSize: 16,
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              textTransform: 'none',
            }}
          >
            {t('login.loginBtn')}
          </Button>

          {/* Register Link */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
            <Typography
              sx={{
                fontSize: 14,
                color: 'text.secondary',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {t('login.noAccount')}
            </Typography>
            <Link
              component="button"
              underline="none"
              onClick={() => navigate('/register')}
              sx={{
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                color: 'primary.main',
              }}
            >
              {t('login.register')}
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
    </ThemeProvider>
  );
}
