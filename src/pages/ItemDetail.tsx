import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Calendar,
  MapPin,
  DollarSign,
  Shield,
  FileText,
  Wrench,
  Clock,
  AlertCircle,
  ChevronRight,
  Package,
  Tv,
  Laptop,
  Sofa,
  Car,
  Boxes,
  RefreshCw,
} from 'lucide-react';
import { useItemStore } from '@/store/useItemStore';
import { useReceiptStore } from '@/store/useReceiptStore';
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
  RECEIPT_TYPE_LABELS,
  RECEIPT_TYPE_COLORS,
  WarrantyStatus,
} from '@/types';

const categoryIcons: Record<ItemCategory, typeof Package> = {
  appliance: Tv,
  digital: Laptop,
  furniture: Sofa,
  car: Car,
  other: Boxes,
};

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getItemById, deleteItem, extendWarranty } = useItemStore();
  const { getReceiptsByItem } = useReceiptStore();
  const { getRepairsByItem, getTotalRepairCost, addRepair } = useRepairStore();
  const [activeTab, setActiveTab] = useState<'info' | 'receipts' | 'repairs'>('info');
  const [showRepairForm, setShowRepairForm] = useState(false);
  const [showExtendForm, setShowExtendForm] = useState(false);

  const item = getItemById(id || '');
  const receipts = id ? getReceiptsByItem(id) : [];
  const repairs = id ? getRepairsByItem(id) : [];
  const totalRepairCost = id ? getTotalRepairCost(id) : 0;

  const [repairForm, setRepairForm] = useState({
    repairDate: new Date().toISOString().split('T')[0],
    faultDescription: '',
    repairMethod: '',
    cost: '',
    replacedParts: '',
    notes: '',
  });

  const [extendForm, setExtendForm] = useState({
    newEndDate: '',
    reason: '',
    cost: '',
  });

  const status = item ? getWarrantyStatus(item.warrantyEndDate) : 'active';
  const daysRemaining = item ? getDaysUntil(item.warrantyEndDate) : 0;
  const isExpired = status === 'expired';

  const statusInfo = useMemo(() => {
    const getColor = (s: WarrantyStatus) => {
      switch (s) {
        case 'active': return { bg: 'bg-success-500', text: 'text-success-700', light: 'bg-success-50' };
        case 'expiring-30': return { bg: 'bg-warning-500', text: 'text-warning-700', light: 'bg-warning-50' };
        case 'expiring-7': return { bg: 'bg-danger-500', text: 'text-danger-600', light: 'bg-danger-50' };
        case 'expiring-3': return { bg: 'bg-danger-600', text: 'text-danger-700', light: 'bg-danger-100' };
        case 'expired': return { bg: 'bg-slate-400', text: 'text-slate-500', light: 'bg-slate-50' };
      }
    };
    return getColor(status);
  }, [status]);

  if (!item) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <p className="text-lg text-slate-600 mb-4">物品不存在</p>
        <Link
          to="/items"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="w-4 h-4" /> 返回物品列表
        </Link>
      </div>
    );
  }

  const Icon = categoryIcons[item.category];

  const handleDelete = () => {
    if (confirm('确定要删除这个物品吗？关联的票据和维修记录也会被移除。')) {
      deleteItem(item.id);
      navigate('/items');
    }
  };

  const handleAddRepair = () => {
    if (!repairForm.faultDescription || !repairForm.cost) return;

    addRepair({
      itemId: item.id,
      repairDate: repairForm.repairDate,
      faultDescription: repairForm.faultDescription,
      repairMethod: repairForm.repairMethod,
      cost: parseFloat(repairForm.cost),
      replacedParts: repairForm.replacedParts,
      notes: repairForm.notes,
    });

    setShowRepairForm(false);
    setRepairForm({
      repairDate: new Date().toISOString().split('T')[0],
      faultDescription: '',
      repairMethod: '',
      cost: '',
      replacedParts: '',
      notes: '',
    });
  };

  const handleExtendWarranty = () => {
    if (!extendForm.newEndDate) return;

    extendWarranty(
      item.id,
      extendForm.newEndDate,
      extendForm.reason,
      extendForm.cost ? parseFloat(extendForm.cost) : 0
    );

    setShowExtendForm(false);
    setExtendForm({ newEndDate: '', reason: '', cost: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link
          to="/items"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold text-slate-900">{item.name}</h1>
          <p className="text-slate-500">
            {item.brand} {item.model}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/items/${item.id}/edit`}
            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">编辑</span>
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">删除</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div
            className={cn(
              'rounded-2xl p-6 border',
              isExpired ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100'
            )}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center',
                    isExpired ? 'bg-slate-200' : 'bg-gradient-to-br from-primary-500 to-primary-600'
                  )}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-slate-900">{item.name}</h2>
                    <span
                      className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-full',
                        statusInfo.light,
                        statusInfo.text
                      )}
                    >
                      {getWarrantyStatusText(status)}
                    </span>
                  </div>
                  <p className="text-slate-500">
                    {ITEM_CATEGORY_LABELS[item.category]} · {item.brand} {item.model}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExtendForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                延保
              </button>
            </div>

            {!isExpired && (
              <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-transparent rounded-xl">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      statusInfo.bg
                    )}
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">距离保修到期还有</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {daysRemaining} <span className="text-lg font-normal">天</span>
                    </p>
                    <p className="text-sm text-slate-500">
                      截止至 {formatDateCN(item.warrantyEndDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isExpired && (
              <div className="mb-6 p-4 bg-slate-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-300 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-700">已过保</p>
                    <p className="text-sm text-slate-500">
                      保修于 {formatDateCN(item.warrantyEndDate)} 到期
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">购买日期</span>
                </div>
                <p className="font-semibold text-slate-900">{formatDateCN(item.purchaseDate)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs">购买渠道</span>
                </div>
                <p className="font-semibold text-slate-900">{item.purchaseChannel}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">购买价格</span>
                </div>
                <p className="font-semibold text-slate-900">{formatCurrency(item.price)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Wrench className="w-4 h-4" />
                  <span className="text-xs">累计维修</span>
                </div>
                <p className="font-semibold text-danger-600">{formatCurrency(totalRepairCost)}</p>
              </div>
            </div>

            {item.notes && (
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">备注：</span>
                  {item.notes}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setActiveTab('info')}
                className={cn(
                  'flex-1 px-6 py-3 text-sm font-medium transition-colors',
                  activeTab === 'info'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                基本信息
              </button>
              <button
                onClick={() => setActiveTab('receipts')}
                className={cn(
                  'flex-1 px-6 py-3 text-sm font-medium transition-colors',
                  activeTab === 'receipts'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                票据链 ({receipts.length})
              </button>
              <button
                onClick={() => setActiveTab('repairs')}
                className={cn(
                  'flex-1 px-6 py-3 text-sm font-medium transition-colors',
                  activeTab === 'repairs'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                维修记录 ({repairs.length})
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">物品名称</label>
                      <p className="font-medium text-slate-900">{item.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">类别</label>
                      <p className="font-medium text-slate-900">
                        {ITEM_CATEGORY_LABELS[item.category]}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">品牌</label>
                      <p className="font-medium text-slate-900">{item.brand}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-500 mb-1">型号</label>
                      <p className="font-medium text-slate-900">{item.model}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'receipts' && (
                <div className="space-y-3">
                  {receipts.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>暂无关联票据</p>
                    </div>
                  ) : (
                    receipts.map((receipt, index) => (
                      <Link
                        key={receipt.id}
                        to={`/receipts/${receipt.id}`}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all group"
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary-600" />
                          </div>
                          {index < receipts.length - 1 && (
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-200" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900 truncate">
                              {receipt.name}
                            </p>
                            <span
                              className={cn(
                                'px-2 py-0.5 text-xs font-medium rounded-full',
                                RECEIPT_TYPE_COLORS[receipt.type]
                              )}
                            >
                              {RECEIPT_TYPE_LABELS[receipt.type]}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">
                            {formatDateCN(receipt.issueDate)} · {receipt.merchant}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            {formatCurrency(receipt.amount)}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 transition-colors" />
                      </Link>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'repairs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-slate-500">累计维修费用</p>
                      <p className="text-2xl font-bold text-danger-600">
                        {formatCurrency(totalRepairCost)}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowRepairForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      添加维修
                    </button>
                  </div>

                  {repairs.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Wrench className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>暂无维修记录</p>
                    </div>
                  ) : (
                    <div className="relative">
                      {repairs.map((repair, index) => (
                        <div key={repair.id} className="relative pl-8 pb-8">
                          {index < repairs.length - 1 && (
                            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-200" />
                          )}
                          <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-primary-100 border-4 border-white flex items-center justify-center">
                            <Wrench className="w-3.5 h-3.5 text-primary-600" />
                          </div>
                          <div className="bg-slate-50 rounded-xl p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-500">
                                  {formatDateCN(repair.repairDate)}
                                </span>
                              </div>
                              <span className="font-semibold text-danger-600">
                                {formatCurrency(repair.cost)}
                              </span>
                            </div>
                            <p className="font-medium text-slate-900 mb-1">
                              {repair.faultDescription}
                            </p>
                            <p className="text-sm text-slate-600 mb-2">
                              {repair.repairMethod}
                            </p>
                            {repair.replacedParts && (
                              <p className="text-xs text-slate-500">
                                更换配件：{repair.replacedParts}
                              </p>
                            )}
                            {repair.notes && (
                              <p className="text-xs text-slate-500 mt-1">备注：{repair.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-4">资产价值</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">购买价格</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(item.price)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">累计维修</span>
                <span className="font-semibold text-danger-600">
                  {formatCurrency(totalRepairCost)}
                </span>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">总投入</span>
                  <span className="text-xl font-bold text-slate-900">
                    {formatCurrency(item.price + totalRepairCost)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
            <h3 className="font-semibold mb-4">保修信息</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-primary-100">起始日期</span>
                <span>{formatDateCN(item.purchaseDate)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-primary-100">截止日期</span>
                <span>{formatDateCN(item.warrantyEndDate)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-primary-100">剩余天数</span>
                <span className={isExpired ? 'text-primary-200' : 'font-bold text-lg'}>
                  {isExpired ? '已过期' : `${daysRemaining} 天`}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowExtendForm(true)}
              className="w-full mt-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors"
            >
              申请延保
            </button>
          </div>
        </div>
      </div>

      {showRepairForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-scale-in">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">添加维修记录</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">维修日期</label>
                <input
                  type="date"
                  value={repairForm.repairDate}
                  onChange={(e) => setRepairForm({ ...repairForm, repairDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">故障描述 *</label>
                <textarea
                  value={repairForm.faultDescription}
                  onChange={(e) => setRepairForm({ ...repairForm, faultDescription: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                  placeholder="描述故障现象"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">维修方式</label>
                <input
                  type="text"
                  value={repairForm.repairMethod}
                  onChange={(e) => setRepairForm({ ...repairForm, repairMethod: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="如：更换配件、上门维修等"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">维修费用 (元) *</label>
                <input
                  type="number"
                  value={repairForm.cost}
                  onChange={(e) => setRepairForm({ ...repairForm, cost: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">更换配件</label>
                <input
                  type="text"
                  value={repairForm.replacedParts}
                  onChange={(e) => setRepairForm({ ...repairForm, replacedParts: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="列出更换的配件"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRepairForm(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddRepair}
                className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showExtendForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-scale-in">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">设置延保</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">当前保修截止</p>
                <p className="font-semibold text-slate-900">
                  {formatDateCN(item.warrantyEndDate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">新的保修截止日期 *</label>
                <input
                  type="date"
                  value={extendForm.newEndDate}
                  onChange={(e) => setExtendForm({ ...extendForm, newEndDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">延保原因</label>
                <input
                  type="text"
                  value={extendForm.reason}
                  onChange={(e) => setExtendForm({ ...extendForm, reason: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="如：购买延保服务、厂家延保等"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">延保费用 (元)</label>
                <input
                  type="number"
                  value={extendForm.cost}
                  onChange={(e) => setExtendForm({ ...extendForm, cost: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExtendForm(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleExtendWarranty}
                className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
              >
                确认延保
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
