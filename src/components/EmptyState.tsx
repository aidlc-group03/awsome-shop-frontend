import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  message?: string;
  icon?: ReactNode;
}

export default function EmptyState({
  message = '暂无数据',
  icon,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 2,
      }}
    >
      {icon || <InboxIcon sx={{ fontSize: 64, color: '#CBD5E1' }} />}
      <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
        {message}
      </Typography>
    </Box>
  );
}
