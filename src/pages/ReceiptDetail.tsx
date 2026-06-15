import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Image,
  File,
  Package,
  Download,
  Eye,
  X,
  ChevronRight,
} from 'lucide-react';
import { useReceiptStore } from '@/store/useReceiptStore';
import { useItemStore } from '@/store/useItemStore';
import { useFileStore } from '@/store/useFileStore';
import {
  formatCurrency,
  formatDateCN,
} from '@/utils/date';
import { cn } from '@/lib/utils';
import {
  RECEIPT_TYPE_LABELS,
  RECEIPT_TYPE_COLORS,
  ReceiptType,
} from '@/types';

export default function ReceiptDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReceiptById, deleteReceipt } = useReceiptStore();
  const { getItemById } = useItemStore();
  const { getFilesByReceipt } = useFileStore();
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  const receipt = getReceiptById(id || '');
  const files = id ? getFilesByReceipt(id) : [];
  const item = receipt?.itemId ? getItemById(receipt.itemId) : undefined;

  if (!receipt) {
    return (
      <div className="text-center py-16">
        <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <p className="text-lg text-slate-600 mb-4">票据不存在</p>
        <Link
          to="/receipts"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="w-4 h-4" /> 返回票据列表
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('确定要删除这张票据吗？')) {
      deleteReceipt(receipt.id);
      navigate('/receipts');
    }
  };

  const renderFilePreview = (file: typeof files[0]) => {
    if (file.type === 'image') {
      return (
        <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
          <img
            src={file.dataUrl}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    return (
      <div className="aspect-video bg-red-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <File className="w-12 h-12 mx-auto text-red-400" />
          <p className="text-sm text-red-600 mt-2">PDF 文档</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link
          to="/receipts"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold text-slate-900">{receipt.name}</h1>
          <p className="text-slate-500">{receipt.merchant}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">打印</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">编辑</span>
          </button>
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
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-slate-900">{receipt.name}</h2>
                    <span
                      className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-full',
                        RECEIPT_TYPE_COLORS[receipt.type as ReceiptType]
                      )}
                    >
                      {RECEIPT_TYPE_LABELS[receipt.type as ReceiptType]}
                    </span>
                  </div>
                  <p className="text-slate-500">{receipt.merchant}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">开具日期</span>
                </div>
                <p className="font-semibold text-slate-900">{formatDateCN(receipt.issueDate)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs">商家</span>
                </div>
                <p className="font-semibold text-slate-900 truncate">{receipt.merchant}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">金额</span>
                </div>
                <p className="font-semibold text-slate-900">{formatCurrency(receipt.amount)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs">类型</span>
                </div>
                <p className="font-semibold text-slate-900">
                  {RECEIPT_TYPE_LABELS[receipt.type as ReceiptType]}
                </p>
              </div>
            </div>

            {receipt.description && (
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">备注：</span>
                  {receipt.description}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">附件文件 ({files.length})</h3>
            </div>
            <div className="p-6">
              {files.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Image className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>暂无附件</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="group relative border border-slate-100 rounded-xl overflow-hidden hover:border-primary-200 transition-colors"
                    >
                      {renderFilePreview(file)}
                      <div className="p-3">
                        <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => setPreviewFile(file.id)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="w-8 h-8 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {item && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-4">关联物品</h3>
              <Link
                to={`/items/${item.id}`}
                className="block p-4 bg-slate-50 rounded-xl hover:bg-primary-50 hover:border-primary-200 border border-transparent transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-sm text-slate-500 truncate">
                      {item.brand} {item.model}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 transition-colors" />
                </div>
              </Link>
            </div>
          )}

          {receipt.warrantyEndDate && (
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-4">保修信息</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-100">票据日期</span>
                  <span>{formatDateCN(receipt.issueDate)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-100">保修截止</span>
                  <span>{formatDateCN(receipt.warrantyEndDate)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-100">金额</span>
                  <span className="font-bold">{formatCurrency(receipt.amount)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-4">票据信息</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">创建时间</span>
                <span className="text-slate-700">{formatDateCN(receipt.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">更新时间</span>
                <span className="text-slate-700">{formatDateCN(receipt.updatedAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">附件数量</span>
                <span className="text-slate-700">{files.length} 个</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <button
            onClick={() => setPreviewFile(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          {(() => {
            const file = files.find((f) => f.id === previewFile);
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
          })()}
        </div>
      )}
    </div>
  );
}
