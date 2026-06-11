import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { SvgIconComponent } from '@mui/icons-material';

export interface StatItem {
  key: string;
  label: string;
  value: string | number;
  icon: SvgIconComponent;
  iconColor: string;
  iconBg: string;
  hint?: string;
  hintColor?: string;
}

interface StatCardsProps {
  items: StatItem[];
}

export default function StatCards({ items }: StatCardsProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: '20px' }}>
      {items.map((m) => {
        const Icon = m.icon;
        return (
          <Paper
            key={m.key}
            elevation={0}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: '#F1F5F9',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{m.label}</Typography>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: m.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon sx={{ fontSize: 20, color: m.iconColor }} />
              </Box>
            </Box>
            <Typography sx={{ fontSize: 28, fontWeight: 700, color: 'text.primary' }}>{m.value}</Typography>
            {m.hint && (
              <Typography sx={{ fontSize: 12, color: m.hintColor || 'text.secondary' }}>{m.hint}</Typography>
            )}
          </Paper>
        );
      })}
    </Box>
  );
}
