import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Package,
  Calendar,
  ChevronRight,
  Filter,
  X,
  Tv,
  Laptop,
  Sofa,
  Car,
  Boxes,
} from 'lucide-react';
import { useItemStore } from '@/store/useItemStore';
import { useRepairStore } from '@/store/useRepairStore';
import {
  formatCurrency,
  formatDateCN,
  getDaysUntil,
  getWarrantyStatus,
  getWarrantyStatusText,
} from '@/utils/date';
import { cn } from '@/lib/utils';
import {
  ItemCategory,
  ITEM_CATEGORY_LABELS,
  ITEM_CATEGORY_COLORS,
  WarrantyStatus,
} from '@/types';

const categoryIcons: Record<ItemCategory, typeof Package> = {
  appliance: Tv,
  digital: Laptop,
  furniture: Sofa,
  car: Car,
  other: Boxes,
};

export default function ItemList() {
  const { items } = useItemStore();
  const { getTotalRepairCost } = useRepairStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<WarrantyStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(keyword) ||
          i.brand.toLowerCase().includes(keyword) ||
          i.model.toLowerCase().includes(keyword)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((i) => i.category === selectedCategory);
    }

    if (statusFilter !== 'all') {
      result = result.filter((i) => getWarrantyStatus(i.warrantyEndDate) === statusFilter);
    }

    return result.sort((a, b) => {
      const statusA = getWarrantyStatus(a.warrantyEndDate);
      const statusB = getWarrantyStatus(b.warrantyEndDate);
      const priority: Record<string, number> = {
        'expiring-3': 0,
        'expiring-7': 1,
        'expiring-30': 2,
        'expired': 3,
        'active': 4,
      };
      return priority[statusA] - priority[statusB];
    });
  }, [items, searchKeyword, selectedCategory, statusFilter]);

  const getStatusBadgeColor = (status: WarrantyStatus) => {
    switch (status) {
      case 'active': return 'bg-success-100 text-success-700';
      case 'expiring-30': return 'bg-warning-100 text-warning-700';
      case 'expiring-7': return 'bg-danger-100 text-danger-600';
      case 'expiring-3': return 'bg-danger-200 text-danger-700';
      case 'expired': return 'bg-slate-100 text-slate-500';
    }
  };

  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; value: number }> = {};
    items.forEach((item) => {
      if (!stats[item.category]) {
        stats[item.category] = { count: 0, value: 0 };
      }
      stats[item.category].count++;
      stats[item.category].value += item.price;
    });
    return stats;
  }, [items]);

  const resetFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = selectedCategory !== 'all' || statusFilter !== 'all' || searchKeyword;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">物品管理</h1>
          <p className="text-slate-500 mt-1">共 {filteredItems.length} 件物品</p>
        </div>
        <Link
          to="/items/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">添加物品</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {Object.entries(ITEM_CATEGORY_LABELS).map(([category, label]) => {
          const stat = categoryStats[category] || { count: 0, value: 0 };
          const Icon = categoryIcons[category as ItemCategory];
          return (
            <div
              key={category}
              onClick={() =>
                setSelectedCategory(selectedCategory === category ? 'all' : (category as ItemCategory))
              }
              className={cn(
                'p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-lg',
                selectedCategory === category
                  ? 'bg-primary-50 border-primary-300 shadow-md'
                  : 'bg-white border-slate-100 hover:border-primary-200'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    ITEM_CATEGORY_COLORS[category as ItemCategory]
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{stat.count}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-700 mt-3">
                {formatCurrency(stat.value)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索物品名称、品牌、型号..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as WarrantyStatus | 'all')}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">全部状态</option>
              <option value="active">在保</option>
              <option value="expiring-30">30天内到期</option>
              <option value="expiring-7">7天内到期</option>
              <option value="expiring-3">3天内到期</option>
              <option value="expired">已过保</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-2.5 text-slate-500 hover:text-slate-700 text-sm"
              >
                <X className="w-4 h-4" />
                重置
              </button>
            )}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-16 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg text-slate-600 mb-2">暂无物品记录</p>
            <p className="text-slate-500 mb-6">添加您的第一件物品开始管理</p>
            <Link
              to="/items/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" /> 添加物品
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item, index) => {
              const status = getWarrantyStatus(item.warrantyEndDate);
              const daysRemaining = getDaysUntil(item.warrantyEndDate);
              const totalRepairCost = getTotalRepairCost(item.id);
              const Icon = categoryIcons[item.category];
              const isExpired = status === 'expired';

              return (
                <Link
                  key={item.id}
                  to={`/items/${item.id}`}
                  className={cn(
                    'group p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg',
                    isExpired
                      ? 'bg-slate-50 border-slate-200 opacity-70'
                      : 'bg-white border-slate-100 hover:border-primary-200'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        isExpired ? 'bg-slate-200' : 'bg-primary-50'
                      )}
                    >
                      <Icon
                        className={cn('w-6 h-6', isExpired ? 'text-slate-400' : 'text-primary-600')}
                      />
                    </div>
                    <span
                      className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-full',
                        getStatusBadgeColor(status)
                      )}
                    >
                      {getWarrantyStatusText(status)}
                    </span>
                  </div>

                  <h3
                    className={cn(
                      'font-semibold mb-1 group-hover:text-primary-600 transition-colors',
                      isExpired ? 'text-slate-500' : 'text-slate-900'
                    )}
                  >
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {item.brand} {item.model}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">购买价格</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                    {totalRepairCost > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">累计维修</span>
                        <span className="font-medium text-danger-600">
                          {formatCurrency(totalRepairCost)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">保修截止</span>
                      <span className={cn(isExpired ? 'text-slate-500' : 'text-slate-700')}>
                        {isExpired
                          ? '已过期'
                          : daysRemaining <= 30
                          ? `${daysRemaining}天后`
                          : formatDateCN(item.warrantyEndDate)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {ITEM_CATEGORY_LABELS[item.category]}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const status = getWarrantyStatus(item.warrantyEndDate);
              const totalRepairCost = getTotalRepairCost(item.id);
              const Icon = categoryIcons[item.category];

              return (
                <Link
                  key={item.id}
                  to={`/items/${item.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 truncate">{item.name}</p>
                      <span
                        className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded-full',
                          getStatusBadgeColor(status)
                        )}
                      >
                        {getWarrantyStatusText(status)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {item.brand} {item.model}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatCurrency(item.price)}</p>
                    {totalRepairCost > 0 && (
                      <p className="text-xs text-danger-600">维修 {formatCurrency(totalRepairCost)}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
