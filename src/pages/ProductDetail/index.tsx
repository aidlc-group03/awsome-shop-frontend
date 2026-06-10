import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import TollIcon from '@mui/icons-material/Toll';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { Product, PointsBalance } from '../../types';
import { productService } from '../../services/productService';
import { pointsService } from '../../services/pointsService';
import LoadingState from '../../components/LoadingState';

export default function ProductDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [balance, setBalance] = useState<PointsBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [productData, balanceData] = await Promise.all([
          productService.getById(Number(id)),
          pointsService.getBalance(),
        ]);
        setProduct(productData);
        setBalance(balanceData);
      } catch {
        // error handled by empty state
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: '24px 32px' }}>
        <LoadingState type="detail" />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ p: '24px 32px' }}>
        <Typography>{t('product.notFound')}</Typography>
      </Box>
    );
  }

  const isSoldOut = product.stock === 0;
  const insufficientPoints = balance ? balance.balance < product.pointsPrice : false;
  const redeemDisabled = isSoldOut || insufficientPoints;

  const getRedeemTooltip = () => {
    if (isSoldOut) return t('product.soldOut');
    if (insufficientPoints) return t('product.insufficientPoints');
    return '';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
      >
        {t('common.back')}
      </Button>

      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Product Image */}
        <Paper
          sx={{
            width: 400,
            height: 400,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {product.imageUrl ? (
            <Box
              component="img"
              src={product.imageUrl}
              alt={product.name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <ShoppingBagIcon sx={{ fontSize: 120, color: '#2563EB' }} />
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
                  fontSize: 24,
                  fontWeight: 700,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                }}
              >
                {t('product.soldOut')}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Product Info */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 700, color: 'text.primary' }}>
            {product.name}
          </Typography>
          {product.subtitle && (
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
              {product.subtitle}
            </Typography>
          )}

          {/* Points Price */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TollIcon sx={{ fontSize: 28, color: '#D97706' }} />
            <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#D97706' }}>
              {product.pointsPrice.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: 14, color: 'text.secondary', ml: 1 }}>
              {t('product.points')}
            </Typography>
          </Box>

          {/* Market Price */}
          {product.marketPrice && (
            <Typography
              sx={{
                fontSize: 14,
                color: 'text.secondary',
                textDecoration: 'line-through',
              }}
            >
              {t('product.marketPrice')}: ¥{product.marketPrice.toFixed(2)}
            </Typography>
          )}

          <Divider />

          {/* Delivery & Guarantee */}
          {product.deliveryMethod && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShippingIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                {product.deliveryMethod}
              </Typography>
            </Box>
          )}
          {product.serviceGuarantee && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedUserIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                {product.serviceGuarantee}
              </Typography>
            </Box>
          )}

          {/* Balance info */}
          {balance && (
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('product.yourBalance')}: {balance.balance.toLocaleString()} {t('product.points')}
            </Typography>
          )}

          {/* Redeem Button */}
          <Box sx={{ mt: 2 }}>
            <Tooltip title={getRedeemTooltip()} arrow>
              <span>
                <Button
                  variant="contained"
                  size="large"
                  disabled={redeemDisabled}
                  onClick={() => navigate(`/redeem/${product.id}`)}
                  sx={{
                    borderRadius: '8px',
                    px: 4,
                    py: 1.5,
                    fontSize: 16,
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  {isSoldOut ? t('product.soldOut') : t('product.redeemNow')}
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Description */}
      {product.description && (
        <Paper sx={{ p: 3, borderRadius: '12px' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>
            {t('product.description')}
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary', whiteSpace: 'pre-line' }}>
            {product.description}
          </Typography>
        </Paper>
      )}

      {/* Specs Table */}
      {product.specs && product.specs.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: '12px' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>
            {t('product.specs')}
          </Typography>
          <Table size="small">
            <TableBody>
              {product.specs.map((spec, index) => (
                <TableRow key={index}>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: 'text.secondary',
                      width: 160,
                      border: 'none',
                      py: 1,
                    }}
                  >
                    {spec.key}
                  </TableCell>
                  <TableCell sx={{ border: 'none', py: 1 }}>{spec.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
