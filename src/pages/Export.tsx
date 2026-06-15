import { useState, useRef } from 'react';
import {
  Download,
  Upload,
  FileText,
  FileJson,
  Check,
  AlertCircle,
  FileSpreadsheet,
  ChevronRight,
  Shield,
  Wrench,
  Package,
  Loader2,
} from 'lucide-react';
import { useItemStore } from '@/store/useItemStore';
import { useReceiptStore } from '@/store/useReceiptStore';
import { useRepairStore } from '@/store/useRepairStore';
import { useFileStore } from '@/store/useFileStore';
import {
  exportToPDF,
  exportDataAsJSON,
  importDataFromJSON,
} from '@/utils/export';
import { formatCurrency } from '@/utils/date';
import { cn } from '@/lib/utils';

export default function Export() {
  const { items } = useItemStore();
  const { receipts } = useReceiptStore();
  const { repairs } = useRepairStore();
  const { files } = useFileStore();
  const [exporting, setExporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const exportItems = items.map((item) => {
        const itemReceipts = receipts.filter((r) => r.itemId === item.id);
        const itemRepairs = repairs.filter((r) => r.itemId === item.id);
        const totalRepairCost = itemRepairs.reduce((sum, r) => sum + r.cost, 0);
        return {
          item,
          receipts: itemReceipts,
          repairs: itemRepairs,
          totalRepairCost,
        };
      });
      await exportToPDF(exportItems, '家庭物品资产清单');
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = () => {
    exportDataAsJSON(items, receipts, repairs);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportError(null);
      const data = await importDataFromJSON(file);

      if (confirm(`即将导入 ${data.items.length} 个物品、${data.receipts.length} 张票据、${data.repairs.length} 条维修记录，此操作将覆盖现有数据，确定继续吗？`)) {
        useItemStore.getState().importItems(data.items);
        useReceiptStore.getState().importReceipts(data.receipts);
        useRepairStore.getState().importRepairs(data.repairs);

        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      }
    } catch (error) {
      setImportError('导入失败，请检查文件格式是否正确');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const totalAssetValue = items.reduce((sum, item) => sum + item.price, 0);
  const totalRepairCost = repairs.reduce((sum, repair) => sum + repair.cost, 0);

  const exportCards = [
    {
      icon: FileText,
      title: '导出物品清单 PDF',
      description: '导出完整的家庭物品清单，包含所有关联票据和维修记录信息，方便资产统计和保险理赔。',
      buttonText: '导出 PDF',
      onClick: handleExportPDF,
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: FileJson,
      title: '数据备份 JSON',
      description: '将所有数据导出为 JSON 格式进行备份，可用于在其他设备上恢复数据。',
      buttonText: '导出备份',
      onClick: handleExportJSON,
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: Upload,
      title: '从备份恢复',
      description: '从 JSON 备份文件中恢复数据，此操作将覆盖当前所有数据。',
      buttonText: '选择备份文件',
      onClick: handleImportClick,
      color: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
  ];

  const stats = [
    { icon: Package, label: '物品数量', value: items.length, color: 'text-primary-600' },
    { icon: FileSpreadsheet, label: '票据数量', value: receipts.length, color: 'text-blue-600' },
    { icon: Shield, label: '在保物品', value: items.filter((i) => new Date(i.warrantyEndDate) > new Date()).length, color: 'text-green-600' },
    { icon: Wrench, label: '维修记录', value: repairs.length, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">导出中心</h1>
        <p className="text-slate-500 mt-1">导出资产清单、备份和恢复数据</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-5 border border-slate-100">
            <stat.icon className={cn('w-8 h-8 mb-3', stat.color)} />
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">家庭资产概览</h2>
            <p className="text-primary-100 mt-1">当前总资产价值</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{formatCurrency(totalAssetValue)}</p>
            <p className="text-sm text-primary-100">
              累计维修费用 {formatCurrency(totalRepairCost)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {exportCards.map((card, index) => (
          <div key={index} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className={cn('h-2 bg-gradient-to-r', card.color)} />
            <div className="p-6">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', card.iconBg)}>
                <card.icon className={cn('w-6 h-6', card.iconColor)} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
              <p className="text-sm text-slate-500 mb-6">{card.description}</p>
              <button
                onClick={card.onClick}
                disabled={exporting}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r text-white rounded-xl hover:opacity-90 transition-all font-medium disabled:opacity-50',
                  card.color
                )}
              >
                {exporting && card.title.includes('PDF') ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    导出中...
                  </>
                ) : (
                  <>
                    {card.icon === Upload ? <Upload className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    {card.buttonText}
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {importSuccess && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700">数据导入成功！</p>
        </div>
      )}

      {importError && (
        <div className="flex items-center gap-3 p-4 bg-danger-50 border border-danger-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0" />
          <p className="text-danger-700">{importError}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">导出内容预览</h3>
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => {
            const itemReceipts = receipts.filter((r) => r.itemId === item.id);
            const itemRepairs = repairs.filter((r) => r.itemId === item.id);
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{item.name}</p>
                  <p className="text-sm text-slate-500">
                    {item.brand} {item.model}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-slate-900">{formatCurrency(item.price)}</p>
                  <p className="text-xs text-slate-400">
                    {itemReceipts.length} 张票据 · {itemRepairs.length} 次维修
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>
            );
          })}
          {items.length > 5 && (
            <p className="text-center text-sm text-slate-500">
              还有 {items.length - 5} 个物品未展示...
            </p>
          )}
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800 mb-2">重要提示</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• PDF 导出包含所有物品的详细信息，可用于保险理赔和资产统计</li>
              <li>• JSON 备份包含完整数据，建议定期导出备份以防数据丢失</li>
              <li>• 导入操作将覆盖现有数据，请谨慎操作</li>
              <li>• 附件文件（图片、PDF）保存在浏览器本地存储中，定期清理浏览器数据可能导致文件丢失</li>
            </ul>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
