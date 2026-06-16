import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Package,
  Tv,
  Laptop,
  Sofa,
  Car,
  Boxes,
} from 'lucide-react';
import { useItemStore } from '@/store/useItemStore';
import { cn } from '@/lib/utils';
import {
  ItemCategory,
  ITEM_CATEGORY_LABELS,
} from '@/types';

const categoryIcons: Record<ItemCategory, typeof Package> = {
  appliance: Tv,
  digital: Laptop,
  furniture: Sofa,
  car: Car,
  other: Boxes,
};

export default function ItemNew() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem, updateItem, getItemById } = useItemStore();
  const isEdit = location.pathname.includes('/edit') && !!id;

  const [form, setForm] = useState({
    name: '',
    category: 'other' as ItemCategory,
    brand: '',
    model: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseChannel: '',
    price: '',
    warrantyEndDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit) {
      const item = getItemById(id);
      if (item) {
        setForm({
          name: item.name,
          category: item.category,
          brand: item.brand,
          model: item.model,
          purchaseDate: item.purchaseDate,
          purchaseChannel: item.purchaseChannel,
          price: item.price.toString(),
          warrantyEndDate: item.warrantyEndDate,
          notes: item.notes || '',
        });
      }
    }
  }, [isEdit, id, getItemById]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = '请输入物品名称';
    if (!form.brand.trim()) newErrors.brand = '请输入品牌';
    if (!form.model.trim()) newErrors.model = '请输入型号';
    if (!form.purchaseDate) newErrors.purchaseDate = '请选择购买日期';
    if (!form.purchaseChannel.trim()) newErrors.purchaseChannel = '请输入购买渠道';
    if (!form.price || parseFloat(form.price) <= 0) newErrors.price = '请输入有效价格';
    if (!form.warrantyEndDate) newErrors.warrantyEndDate = '请选择保修截止日期';
    if (form.warrantyEndDate && form.purchaseDate && form.warrantyEndDate < form.purchaseDate) {
      newErrors.warrantyEndDate = '保修截止日期不能早于购买日期';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const itemData = {
      name: form.name.trim(),
      category: form.category,
      brand: form.brand.trim(),
      model: form.model.trim(),
      purchaseDate: form.purchaseDate,
      purchaseChannel: form.purchaseChannel.trim(),
      price: parseFloat(form.price),
      warrantyEndDate: form.warrantyEndDate,
      notes: form.notes.trim() || undefined,
    };

    if (isEdit) {
      updateItem(id, itemData);
    } else {
      addItem(itemData);
    }

    navigate('/items');
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
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            {isEdit ? '编辑物品' : '新增物品'}
          </h1>
          <p className="text-slate-500">
            {isEdit ? '修改物品信息' : '录入新的家庭物品信息'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">基本信息</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  物品名称 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="如：客厅空调"
                  className={cn(
                    'w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
                    errors.name ? 'border-danger-300 focus:ring-danger-500' : 'border-slate-200'
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-danger-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  物品类别 <span className="text-danger-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {Object.entries(ITEM_CATEGORY_LABELS).map(([key, label]) => {
                    const category = key as ItemCategory;
                    const Icon = categoryIcons[category];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm({ ...form, category })}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                          form.category === category
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    品牌 <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="如：格力"
                    className={cn(
                      'w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
                      errors.brand ? 'border-danger-300 focus:ring-danger-500' : 'border-slate-200'
                    )}
                  />
                  {errors.brand && (
                    <p className="mt-1 text-sm text-danger-600">{errors.brand}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    型号 <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="如：KFR-35GW"
                    className={cn(
                      'w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
                      errors.model ? 'border-danger-300 focus:ring-danger-500' : 'border-slate-200'
                    )}
                  />
                  {errors.model && (
                    <p className="mt-1 text-sm text-danger-600">{errors.model}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">购买信息</h2>
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    购买日期 <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.purchaseDate}
                    onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                    className={cn(
                      'w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
                      errors.purchaseDate ? 'border-danger-300 focus:ring-danger-500' : 'border-slate-200'
                    )}
                  />
                  {errors.purchaseDate && (
                    <p className="mt-1 text-sm text-danger-600">{errors.purchaseDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    保修截止日期 <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.warrantyEndDate}
                    onChange={(e) => setForm({ ...form, warrantyEndDate: e.target.value })}
                    className={cn(
                      'w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
                      errors.warrantyEndDate ? 'border-danger-300 focus:ring-danger-500' : 'border-slate-200'
                    )}
                  />
                  {errors.warrantyEndDate && (
                    <p className="mt-1 text-sm text-danger-600">{errors.warrantyEndDate}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    购买渠道 <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.purchaseChannel}
                    onChange={(e) => setForm({ ...form, purchaseChannel: e.target.value })}
                    placeholder="如：京东、苏宁实体店等"
                    className={cn(
                      'w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
                      errors.purchaseChannel ? 'border-danger-300 focus:ring-danger-500' : 'border-slate-200'
                    )}
                  />
                  {errors.purchaseChannel && (
                    <p className="mt-1 text-sm text-danger-600">{errors.purchaseChannel}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    购买价格 (元) <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={cn(
                      'w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
                      errors.price ? 'border-danger-300 focus:ring-danger-500' : 'border-slate-200'
                    )}
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-danger-600">{errors.price}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  备注
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="补充说明..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 sticky top-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">操作</h2>
            <div className="space-y-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/20 font-medium"
              >
                <Save className="w-4 h-4" />
                {isEdit ? '保存修改' : '保存物品'}
              </button>
              <Link
                to="/items"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                取消
              </Link>
            </div>

            <div className="mt-6 p-4 bg-primary-50 rounded-xl">
              <h3 className="text-sm font-medium text-primary-700 mb-2">提示</h3>
              <p className="text-sm text-primary-600">
                保存后，您可以在物品详情页中添加相关的票据、说明书和维修记录。
              </p>
            </div>

            <div className="mt-4 p-4 bg-amber-50 rounded-xl">
              <h3 className="text-sm font-medium text-amber-700 mb-2">保修提醒</h3>
              <p className="text-sm text-amber-600">
                系统将在保修到期前 30 天、7 天、3 天自动提醒您。
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
