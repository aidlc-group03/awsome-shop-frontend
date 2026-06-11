import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

interface LoadingStateProps {
  type: 'table' | 'card' | 'detail';
  rows?: number;
}

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          height={52}
          sx={{ borderRadius: 1 }}
        />
      ))}
    </Box>
  );
}

function CardSkeleton() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
      }}
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Skeleton
            variant="rectangular"
            height={200}
            sx={{ borderRadius: '12px' }}
          />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="60%" />
        </Box>
      ))}
    </Box>
  );
}

function DetailSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1, flex: 1 }} />
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1, flex: 1 }} />
      </Box>
      <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
    </Box>
  );
}

export default function LoadingState({ type, rows = 5 }: LoadingStateProps) {
  switch (type) {
    case 'table':
      return <TableSkeleton rows={rows} />;
    case 'card':
      return <CardSkeleton />;
    case 'detail':
      return <DetailSkeleton />;
    default:
      return <TableSkeleton rows={rows} />;
  }
}
