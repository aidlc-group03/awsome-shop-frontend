import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Pagination from '@mui/material/Pagination';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import type { Product, Category } from '../../types';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import ProductCard from '../../components/ProductCard';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';

export default function ShopHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: pageSize,
        status: 1,
        ...(activeCategory ? { category: activeCategory } : {}),
      };
      const result = await productService.getList(params);
      // BR-F2.1: Server-side filtering by status=1
      setProducts(result.records);
      setTotalPages(result.pages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const list = await categoryService.getPublicList();
        setCategories(list);
      } catch {
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    // BR-F2.2: "All" removes filter
    if (categoryName === activeCategory) {
      setActiveCategory('');
    } else {
      setActiveCategory(categoryName);
    }
    setPage(1);
  };

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      {/* Hero Banner */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 160,
          borderRadius: '12px',
          px: '40px',
          background: 'linear-gradient(90deg, #2563EB 0%, #60A5FA 100%)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>
            {t('employee.heroTitle')}
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
            {t('employee.heroSubtitle')}
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: '#fff',
              color: '#2563EB',
              borderRadius: '20px',
              px: '20px',
              py: '8px',
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'none',
              alignSelf: 'flex-start',
              '&:hover': { bgcolor: '#f0f0f0' },
            }}
          >
            {t('employee.heroBrowse')}
          </Button>
        </Box>
        <ShoppingBagIcon sx={{ fontSize: 100, color: 'rgba(255,255,255,0.2)' }} />
      </Box>

      {/* Category Filter */}
      <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Chip
          label={t('employee.allCategories')}
          onClick={() => handleCategoryClick('')}
          sx={{
            borderRadius: '20px',
            fontSize: 13,
            fontWeight: !activeCategory ? 600 : 400,
            color: !activeCategory ? '#fff' : '#64748B',
            bgcolor: !activeCategory ? '#2563EB' : '#fff',
            border: !activeCategory ? 'none' : '1px solid #E2E8F0',
            height: 'auto',
            py: '8px',
            px: '18px',
            '& .MuiChip-label': { p: 0 },
            '&:hover': {
              bgcolor: !activeCategory ? '#2563EB' : '#F8FAFC',
            },
          }}
        />
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.name}
            onClick={() => handleCategoryClick(cat.name)}
            sx={{
              borderRadius: '20px',
              fontSize: 13,
              fontWeight: activeCategory === cat.name ? 600 : 400,
              color: activeCategory === cat.name ? '#fff' : '#64748B',
              bgcolor: activeCategory === cat.name ? '#2563EB' : '#fff',
              border: activeCategory === cat.name ? 'none' : '1px solid #E2E8F0',
              height: 'auto',
              py: '8px',
              px: '18px',
              '& .MuiChip-label': { p: 0 },
              '&:hover': {
                bgcolor: activeCategory === cat.name ? '#2563EB' : '#F8FAFC',
              },
            }}
          />
        ))}
      </Box>

      {/* Product Grid */}
      {loading ? (
        <LoadingState type="card" />
      ) : products.length === 0 ? (
        <EmptyState message={t('employee.noProducts')} />
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
            }}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product)}
              />
            ))}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
