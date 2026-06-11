import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import TollIcon from '@mui/icons-material/Toll';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import RecommendIcon from '@mui/icons-material/Recommend';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import type { Product, PointsBalance } from '../../types';
import { productService } from '../../services/productService';
import { pointsService } from '../../services/pointsService';
import LoadingState from '../../components/LoadingState';

const COLOR_DOTS: Record<string, string> = {
  黑色: '#1E293B',
  银色: '#CBD5E1',
  深蓝: '#1D4ED8',
  深灰: '#475569',
  午夜色: '#1E293B',
  星光色: '#E5E7EB',
  石墨色: '#374151',
  珍珠白: '#F8FAFC',
};

export default function ProductDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [balance, setBalance] = useState<PointsBalance | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [activeThumb, setActiveThumb] = useState(0);
  const [snack, setSnack] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setQuantity(1);
      setSelectedColor(0);
      setActiveThumb(0);
      try {
        const [productData, balanceData] = await Promise.all([
          productService.getById(Number(id)),
          pointsService.getBalance(),
        ]);
        setProduct(productData);
        setBalance(balanceData);
        // Related: other active products in the same category
        const list = await productService.getList({
          page: 1,
          size: 4,
          category: productData.category,
          status: 1,
        });
        setRelated(list.records.filter((p) => p.id !== productData.id).slice(0, 3));
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
      <Box sx={{ p: '24px 48px' }}>
        <LoadingState type="detail" />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ p: '24px 48px' }}>
        <Typography>{t('product.notFound')}</Typography>
      </Box>
    );
  }

  const isSoldOut = product.stock === 0;
  const insufficientPoints = balance ? balance.balance < product.pointsPrice * quantity : false;
  const redeemDisabled = isSoldOut || insufficientPoints;
  const colors = product.colors ? product.colors.split(',').map((c) => c.trim()).filter(Boolean) : [];

  const getRedeemTooltip = () => {
    if (isSoldOut) return t('product.soldOut');
    if (insufficientPoints) return t('product.insufficientPoints');
    return '';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, p: '24px 48px' }}>
      <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        {/* Left: Image + thumbnails + specs */}
        <Box sx={{ width: 480, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Main Image */}
          <Box
            sx={{
              position: 'relative',
              height: 400,
              borderRadius: 'var(--radius-lg, 12px)',
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
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <ShoppingBagIcon sx={{ fontSize: 160, color: '#2563EB' }} />
            )}
            {product.promotion && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bgcolor: '#DC2626',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: '0 0 8px 0',
                }}
              >
                {product.promotion}
              </Box>
            )}
            {isSoldOut && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>
                  {t('product.soldOut')}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Thumbnail row */}
          <Box sx={{ display: 'flex', gap: 1, pt: 1.5 }}>
            {[0, 1, 2, 3].map((i) => (
              <Box
                key={i}
                onClick={() => setActiveThumb(i)}
                sx={{
                  width: 76,
                  height: 76,
                  borderRadius: 'var(--radius-sm, 4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  bgcolor: activeThumb === i ? '#DBEAFE' : '#F8FAFC',
                  border: '1px solid',
                  borderColor: activeThumb === i ? 'primary.main' : '#F1F5F9',
                  ...(activeThumb === i && { borderWidth: 2 }),
                }}
              >
                <ShoppingBagIcon
                  sx={{ fontSize: 32, color: activeThumb === i ? '#2563EB' : '#CBD5E1' }}
                />
              </Box>
            ))}
          </Box>

          {/* Specs grid */}
          {product.specs && product.specs.length > 0 && (
            <Box sx={{ pt: 2.5, mt: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                <SettingsIcon sx={{ fontSize: 18, color: 'text.primary' }} />
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  {t('product.productSpecs')}
                </Typography>
              </Box>
              <Box
                sx={{
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid',
                  borderColor: '#F1F5F9',
                  overflow: 'hidden',
                }}
              >
                {product.specs.map((spec, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      borderBottom: index < product.specs!.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ width: 110, bgcolor: '#F8FAFC', px: 1.75, py: 1.25 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'text.secondary' }}>
                        {spec.key}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, px: 1.75, py: 1.25 }}>
                      <Typography sx={{ fontSize: 12, color: 'text.primary' }}>
                        {spec.value}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Right: Info */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Breadcrumb */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pb: 1.5 }}>
            <Typography
              onClick={() => navigate('/')}
              sx={{ fontSize: 12, color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
            >
              {t('product.breadcrumbHome')}
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{product.category}</Typography>
            <ChevronRightIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>{product.name}</Typography>
          </Box>

          {/* Title + subtitle */}
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: 'text.primary' }}>
            {product.name}
          </Typography>
          {product.subtitle && (
            <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.5, mt: 1 }}>
              {product.subtitle}
            </Typography>
          )}

          {/* Price strip */}
          <Box
            sx={{
              mt: 2,
              borderRadius: 'var(--radius-md, 8px)',
              background: 'linear-gradient(135deg, #FFFBEB 0%, #FDE68A 100%)',
              p: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#92400E' }}>
                {t('product.priceLabel')}
              </Typography>
              <Typography sx={{ fontSize: 36, fontWeight: 800, color: '#92400E', lineHeight: 1 }}>
                {product.pointsPrice.toLocaleString()}
              </Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#92400E' }}>
                {t('product.points')}
              </Typography>
              {product.marketPrice && (
                <Typography sx={{ fontSize: 13, color: '#92400E', ml: 1 }}>
                  {t('product.refPrice')} ¥{product.marketPrice.toLocaleString()}
                </Typography>
              )}
            </Box>
            {product.promotion && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ bgcolor: '#92400E', color: '#fff', fontSize: 10, fontWeight: 600, px: 1, py: 0.25, borderRadius: '4px' }}>
                  {product.promotion}
                </Box>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#92400E' }}>
                  {product.subtitle || product.serviceGuarantee}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Delivery row */}
          <Box sx={{ display: 'flex', gap: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', mt: 0.5 }}>
            <Typography sx={{ fontSize: 13, color: 'text.disabled', minWidth: 40 }}>
              {t('product.deliveryRowLabel')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocalShippingIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography sx={{ fontSize: 13, color: 'text.primary' }}>
                  {product.deliveryMethod || t('product.deliveryAddr')}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 12, color: 'success.main' }}>
                {t('product.deliveryTime')}
              </Typography>
            </Box>
          </Box>

          {/* Service row */}
          <Box sx={{ display: 'flex', gap: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontSize: 13, color: 'text.disabled', minWidth: 40 }}>
              {t('product.serviceRowLabel')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {[t('product.guaranteeGenuine'), t('product.guaranteeReturn'), t('product.guaranteeWarranty')].map(
                (g) => (
                  <Box key={g} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
                    <Typography sx={{ fontSize: 12, color: 'text.primary' }}>{g}</Typography>
                  </Box>
                ),
              )}
            </Box>
          </Box>

          {/* Color options */}
          {colors.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography sx={{ fontSize: 13, color: 'text.disabled', minWidth: 40 }}>
                {t('product.colorLabel')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {colors.map((color, i) => {
                  const active = selectedColor === i;
                  return (
                    <Box
                      key={color}
                      onClick={() => setSelectedColor(i)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        px: 2,
                        py: 1,
                        borderRadius: 'var(--radius-sm, 4px)',
                        cursor: 'pointer',
                        bgcolor: active ? '#DBEAFE' : 'transparent',
                        border: '1px solid',
                        borderColor: active ? 'primary.main' : '#E2E8F0',
                        ...(active && { borderWidth: 2 }),
                      }}
                    >
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          bgcolor: COLOR_DOTS[color] || '#94A3B8',
                          border: '1px solid rgba(0,0,0,0.1)',
                        }}
                      />
                      <Typography
                        sx={{ fontSize: 12, fontWeight: active ? 500 : 400, color: active ? 'primary.main' : 'text.primary' }}
                      >
                        {color}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Quantity */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
            <Typography sx={{ fontSize: 13, color: 'text.disabled', minWidth: 40 }}>
              {t('product.qtyLabel')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                sx={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid',
                  borderColor: '#E2E8F0',
                  borderRadius: '4px 0 0 4px',
                  cursor: 'pointer',
                }}
              >
                <RemoveIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderTop: '1px solid',
                  borderBottom: '1px solid',
                  borderColor: '#E2E8F0',
                }}
              >
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{quantity}</Typography>
              </Box>
              <Box
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                sx={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid',
                  borderColor: '#E2E8F0',
                  borderRadius: '0 4px 4px 0',
                  cursor: 'pointer',
                }}
              >
                <AddIcon sx={{ fontSize: 16, color: 'text.primary' }} />
              </Box>
            </Box>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              {isSoldOut ? t('product.soldOut') : t('product.inStock', { count: product.stock })}
            </Typography>
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 1.5, pt: 2.5 }}>
            <Tooltip title={getRedeemTooltip()} arrow>
              <span>
                <Button
                  variant="contained"
                  disabled={redeemDisabled}
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => navigate(`/redeem/${product.id}/delivery`)}
                  sx={{ height: 48, px: 6, borderRadius: 'var(--radius-md, 8px)', fontSize: 16, fontWeight: 600, textTransform: 'none' }}
                >
                  {isSoldOut ? t('product.soldOut') : t('product.redeemNow')}
                </Button>
              </span>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<FavoriteBorderIcon />}
              onClick={() => setSnack(true)}
              sx={{ height: 48, px: 4, borderRadius: 'var(--radius-md, 8px)', fontSize: 14, fontWeight: 500, textTransform: 'none' }}
            >
              {t('product.addWishlist')}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setSnack(true)}
              sx={{ height: 48, minWidth: 48, width: 48, borderRadius: 'var(--radius-md, 8px)', color: 'text.secondary', borderColor: '#E2E8F0' }}
            >
              <ShareIcon sx={{ fontSize: 20 }} />
            </Button>
          </Box>

          {/* Description */}
          {product.description && (
            <Box sx={{ pt: 2.5, mt: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
                <DescriptionIcon sx={{ fontSize: 18, color: 'text.primary' }} />
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{t('product.description')}</Typography>
              </Box>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {product.description}
              </Typography>
            </Box>
          )}

          {/* Related products */}
          {related.length > 0 && (
            <Box sx={{ pt: 2, mt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <RecommendIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{t('product.relatedTitle')}</Typography>
                </Box>
                <Typography
                  onClick={() => navigate('/')}
                  sx={{ fontSize: 12, fontWeight: 500, color: 'primary.main', cursor: 'pointer' }}
                >
                  {t('product.viewMore')} →
                </Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                {related.map((rp) => (
                  <Paper
                    key={rp.id}
                    elevation={0}
                    onClick={() => navigate(`/product/${rp.id}`)}
                    sx={{
                      borderRadius: 'var(--radius-md, 8px)',
                      border: '1px solid',
                      borderColor: '#F1F5F9',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 2 },
                    }}
                  >
                    <Box sx={{ height: 90, bgcolor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShoppingBagIcon sx={{ fontSize: 36, color: '#3B82F6' }} />
                    </Box>
                    <Box sx={{ p: '10px 12px' }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rp.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <TollIcon sx={{ fontSize: 14, color: '#D97706' }} />
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#D97706' }}>
                          {rp.pointsPrice.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          )}

          {/* Balance hint */}
          {balance && (
            <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 2 }}>
              {t('product.yourBalance')}: {balance.balance.toLocaleString()} {t('product.points')}
            </Typography>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snack}
        autoHideDuration={2000}
        onClose={() => setSnack(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnack(false)}>
          {t('product.wishlistAdded')}
        </Alert>
      </Snackbar>
    </Box>
  );
}
