import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import TollIcon from '@mui/icons-material/Toll';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const { t } = useTranslation();
  const isSoldOut = product.stock === 0;

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: '12px',
        border: '1px solid',
        borderColor: '#F1F5F9',
        boxShadow: 'none',
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        position: 'relative',
        '&:hover': { boxShadow: 2 },
      }}
    >
      {/* Product Image Area */}
      <Box
        sx={{
          position: 'relative',
          height: 200,
          bgcolor: product.imageUrl ? 'transparent' : '#DBEAFE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {product.imageUrl ? (
          <Box
            component="img"
            src={product.imageUrl}
            alt={product.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <ShoppingBagIcon sx={{ fontSize: 64, color: '#2563EB' }} />
        )}
        {isSoldOut && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                color: '#fff',
                fontSize: 18,
                fontWeight: 700,
                bgcolor: 'rgba(0,0,0,0.6)',
                px: 2,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              已售罄
            </Typography>
          </Box>
        )}
      </Box>

      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          p: '16px',
          '&:last-child': { pb: '16px' },
        }}
      >
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            color: 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {product.name}
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          {product.category}
        </Typography>
        <Typography sx={{ fontSize: 11, color: '#CBD5E1' }}>
          {t('employee.sold')} {product.soldCount} {t('employee.soldUnit')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TollIcon sx={{ fontSize: 18, color: '#D97706' }} />
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#D97706' }}>
              {product.pointsPrice.toLocaleString()}
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            disabled={isSoldOut}
            sx={{
              borderRadius: '8px',
              px: '14px',
              py: '6px',
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'none',
              minWidth: 'auto',
            }}
          >
            {t('employee.redeem')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
