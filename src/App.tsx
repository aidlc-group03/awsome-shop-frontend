import { useMemo, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { RouterProvider } from 'react-router';
import { getTheme } from './theme';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import { mockSetCurrentUser } from './mock';
import router from './router';

export default function App() {
  const darkMode = useAppStore((s) => s.darkMode);
  const theme = useMemo(() => getTheme(darkMode ? 'dark' : 'light'), [darkMode]);
  const user = useAuthStore((s) => s.user);

  // Restore mock session on refresh using persisted auth state
  useEffect(() => {
    if (user && import.meta.env.VITE_USE_MOCK === 'true') {
      mockSetCurrentUser(user.id);
    }
  }, [user]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
