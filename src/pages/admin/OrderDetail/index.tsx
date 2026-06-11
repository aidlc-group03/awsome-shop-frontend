import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CancelIcon from '@mui/icons-material/Cancel';
import PrintIcon from '@mui/icons-material/Print';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import type {
  Order,
  OrderStatus,
  OrderTimelineEvent,
  OrderTimelineKey,
  PointsAccount,
  UserInfo,
} from '../../../types';
import { orderService } from '../../../services/orderService';
import { userService } from '../../../services/userService';
import { pointsService } from '../../../services/pointsService';
import LoadingState from '../../../components/LoadingState';
import ConfirmDialog from '../../../components/ConfirmDialog';
import ShippingStatusDialog from '../../../components/ShippingStatusDialog';

// ============== status badge ==============
type BadgeKey = 'pending' | 'shipping' | 'completed' | 'cancelled';

const BADGE_KEY: Record<OrderStatus, BadgeKey> = {
  pending: 'pending',
  confirmed: 'pending',
  shipping: 'shipping',
  completed: 'completed',
  cancelled: 'cancelled',
};

const BADGE_COLOR: Record<BadgeKey, { bg: string; fg: string }> = {
  pending: { bg: '#FFF7ED', fg: '#D97706' },
  shipping: { bg: '#DBEAFE', fg: '#2563EB' },
  completed: { bg: '#DCFCE7', fg: '#16A34A' },
  cancelled: { bg: '#FEE2E2', fg: '#DC2626' },
};

const TIMELINE_LABEL_KEY: Record<OrderTimelineKey, string> = {
  submitted: 'tlSubmitted',
  confirmed: 'tlConfirmed',
  pending_ship: 'tlPending',
  shipping: 'tlShipping',
  completed: 'tlCompleted',
  cancelled: 'tlCancelled',
};

const TIMELINE_DESC_KEY: Record<OrderTimelineKey, string> = {
  submitted: 'tlSubmittedDesc',
  confirmed: 'tlConfirmedDesc',
  pending_ship: 'tlPendingDesc',
  shipping: 'tlShippingDesc',
  completed: 'tlCompletedDesc',
  cancelled: 'tlCancelledDesc',
};

function buildTimeline(order: Order): OrderTimelineEvent[] {
  if (order.statusHistory && order.statusHistory.length > 0) {
    return order.statusHistory;
  }
  // Fallback synthesis from createdAt + status
  const events: OrderTimelineEvent[] = [
    { key: 'submitted', occurredAt: order.createdAt },
  ];
  if (order.status !== 'pending') {
    events.push({ key: 'confirmed', occurredAt: order.createdAt });
  }
  if (order.status === 'shipping' || order.status === 'completed') {
    events.push({ key: 'shipping', occurredAt: order.updatedAt });
  }
  if (order.status === 'completed') {
    events.push({ key: 'completed', occurredAt: order.updatedAt });
  }
  if (order.status === 'cancelled') {
    events.push({ key: 'cancelled', occurredAt: order.updatedAt });
  }
  return events;
}

function formatDateTime(s: string): string {
  const d = new Date(s);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

const cardSx = {
  borderRadius: '12px',
  border: '1px solid #F1F5F9',
  bgcolor: '#fff',
  p: 3,
} as const;

export default function AdminOrderDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [account, setAccount] = useState<PointsAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const ord = await orderService.getById(Number(id));
      setOrder(ord);
      // Fetch employee info & account in parallel
      const [userList, acc] = await Promise.all([
        userService.getList({ page: 1, size: 999 }),
        pointsService.getUserAccount(ord.userId).catch(() => null),
      ]);
      const matched = userList.records.find((u) => u.id === ord.userId) ?? null;
      setUser(matched);
      setAccount(acc);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Box sx={{ p: '24px 32px' }}>
        <LoadingState type="detail" />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: '24px 32px' }}>
        <Typography>{t('adminOrders.detail.notFound')}</Typography>
        <Button onClick={() => navigate('/admin/orders')} sx={{ mt: 2, textTransform: 'none' }}>
          {t('adminOrders.detail.back')}
        </Button>
      </Box>
    );
  }

  const badgeKey = BADGE_KEY[order.status];
  const badge = BADGE_COLOR[badgeKey];
  const isCancellable = order.status === 'pending' || order.status === 'confirmed';
  const isShippable = order.status === 'pending' || order.status === 'confirmed' || order.status === 'shipping';
  const timeline = buildTimeline(order);
  const balanceAfter = account ? account.balance : null;

  const handleCancelConfirm = async () => {
    setCancelLoading(true);
    try {
      await orderService.updateStatus(order.id, 'cancelled');
      setCancelOpen(false);
      setSnack({ open: true, message: t('adminOrders.detail.cancelSuccess'), severity: 'success' });
      fetchData();
    } catch (err) {
      setSnack({
        open: true,
        message: err instanceof Error ? err.message : t('adminOrders.shippingDialog.submitError'),
        severity: 'error',
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleShippingSuccess = (updated: Order) => {
    setOrder(updated);
    setSnack({ open: true, message: t('adminOrders.detail.shipSuccess'), severity: 'success' });
    // Refresh ancillary data (status history is in order)
    fetchData();
  };

  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', flexShrink: 0 }}>{label}</Typography>
      <Typography
        sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary', textAlign: 'right', maxWidth: 220, ml: 2 }}
      >
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Breadcrumb */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography
              onClick={() => navigate('/admin/orders')}
              sx={{ fontSize: 13, color: 'primary.main', cursor: 'pointer' }}
            >
              {t('adminOrders.detail.breadcrumbList')}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>/</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {t('adminOrders.detail.breadcrumbDetail')}
            </Typography>
          </Box>
          {/* Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: 'text.primary' }}>
              {order.orderNo}
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 1.5,
                py: 0.5,
                borderRadius: 12,
                bgcolor: badge.bg,
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: badge.fg }}>
                {t(`adminOrders.statusBadge.${badgeKey}`)}
              </Typography>
            </Box>
          </Box>
        </Box>
        {/* Action buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon sx={{ fontSize: 18 }} />}
            disabled={!isCancellable}
            onClick={() => setCancelOpen(true)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: 13,
              fontWeight: 500,
              borderColor: 'error.main',
              color: 'error.main',
              px: 2,
              py: 1,
            }}
          >
            {t('adminOrders.detail.actionCancel')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon sx={{ fontSize: 18 }} />}
            onClick={() => window.print()}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: 13,
              fontWeight: 500,
              borderColor: '#E2E8F0',
              color: 'text.primary',
              px: 2,
              py: 1,
            }}
          >
            {t('adminOrders.detail.actionPrint')}
          </Button>
          <Button
            variant="contained"
            startIcon={<LocalShippingIcon sx={{ fontSize: 18 }} />}
            disabled={!isShippable}
            onClick={() => setShippingOpen(true)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: 13,
              fontWeight: 600,
              px: 2,
              py: 1,
            }}
          >
            {t('adminOrders.detail.actionShip')}
          </Button>
        </Box>
      </Box>

      {/* Two-column layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 3 }}>
        {/* Left column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Product card */}
          <Paper elevation={0} sx={cardSx}>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
              {t('adminOrders.detail.productInfo')}
            </Typography>
            <Box sx={{ borderTop: '1px solid #F1F5F9', my: 2.5 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '12px',
                  bgcolor: order.productImageColor || '#DBEAFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <HeadphonesIcon sx={{ fontSize: 36, color: '#2563EB' }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{order.productName}</Typography>
                {(order.productSpec || order.productCategory) && (
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                    {t('adminOrders.detail.specsLabel', {
                      spec: order.productSpec || '—',
                      category: order.productCategory || '—',
                    })}
                  </Typography>
                )}
                {order.productSku && (
                  <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
                    {t('adminOrders.detail.skuLabel', { sku: order.productSku })}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.25 }}>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'primary.main' }}>
                  {order.pointsAmount.toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  {t('adminOrders.detail.pointsUnit')}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Points card */}
          <Paper elevation={0} sx={cardSx}>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
              {t('adminOrders.detail.pointsTitle')}
            </Typography>
            <Box sx={{ borderTop: '1px solid #F1F5F9', my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <InfoRow
                label={t('adminOrders.detail.pointsItem')}
                value={order.pointsAmount.toLocaleString()}
              />
              <InfoRow
                label={t('adminOrders.detail.pointsShipping')}
                value={(order.shippingPoints ?? 0).toLocaleString()}
              />
              <Box sx={{ borderTop: '1px solid #F1F5F9', my: 0.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  {t('adminOrders.detail.pointsTotal')}
                </Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'primary.main' }}>
                  {(order.pointsAmount + (order.shippingPoints ?? 0)).toLocaleString()}{' '}
                  {t('adminOrders.detail.pointsUnit')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  {t('adminOrders.detail.pointsBalance')}
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  {balanceAfter !== null
                    ? `${balanceAfter.toLocaleString()} ${t('adminOrders.detail.pointsUnit')}`
                    : '—'}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Employee card */}
          <Paper elevation={0} sx={cardSx}>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
              {t('adminOrders.detail.empTitle')}
            </Typography>
            <Box sx={{ borderTop: '1px solid #F1F5F9', my: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 2, columnGap: 2 }}>
              <FieldBlock
                label={t('adminOrders.detail.empName')}
                value={user?.displayName ?? order.recipientName}
              />
              <FieldBlock
                label={t('adminOrders.detail.empNo')}
                value={user?.empNo || t('adminOrders.detail.empPlaceholder')}
              />
              <FieldBlock
                label={t('adminOrders.detail.empDept')}
                value={user?.department || t('adminOrders.detail.empPlaceholder')}
              />
              <FieldBlock
                label={t('adminOrders.detail.empContact')}
                value={user?.email || order.recipientPhone}
              />
            </Box>
          </Paper>
        </Box>

        {/* Right column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Status timeline */}
          <Paper elevation={0} sx={cardSx}>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
              {t('adminOrders.detail.statusTitle')}
            </Typography>
            <Box sx={{ borderTop: '1px solid #F1F5F9', my: 2.5 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {[...timeline].reverse().map((event, index, arr) => {
                const isLatest = index === 0;
                const isLast = index === arr.length - 1;
                return (
                  <Box key={`${event.key}-${event.occurredAt}`} sx={{ display: 'flex', gap: 1.75 }}>
                    {/* Dot + connector */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: isLatest ? '#2563EB' : '#D1D5DB',
                          ...(isLatest && {
                            boxShadow: '0 0 0 3px #DBEAFE',
                          }),
                        }}
                      />
                      {!isLast && (
                        <Box sx={{ width: 2, flexGrow: 1, minHeight: 28, bgcolor: '#E5E7EB', my: 0.5 }} />
                      )}
                    </Box>
                    {/* Content */}
                    <Box sx={{ flex: 1, pb: isLast ? 0 : 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: isLatest ? 600 : 500,
                            color: isLatest ? '#2563EB' : 'text.primary',
                          }}
                        >
                          {t(`adminOrders.detail.${TIMELINE_LABEL_KEY[event.key]}`)}
                        </Typography>
                        {isLatest && (
                          <Box
                            sx={{
                              px: 1,
                              py: 0.25,
                              borderRadius: '4px',
                              bgcolor: '#DBEAFE',
                            }}
                          >
                            <Typography sx={{ fontSize: 10, fontWeight: 500, color: '#2563EB' }}>
                              {t('adminOrders.detail.statusCurrent')}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
                        {event.description ||
                          t(`adminOrders.detail.${TIMELINE_DESC_KEY[event.key]}`)}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.25 }}>
                        {formatDateTime(event.occurredAt)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>

          {/* Order info */}
          <Paper elevation={0} sx={{ ...cardSx, p: 3 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
              {t('adminOrders.detail.orderInfoTitle')}
            </Typography>
            <Box sx={{ borderTop: '1px solid #F1F5F9', my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <InfoRow label={t('adminOrders.detail.orderNo')} value={order.orderNo} />
              <InfoRow
                label={t('adminOrders.detail.createTime')}
                value={formatDateTime(order.createdAt)}
              />
              <InfoRow
                label={t('adminOrders.detail.orderSource')}
                value={
                  order.orderSource === 'mobile'
                    ? t('adminOrders.detail.orderSourceMobile')
                    : t('adminOrders.detail.orderSourcePc')
                }
              />
              <InfoRow
                label={t('adminOrders.detail.orderNote')}
                value={
                  order.orderNote ? (
                    order.orderNote
                  ) : (
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      {t('adminOrders.detail.orderNoteEmpty')}
                    </Box>
                  )
                }
              />
            </Box>
          </Paper>

          {/* Delivery info */}
          <Paper elevation={0} sx={{ ...cardSx, p: 3 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
              {t('adminOrders.detail.deliveryTitle')}
            </Typography>
            <Box sx={{ borderTop: '1px solid #F1F5F9', my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
              <InfoRow label={t('adminOrders.detail.deliveryName')} value={order.recipientName} />
              <InfoRow label={t('adminOrders.detail.deliveryPhone')} value={order.recipientPhone} />
              <InfoRow label={t('adminOrders.detail.deliveryAddr')} value={order.recipientAddress} />
            </Box>
          </Paper>

          {/* Logistics card (only when shipped) */}
          {(order.expressCompany || order.trackingNumber) && (
            <Paper elevation={0} sx={{ ...cardSx, p: 3 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                {t('adminOrders.detail.expressTitle')}
              </Typography>
              <Box sx={{ borderTop: '1px solid #F1F5F9', my: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                {order.expressCompany && (
                  <InfoRow
                    label={t('adminOrders.detail.expressCompany')}
                    value={order.expressCompany}
                  />
                )}
                {order.trackingNumber && (
                  <InfoRow
                    label={t('adminOrders.detail.trackingNumber')}
                    value={order.trackingNumber}
                  />
                )}
                {order.shippingNote && (
                  <InfoRow
                    label={t('adminOrders.detail.shippingNote')}
                    value={order.shippingNote}
                  />
                )}
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Cancel confirm dialog */}
      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancelConfirm}
        title={t('adminOrders.detail.cancelConfirmTitle')}
        content={t('adminOrders.detail.cancelConfirmContent')}
        confirmText={t('adminOrders.detail.actionCancel')}
        loading={cancelLoading}
      />

      {/* Shipping status dialog */}
      <ShippingStatusDialog
        open={shippingOpen}
        order={order}
        onClose={() => setShippingOpen(false)}
        onSuccess={handleShippingSuccess}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function FieldBlock({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{label}</Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}>{value}</Typography>
    </Box>
  );
}
