import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Plus,
  Package,
  Eye,
  File,
  Image,
  ChevronRight,
  Tv,
  Laptop,
  Sofa,
  Car,
  Boxes,
  X,
} from 'lucide-react';
import { useReceiptStore } from '@/store/useReceiptStore';
import { useItemStore } from '@/store/useItemStore';
import { useFileStore } from '@/store/useFileStore';
import { cn } from '@/lib/utils';
import {
  ItemCategory,
  ITEM_CATEGORY_LABELS,
  ITEM_CATEGORY_COLORS,
} from '@/types';

const categoryIcons: Record<ItemCategory, typeof Package> = {
  appliance: Tv,
  digital: Laptop,
  furniture: Sofa,
  car: Car,
  other: Boxes,
};

export default function Manuals() {
  const { getManuals } = useReceiptStore();
  const { items } = useItemStore();
  const { getFilesByReceipt } = useFileStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [previewFile, setPreviewFile] = useState<{ id: string; receiptId: string } | null>(null);

  const manuals = getManuals();

  const groupedManuals = useMemo(() => {
    let filtered = manuals;

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter((m) =>
        m.name.toLowerCase().includes(keyword) ||
        m.merchant.toLowerCase().includes(keyword) ||
        (m.description && m.description.toLowerCase().includes(keyword))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((m) => {
        const item = items.find((i) => i.id === m.itemId);
        return item?.category === selectedCategory;
      });
    }

    const grouped: Record<string, typeof manuals> = {};
    filtered.forEach((manual) => {
      const itemId = manual.itemId || 'uncategorized';
      if (!grouped[itemId]) {
        grouped[itemId] = [];
      }
      grouped[itemId].push(manual);
    });

    return grouped;
  }, [manuals, searchKeyword, selectedCategory, items]);

  const getItemById = (id: string) => items.find((i) => i.id === id);

  const categoryStats = useMemo(() => {
    const stats: Record<ItemCategory, number> = {
      appliance: 0,
      digital: 0,
      furniture: 0,
      car: 0,
      other: 0,
    };

    manuals.forEach((manual) => {
      const item = items.find((i) => i.id === manual.itemId);
      if (item) {
        stats[item.category]++;
      }
    });

    return stats;
  }, [manuals, items]);

  const renderFilePreview = (fileId: string, receiptId: string) => {
    const files = getFilesByReceipt(receiptId);
    const file = files.find((f) => f.id === fileId);
    if (!file) return null;

    if (file.type === 'image') {
      return (
        <img
          src={file.dataUrl}
          alt={file.name}
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
        />
      );
    }
    return (
      <div className="bg-white rounded-2xl p-8 max-w-md text-center">
        <File className="w-20 h-20 mx-auto text-red-400 mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">{file.name}</h3>
        <p className="text-slate-500 mb-4">PDF 文档预览</p>
        <a
          href={file.dataUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          在新窗口打开
        </a>
      </div>
    );
  };

  const renderManualCard = (manual: typeof manuals[0]) => {
    const files = getFilesByReceipt(manual.id);
    const firstFile = files[0];

    return (
      <div
        key={manual.id}
        className="group bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all"
      >
        <div className="relative aspect-[4/3] bg-slate-100">
          {firstFile?.type === 'image' ? (
            <img
              src={firstFile.dataUrl}
              alt={manual.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {firstFile?.type === 'pdf' ? (
                <File className="w-16 h-16 text-red-400" />
              ) : (
                <BookOpen className="w-16 h-16 text-slate-300" />
              )}
            </div>
          )}
          {firstFile && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPreviewFile({ id: firstFile.id, receiptId: manual.id });
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl">
                <Eye className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-600">快速预览</span>
              </div>
            </button>
          )}
        </div>
        <div className="p-4">
          <h4 className="font-medium text-slate-900 truncate">{manual.name}</h4>
          <p className="text-sm text-slate-500 mt-1 truncate">{manual.merchant}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-400">
              {files.length} 个文件
            </span>
            <Link
              to={`/receipts/${manual.id}`}
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              查看详情
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">说明书库</h1>
          <p className="text-slate-500 mt-1">共 {manuals.length} 份说明书</p>
        </div>
        <Link
          to="/receipts/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">上传说明书</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索说明书名称、品牌..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={cn(
            'p-4 rounded-xl border transition-all text-left',
            selectedCategory === 'all'
              ? 'bg-primary-50 border-primary-200'
              : 'bg-white border-slate-100 hover:border-primary-200'
          )}
        >
          <p className="text-2xl font-bold text-slate-900">{manuals.length}</p>
          <p className="text-sm text-slate-500 mt-1">全部</p>
        </button>
        {Object.entries(ITEM_CATEGORY_LABELS).map(([key, label]) => {
          const category = key as ItemCategory;
          const Icon = categoryIcons[category];
          const count = categoryStats[category];
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'p-4 rounded-xl border transition-all text-left',
                selectedCategory === category
                  ? 'bg-primary-50 border-primary-200'
                  : 'bg-white border-slate-100 hover:border-primary-200'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn('w-4 h-4', ITEM_CATEGORY_COLORS[category].replace('bg-', 'text-').split(' ')[0])} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{count}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </button>
          );
        })}
      </div>

      {Object.keys(groupedManuals).length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg text-slate-600 mb-2">暂无说明书</p>
          <p className="text-slate-500 mb-4">上传产品说明书，方便随时查阅使用指南</p>
          <Link
            to="/receipts/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            上传第一份说明书
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedManuals).map(([itemId, itemManuals]) => {
            const item = getItemById(itemId);
            const isUncategorized = itemId === 'uncategorized';
            const Icon = item ? categoryIcons[item.category] : Boxes;

            return (
              <div key={itemId} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    isUncategorized ? 'bg-slate-100' : ITEM_CATEGORY_COLORS[item!.category]
                  )}>
                    <Icon className={cn(
                      'w-5 h-5',
                      isUncategorized ? 'text-slate-600' : ITEM_CATEGORY_COLORS[item!.category].replace('bg-', 'text-').split(' ')[0]
                    )} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {isUncategorized ? '未分类' : item!.name}
                    </h3>
                    {!isUncategorized && (
                      <p className="text-sm text-slate-500">
                        {item!.brand} {item!.model} · {itemManuals.length} 份说明书
                      </p>
                    )}
                  </div>
                  {!isUncategorized && (
                    <Link
                      to={`/items/${item!.id}`}
                      className="ml-auto text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      查看物品
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {itemManuals.map(renderManualCard)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <button
            onClick={() => setPreviewFile(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          {renderFilePreview(previewFile.id, previewFile.receiptId)}
        </div>
      )}
    </div>
  );
}
