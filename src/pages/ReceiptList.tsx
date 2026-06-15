import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  FileText,
  Calendar,
  ChevronRight,
  Receipt as ReceiptIcon,
  X,
} from 'lucide-react';
import { useReceiptStore } from '@/store/useReceiptStore';
import { useItemStore } from '@/store/useItemStore';
import {
  formatCurrency,
  formatDateCN,
} from '@/utils/date';
import { cn } from '@/lib/utils';
import {
  ReceiptType,
  RECEIPT_TYPE_LABELS,
  RECEIPT_TYPE_COLORS,
  ItemCategory,
  ITEM_CATEGORY_LABELS,
} from '@/types';

export default function ReceiptList() {
  const { receipts } = useReceiptStore();
  const { items } = useItemStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedType, setSelectedType] = useState<ReceiptType | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredReceipts = useMemo(() => {
    let result = [...receipts];

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(keyword) ||
          r.merchant.toLowerCase().includes(keyword) ||
          (r.description && r.description.toLowerCase().includes(keyword))
      );
    }

    if (selectedType !== 'all') {
      result = result.filter((r) => r.type === selectedType);
    }

    if (selectedItem !== 'all') {
      result = result.filter((r) => r.itemId === selectedItem);
    }

    return result.sort(
      (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    );
  }, [receipts, searchKeyword, selectedType, selectedItem]);

  const getItemName = (itemId?: string) => {
    if (!itemId) return '未关联';
    const item = items.find((i) => i.id === itemId);
    return item ? item.name : '未知物品';
  };

  const resetFilters = () => {
    setSearchKeyword('');
    setSelectedType('all');
    setSelectedItem('all');
  };

  const hasActiveFilters = selectedType !== 'all' || selectedItem !== 'all' || searchKeyword;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">票据管理</h1>
          <p className="text-slate-500 mt-1">共 {filteredReceipts.length} 张票据</p>
        </div>
        <Link
          to="/receipts/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">录入票据</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索票据名称、商家..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all',
                showFilters || hasActiveFilters
                  ? 'bg-primary-50 border-primary-200 text-primary-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">筛选</span>
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                  {(selectedType !== 'all' ? 1 : 0) + (selectedItem !== 'all' ? 1 : 0) + (searchKeyword ? 1 : 0)}
                </span>
              )}
            </button>
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

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">票据类型</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as ReceiptType | 'all')}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">全部类型</option>
                  {Object.entries(RECEIPT_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">关联物品</label>
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">全部物品</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  票据信息
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  日期
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  关联物品
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500">暂无票据记录</p>
                    <Link
                      to="/receipts/new"
                      className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700"
                    >
                      <Plus className="w-4 h-4" /> 录入第一张票据
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((receipt, index) => (
                  <tr
                    key={receipt.id}
                    className="hover:bg-slate-50 transition-colors group"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ReceiptIcon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{receipt.name}</p>
                          <p className="text-sm text-slate-500 truncate">{receipt.merchant}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex px-2.5 py-1 text-xs font-medium rounded-full',
                          RECEIPT_TYPE_COLORS[receipt.type]
                        )}
                      >
                        {RECEIPT_TYPE_LABELS[receipt.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{formatDateCN(receipt.issueDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(receipt.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{getItemName(receipt.itemId)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/receipts/${receipt.id}`}
                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        查看 <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.entries(RECEIPT_TYPE_LABELS).map(([type, label]) => {
          const count = receipts.filter((r) => r.type === type).length;
          return (
            <div
              key={type}
              onClick={() => {
                setSelectedType(type as ReceiptType);
                setShowFilters(true);
              }}
              className={cn(
                'p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md',
                selectedType === type
                  ? 'bg-primary-50 border-primary-200'
                  : 'bg-white border-slate-100 hover:border-primary-200'
              )}
            >
              <p className="text-2xl font-bold text-slate-900">{count}</p>
              <p className="text-sm text-slate-500 mt-1">{label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
