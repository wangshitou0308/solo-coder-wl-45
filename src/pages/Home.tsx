import { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  AlertTriangle,
  Clock,
  FileText,
  Package,
  Plus,
  TrendingUp,
  Camera,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { useItemStore } from '@/store/useItemStore';
import { useReceiptStore } from '@/store/useReceiptStore';
import { useRepairStore } from '@/store/useRepairStore';
import {
  formatCurrency,
  getCurrentMonthRange,
  getDaysUntil,
  getWarrantyStatus,
  getWarrantyStatusColor,
  getWarrantyStatusText,
} from '@/utils/date';
import { cn } from '@/lib/utils';
import { Item, WarrantyStatus } from '@/types';

interface ItemWithStatus extends Item {
  status: WarrantyStatus;
  statusText: string;
  statusColor: string;
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  isCritical: boolean;
}

export default function Home() {
  const { items, initializeMockData: initItems } = useItemStore();
  const { receipts, initializeMockData: initReceipts } = useReceiptStore();
  const { repairs, initializeMockData: initRepairs } = useRepairStore();

  useEffect(() => {
    if (items.length === 0) {
      initItems();
      initReceipts();
      initRepairs();
    }
  }, [items.length, initItems, initReceipts, initRepairs]);

  const itemsWithStatus = useMemo<ItemWithStatus[]>(() => {
    return items.map((item) => {
      const status = getWarrantyStatus(item.warrantyEndDate);
      const daysRemaining = getDaysUntil(item.warrantyEndDate);
      return {
        ...item,
        status,
        statusText: getWarrantyStatusText(status),
        statusColor: getWarrantyStatusColor(status),
        daysRemaining,
        isExpired: status === 'expired',
        isExpiringSoon: status === 'expiring-30' || status === 'expiring-7' || status === 'expiring-3',
        isCritical: status === 'expiring-3' || status === 'expiring-7',
      };
    });
  }, [items]);

  const sortedItems = useMemo(() => {
    const priority: Record<string, number> = {
      'expiring-3': 0,
      'expiring-7': 1,
      'expiring-30': 2,
      'expired': 3,
      'active': 4,
    };

    return [...itemsWithStatus].sort((a, b) => {
      const priorityDiff = priority[a.status] - priority[b.status];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.warrantyEndDate).getTime() - new Date(b.warrantyEndDate).getTime();
    });
  }, [itemsWithStatus]);

  const expiringItems = sortedItems.filter((item) => item.isExpiringSoon || item.isCritical);
  const expiredItems = sortedItems.filter((item) => item.isExpired);
  const activeItems = sortedItems.filter((item) => item.status === 'active');

  const stats = useMemo(() => {
    const { start } = getCurrentMonthRange();
    const newReceiptsThisMonth = receipts.filter(
      (r) => r.createdAt >= start
    ).length;
    const totalValue = items.reduce((sum, item) => sum + item.price, 0);
    const totalRepairCost = repairs.reduce((sum, repair) => sum + repair.cost, 0);

    return {
      activeCount: activeItems.length,
      expiringCount: expiringItems.length,
      newReceipts: newReceiptsThisMonth,
      totalValue,
      totalRepairCost,
      itemCount: items.length,
    };
  }, [items, receipts, repairs, activeItems.length, expiringItems.length]);

  const getStatusAnimation = (status: string) => {
    if (status === 'expiring-3') return 'animate-pulse';
    return '';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success-100 text-success-700 border-success-200';
      case 'expiring-30': return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'expiring-7': return 'bg-danger-100 text-danger-600 border-danger-200';
      case 'expiring-3': return 'bg-danger-200 text-danger-700 border-danger-300';
      case 'expired': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">欢迎回来 👋</h1>
          <p className="text-slate-500 mt-1">这是您的家庭资产与保修概览</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/receipts/new"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/20"
          >
            <Camera className="w-4 h-4" />
            <span className="font-medium">拍照录入</span>
          </Link>
          <Link
            to="/items/new"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">添加物品</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-xl shadow-primary-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">在保物品</p>
              <p className="text-3xl font-bold mt-1">{stats.activeCount}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
          </div>
          <p className="text-primary-100 text-sm mt-3">共 {stats.itemCount} 件物品</p>
        </div>

        <div className="bg-gradient-to-br from-warning-500 to-amber-500 rounded-2xl p-6 text-white shadow-xl shadow-warning-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-warning-100 text-sm">即将到期</p>
              <p className="text-3xl font-bold mt-1">{stats.expiringCount}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-warning-100 text-sm mt-3">需要及时处理</p>
        </div>

        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 text-white shadow-xl shadow-slate-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">本月新增票据</p>
              <p className="text-3xl font-bold mt-1">{stats.newReceipts}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-300 text-sm mt-3">持续记录中</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">资产总值</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-emerald-100 text-sm mt-3">累计维修 {formatCurrency(stats.totalRepairCost)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900">保修提醒</h2>
              <p className="text-sm text-slate-500 mt-1">即将到期物品，请及时处理</p>
            </div>
            <Link
              to="/items"
              className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {sortedItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>还没有添加任何物品</p>
              <Link
                to="/items/new"
                className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-4 h-4" /> 添加第一个物品
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {sortedItems.slice(0, 8).map((item, index) => (
                <Link
                  key={item.id}
                  to={`/items/${item.id}`}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md group',
                    item.isExpired
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-100 hover:border-primary-200',
                    getStatusAnimation(item.status)
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                      item.isExpired ? 'bg-slate-200' : 'bg-primary-50'
                    )}
                  >
                    <Package
                      className={cn('w-6 h-6', item.isExpired ? 'text-slate-400' : 'text-primary-600')}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={cn(
                          'font-medium truncate',
                          item.isExpired ? 'text-slate-500' : 'text-slate-900'
                        )}
                      >
                        {item.name}
                      </h3>
                      <span
                        className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded-full border',
                          getStatusBadgeColor(item.status)
                        )}
                      >
                        {item.statusText}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {item.brand} {item.model}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {item.isExpired ? (
                      <p className="text-sm text-slate-500">已过期</p>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-slate-900">
                          {item.daysRemaining}
                        </p>
                        <p className="text-xs text-slate-500">天后到期</p>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-serif font-bold text-slate-900 mb-4">快捷操作</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/receipts/new"
                className="flex flex-col items-center gap-2 p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-primary-700">拍照录入</span>
              </Link>
              <Link
                to="/items/new"
                className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-emerald-700">添加物品</span>
              </Link>
              <Link
                to="/receipts"
                className="flex flex-col items-center gap-2 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-amber-700">票据管理</span>
              </Link>
              <Link
                to="/export"
                className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-slate-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-700">导出数据</span>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-serif font-bold text-slate-900">最近动态</h2>
            </div>
            <div className="space-y-3">
              {receipts.slice(0, 5).map((receipt) => (
                <div key={receipt.id} className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-600 truncate">{receipt.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
