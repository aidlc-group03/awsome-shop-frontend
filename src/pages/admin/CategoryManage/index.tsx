import { useEffect, useState, useCallback, useMemo, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { Category } from '../../../types';
import { categoryService } from '../../../services/categoryService';
import { productService } from '../../../services/productService';
import PageHeader from '../../../components/PageHeader';
import LoadingState from '../../../components/LoadingState';
import EmptyState from '../../../components/EmptyState';
import { getCategoryIcon } from './categoryIcons';
import CategoryFormDialog, { type CategoryFormPayload } from './CategoryFormDialog';
import DeleteCategoryDialog from './DeleteCategoryDialog';

const PAGE_SIZE = 10;

export default function CategoryManage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);

  // Form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [presetParentId, setPresetParentId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const list = await categoryService.getList();
      setCategories(list);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    productService
      .getList({ page: 1, size: 999 })
      .then((res) => {
        const counts: Record<string, number> = {};
        res.records.forEach((p) => {
          counts[p.category] = (counts[p.category] || 0) + 1;
        });
        setProductCounts(counts);
      })
      .catch(() => {});
  }, [categories]);

  const topLevels = useMemo(
    () =>
      categories
        .filter((c) => c.parentId == null)
        .sort((a, b) => b.sortOrder - a.sortOrder),
    [categories],
  );

  const childrenOf = useCallback(
    (id: number) =>
      categories
        .filter((c) => c.parentId === id)
        .sort((a, b) => b.sortOrder - a.sortOrder),
    [categories],
  );

  const matchKeyword = useCallback(
    (c: Category) => !keyword || c.name.toLowerCase().includes(keyword.toLowerCase()),
    [keyword],
  );
  const matchStatus = useCallback(
    (c: Category) => statusFilter === '' || c.status === Number(statusFilter),
    [statusFilter],
  );

  // Top-level groups that should be visible given current filters
  const visibleGroups = useMemo(() => {
    return topLevels
      .map((top) => {
        const children = childrenOf(top.id).filter((c) => matchKeyword(c) && matchStatus(c));
        const selfVisible = matchKeyword(top) && matchStatus(top);
        return { top, children, visible: selfVisible || children.length > 0 };
      })
      .filter((g) => g.visible);
  }, [topLevels, childrenOf, matchKeyword, matchStatus]);

  const totalGroups = visibleGroups.length;
  const pageGroups = visibleGroups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  // While searching, expand everything so matched children are visible.
  const isExpanded = (id: number) => Boolean(keyword) || expanded.has(id);

  // ---- Dialog handlers ----
  const openCreate = () => {
    setEditing(null);
    setPresetParentId(null);
    setFormOpen(true);
  };
  const openAddSub = (parentId: number) => {
    setEditing(null);
    setPresetParentId(parentId);
    setFormOpen(true);
  };
  const openEdit = (category: Category) => {
    setEditing(category);
    setPresetParentId(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (payload: CategoryFormPayload) => {
    setSubmitting(true);
    try {
      if (editing) {
        await categoryService.update({ id: editing.id, ...payload });
      } else {
        await categoryService.create(payload);
      }
      setFormOpen(false);
      fetchCategories();
    } catch {
      // Surface handled inside dialog via thrown error; keep open
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      await categoryService.updateStatus(category.id, category.status === 1 ? 0 : 1);
      fetchCategories();
    } catch {
      // ignore
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await categoryService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      // keep dialog open on failure
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderStatusChip = (status: number) => (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.25,
        py: 0.5,
        borderRadius: '12px',
        fontSize: 11,
        fontWeight: 500,
        bgcolor: status === 1 ? '#DCFCE7' : '#FEE2E2',
        color: status === 1 ? '#16A34A' : '#DC2626',
      }}
    >
      {status === 1 ? t('adminCategories.statusActive') : t('adminCategories.statusInactive')}
    </Box>
  );

  const actionBtnSx = {
    minWidth: 'auto',
    p: 0,
    fontSize: 12,
    fontWeight: 500,
    textTransform: 'none' as const,
  };

  const renderTopRow = (top: Category, children: Category[]) => {
    const iconOpt = getCategoryIcon(top.iconUrl);
    const Icon = iconOpt.Icon;
    const hasChildren = children.length > 0 || childrenOf(top.id).length > 0;
    const open = isExpanded(top.id);
    return (
      <TableRow
        key={top.id}
        sx={{ bgcolor: '#F8FAFC', opacity: top.status === 1 ? 1 : 0.6 }}
      >
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => hasChildren && toggleExpand(top.id)}
              sx={{ p: 0.25, visibility: hasChildren ? 'visible' : 'hidden' }}
            >
              {open ? (
                <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              ) : (
                <ChevronRightIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              )}
            </IconButton>
            <Icon sx={{ fontSize: 20, color: iconOpt.color }} />
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{top.name}</Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{productCounts[top.name] ?? 0}</Typography>
        </TableCell>
        <TableCell>
          <Typography sx={{ fontSize: 13 }}>{top.sortOrder}</Typography>
        </TableCell>
        <TableCell>{renderStatusChip(top.status)}</TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button sx={{ ...actionBtnSx, color: 'primary.main' }} onClick={() => openEdit(top)}>
              {t('adminCategories.edit')}
            </Button>
            <Button sx={{ ...actionBtnSx, color: 'primary.main' }} onClick={() => openAddSub(top.id)}>
              {t('adminCategories.addSub')}
            </Button>
            <Button
              sx={{ ...actionBtnSx, color: top.status === 1 ? '#F59E0B' : '#10B981' }}
              onClick={() => handleToggleStatus(top)}
            >
              {top.status === 1 ? t('adminCategories.disable') : t('adminCategories.enable')}
            </Button>
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  const renderChildRow = (child: Category) => {
    const iconOpt = getCategoryIcon(child.iconUrl);
    const Icon = iconOpt.Icon;
    return (
      <TableRow key={child.id} sx={{ opacity: child.status === 1 ? 1 : 0.6 }}>
        <TableCell sx={{ pl: '66px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: 13 }}>{child.name}</Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Typography sx={{ fontSize: 13 }}>{productCounts[child.name] ?? 0}</Typography>
        </TableCell>
        <TableCell>
          <Typography sx={{ fontSize: 13 }}>{child.sortOrder}</Typography>
        </TableCell>
        <TableCell>{renderStatusChip(child.status)}</TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button sx={{ ...actionBtnSx, color: 'primary.main' }} onClick={() => openEdit(child)}>
              {t('adminCategories.edit')}
            </Button>
            <Button sx={{ ...actionBtnSx, color: 'error.main' }} onClick={() => setDeleteTarget(child)}>
              {t('adminCategories.delete')}
            </Button>
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  const deleteParentName = deleteTarget
    ? categories.find((c) => c.id === deleteTarget.parentId)?.name ?? null
    : null;
  const deleteChildCount = deleteTarget
    ? categories.filter((c) => c.parentId === deleteTarget.id).length
    : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      <PageHeader
        title={t('adminCategories.title')}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            {t('adminCategories.create')}
          </Button>
        }
      />

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder={t('adminCategories.searchPlaceholder')}
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
          sx={{ width: 280 }}
        />
        <TextField
          select
          size="small"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          sx={{ width: 160 }}
        >
          <MenuItem value="">{t('adminCategories.allStatus')}</MenuItem>
          <MenuItem value="1">{t('adminCategories.statusActive')}</MenuItem>
          <MenuItem value="0">{t('adminCategories.statusInactive')}</MenuItem>
        </TextField>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', ml: 'auto' }}>
          {t('adminCategories.totalCount', { count: categories.length })}
        </Typography>
      </Box>

      {/* Table */}
      {loading ? (
        <LoadingState type="table" rows={5} />
      ) : totalGroups === 0 ? (
        <EmptyState message={t('adminCategories.empty')} />
      ) : (
        <>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: '#F1F5F9', borderRadius: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell>{t('adminCategories.col.name')}</TableCell>
                    <TableCell sx={{ width: 110 }}>{t('adminCategories.col.productCount')}</TableCell>
                    <TableCell sx={{ width: 110 }}>{t('adminCategories.col.sortOrder')}</TableCell>
                    <TableCell sx={{ width: 90 }}>{t('adminCategories.col.status')}</TableCell>
                    <TableCell sx={{ width: 150 }}>{t('adminCategories.col.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pageGroups.map(({ top, children }) => (
                    <Fragment key={top.id}>
                      {renderTopRow(top, children)}
                      {isExpanded(top.id) && children.map((child) => renderChildRow(child))}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Pagination */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('adminCategories.showingRange', {
                from: totalGroups === 0 ? 0 : (page - 1) * PAGE_SIZE + 1,
                to: Math.min(page * PAGE_SIZE, totalGroups),
                total: totalGroups,
              })}
            </Typography>
            <Pagination
              count={Math.max(1, Math.ceil(totalGroups / PAGE_SIZE))}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              shape="rounded"
            />
          </Box>
        </>
      )}

      <CategoryFormDialog
        open={formOpen}
        editing={editing}
        presetParentId={presetParentId}
        parentOptions={topLevels}
        submitting={submitting}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <DeleteCategoryDialog
        open={Boolean(deleteTarget)}
        category={deleteTarget}
        childCount={deleteChildCount}
        productCount={deleteTarget ? productCounts[deleteTarget.name] ?? 0 : 0}
        parentName={deleteParentName}
        loading={deleteLoading}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
