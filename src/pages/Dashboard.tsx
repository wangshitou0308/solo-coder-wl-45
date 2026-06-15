import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Shield,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingUp,
  Package,
  BarChart3,
} from 'lucide-react';
import { useItemStore } from '@/store/useItemStore';
import { useReceiptStore } from '@/store/useReceiptStore';
import { useRepairStore } from '@/store/useRepairStore';
import {
  formatCurrency,
  getWarrantyStatus,
  getCurrentMonthRange,
} from '@/utils/date';
import {
  ITEM_CATEGORY_LABELS,
  ItemCategory,
} from '@/types';

const COLORS = ['#0F766E', '#F59E0B', '#F43F5E', '#10B981', '#6366F1'];

export default function Dashboard() {
  const { items } = useItemStore();
  const { receipts } = useReceiptStore();
  const { repairs, getMonthlyRepairCosts, getTotalRepairCost } = useRepairStore();

  const stats = useMemo(() => {
    const activeCount = items.filter(
      (i) => getWarrantyStatus(i.warrantyEndDate) === 'active'
    ).length;
    const expiringCount = items.filter((i) => {
      const status = getWarrantyStatus(i.warrantyEndDate);
      return status !== 'active' && status !== 'expired';
    }).length;
    const expiredCount = items.filter(
      (i) => getWarrantyStatus(i.warrantyEndDate) === 'expired'
    ).length;

    const { start } = getCurrentMonthRange();
    const newReceiptsThisMonth = receipts.filter(
      (r) => r.createdAt >= start
    ).length;

    const totalValue = items.reduce((sum, i) => sum + i.price, 0);
    const totalRepair = repairs.reduce((sum, r) => sum + r.cost, 0);

    return {
      activeCount,
      expiringCount,
      expiredCount,
      newReceiptsThisMonth,
      totalValue,
      totalRepair,
      itemCount: items.length,
      receiptCount: receipts.length,
    };
  }, [items, receipts, repairs]);

  const warrantyStatusData = useMemo(() => {
    return [
      { name: '在保', value: stats.activeCount, color: '#10B981' },
      { name: '30天内到期', value: items.filter((i) => getWarrantyStatus(i.warrantyEndDate) === 'expiring-30').length, color: '#F59E0B' },
      { name: '7天内到期', value: items.filter((i) => getWarrantyStatus(i.warrantyEndDate) === 'expiring-7').length, color: '#F97316' },
      { name: '3天内到期', value: items.filter((i) => getWarrantyStatus(i.warrantyEndDate) === 'expiring-3').length, color: '#F43F5E' },
      { name: '已过保', value: stats.expiredCount, color: '#6B7280' },
    ].filter((d) => d.value > 0);
  }, [items, stats]);

  const categoryValueData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    items.forEach((item) => {
      if (!categoryMap[item.category]) {
        categoryMap[item.category] = 0;
      }
      categoryMap[item.category] += item.price;
    });

    return Object.entries(categoryMap).map(([key, value]) => ({
      name: ITEM_CATEGORY_LABELS[key as ItemCategory],
      value,
    })).sort((a, b) => b.value - a.value);
  }, [items]);

  const categoryCountData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    items.forEach((item) => {
      if (!categoryMap[item.category]) {
        categoryMap[item.category] = 0;
      }
      categoryMap[item.category]++;
    });

    return Object.entries(categoryMap).map(([key, count]) => ({
      name: ITEM_CATEGORY_LABELS[key as ItemCategory],
      count,
    })).sort((a, b) => b.count - a.count);
  }, [items]);

  const monthlyRepairData = useMemo(() => {
    return getMonthlyRepairCosts(6);
  }, [getMonthlyRepairCosts]);

  const mostExpensiveItems = useMemo(() => {
    return items
      .map((item) => ({
        ...item,
        totalRepair: getTotalRepairCost(item.id),
        totalCost: item.price + getTotalRepairCost(item.id),
      }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5);
  }, [items, getTotalRepairCost]);

  const expiringItems = useMemo(() => {
    return items
      .filter((i) => {
        const status = getWarrantyStatus(i.warrantyEndDate);
        return status !== 'active' && status !== 'expired';
      })
      .sort((a, b) => {
        const statusPriority: Record<string, number> = {
          'expiring-3': 0,
          'expiring-7': 1,
          'expiring-30': 2,
        };
        const statusA = getWarrantyStatus(a.warrantyEndDate);
        const statusB = getWarrantyStatus(b.warrantyEndDate);
        return statusPriority[statusA] - statusPriority[statusB];
      })
      .slice(0, 5);
  }, [items]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">数据看板</h1>
        <p className="text-slate-500 mt-1">多维度分析您的家庭资产与保修状态</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.activeCount}</p>
              <p className="text-xs text-slate-500">在保物品</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.expiringCount}</p>
              <p className="text-xs text-slate-500">即将到期</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.newReceiptsThisMonth}</p>
              <p className="text-xs text-slate-500">本月新增票据</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(stats.totalValue)}
              </p>
              <p className="text-xs text-slate-500">资产总值</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            保修状态分布
          </h3>
          <div className="h-64">
            {warrantyStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={warrantyStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {warrantyStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} 件`, '数量']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                暂无数据
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-600" />
            类别金额分布
          </h3>
          <div className="h-64">
            {categoryValueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryValueData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={60} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), '金额']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {categoryValueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                暂无数据
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            维修费用月度趋势
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRepairData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `¥${v}`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), '维修费用']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#0F766E"
                  strokeWidth={3}
                  dot={{ fill: '#0F766E', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary-600" />
            最费钱物品排行
          </h3>
          <div className="space-y-4">
            {mostExpensiveItems.map((item, index) => (
              <div key={item.id} className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    index === 0
                      ? 'bg-amber-100 text-amber-700'
                      : index === 1
                      ? 'bg-slate-100 text-slate-600'
                      : index === 2
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-slate-50 text-slate-500'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    {item.brand} {item.model}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(item.totalCost)}
                  </p>
                  {item.totalRepair > 0 && (
                    <p className="text-xs text-danger-600">
                      维修 {formatCurrency(item.totalRepair)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">类别数量统计</h3>
          <div className="grid grid-cols-2 gap-4">
            {categoryCountData.map((item, index) => (
              <div key={item.name} className="p-4 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-slate-900">{item.count}</p>
                <p className="text-sm text-slate-500">{item.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">即将到期提醒</h3>
          <div className="space-y-3">
            {expiringItems.length > 0 ? (
              expiringItems.map((item) => {
                const status = getWarrantyStatus(item.warrantyEndDate);
                const statusColors: Record<string, string> = {
                  'expiring-30': 'bg-warning-100 text-warning-700',
                  'expiring-7': 'bg-danger-100 text-danger-600',
                  'expiring-3': 'bg-danger-200 text-danger-700',
                };
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        {item.brand} {item.model}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}
                    >
                      {status === 'expiring-3'
                        ? '3天内'
                        : status === 'expiring-7'
                        ? '7天内'
                        : '30天内'}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Shield className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>暂无即将到期的物品</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
