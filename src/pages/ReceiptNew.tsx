import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  Check,
  Scan,
} from 'lucide-react';
import { useReceiptStore } from '@/store/useReceiptStore';
import { useItemStore } from '@/store/useItemStore';
import { useFileStore } from '@/store/useFileStore';
import { useCameraCapture } from '@/hooks/useCameraCapture';
import { readFileAsDataURL, compressImage, formatFileSize } from '@/utils/image';
import { cn } from '@/lib/utils';
import { ReceiptType, RECEIPT_TYPE_LABELS, RECEIPT_TYPE_COLORS } from '@/types';

export default function ReceiptNew() {
  const navigate = useNavigate();
  const { addReceipt } = useReceiptStore();
  const { items } = useItemStore();
  const { addFile } = useFileStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    type: 'receipt' as ReceiptType,
    itemId: '',
    issueDate: new Date().toISOString().split('T')[0],
    amount: '',
    merchant: '',
    warrantyEndDate: '',
    description: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; type: 'image' | 'pdf'; dataUrl: string; size: number }>>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    isStreaming,
    capturedImage,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
    retakePhoto,
    error,
  } = useCameraCapture({ autoCrop: true });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';

      if (!isImage && !isPDF) continue;

      try {
        let dataUrl: string;
        if (isImage) {
          dataUrl = await compressImage(file);
        } else {
          dataUrl = await readFileAsDataURL(file);
        }

        setUploadedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            type: isImage ? 'image' : 'pdf',
            dataUrl,
            size: file.size,
          },
        ]);
      } catch (err) {
        console.error('File upload error:', err);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCapture = async () => {
    const image = await capturePhoto();
    if (image) {
      setUploadedFiles((prev) => [
        ...prev,
        {
          name: `capture_${Date.now()}.jpg`,
          type: 'image',
          dataUrl: image,
          size: Math.round(image.length * 0.75),
        },
      ]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    setIsSubmitting(true);

    try {
      const fileIds: string[] = [];

      for (const file of uploadedFiles) {
        const fileId = addFile({
          name: file.name,
          type: file.type,
          dataUrl: file.dataUrl,
          size: file.size,
        });
        fileIds.push(fileId);
      }

      const newReceiptId = useReceiptStore.getState().addReceiptWithReturn({
        name: form.name,
        type: form.type,
        itemId: form.itemId || undefined,
        issueDate: form.issueDate,
        amount: form.amount ? parseFloat(form.amount) : 0,
        merchant: form.merchant,
        warrantyEndDate: form.warrantyEndDate || undefined,
        description: form.description || undefined,
        fileIds,
      });

      const { updateFileReceiptId } = useFileStore.getState();
      fileIds.forEach((fid) => updateFileReceiptId(fid, newReceiptId));

      setSuccess(true);
      setTimeout(() => {
        navigate('/receipts');
      }, 1500);
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCamera = () => {
    setShowCamera(true);
    startCamera();
  };

  const closeCamera = () => {
    setShowCamera(false);
    stopCamera();
    retakePhoto();
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 bg-success-100 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-success-600" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">录入成功！</h2>
          <p className="text-slate-500">票据信息已保存</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link
          to="/receipts"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">录入票据</h1>
          <p className="text-slate-500">记录您的购物小票、发票、保修卡等</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">基本信息</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">票据名称 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="如：洗衣机购买发票"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">票据类型 *</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(RECEIPT_TYPE_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm({ ...form, type: key as ReceiptType })}
                    className={cn(
                      'px-3 py-2.5 rounded-xl text-sm font-medium transition-all border',
                      form.type === key
                        ? cn(RECEIPT_TYPE_COLORS[key as ReceiptType], 'border-transparent')
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">关联物品</label>
              <select
                value={form.itemId}
                onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">不关联物品</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">开票日期 *</label>
              <input
                type="date"
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">金额 (元)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">商家/机构</label>
              <input
                type="text"
                value={form.merchant}
                onChange={(e) => setForm({ ...form, merchant: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="如：京东、Apple Store"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">保修截止日期</label>
              <input
                type="date"
                value={form.warrantyEndDate}
                onChange={(e) => setForm({ ...form, warrantyEndDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">备注说明</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="添加额外的说明信息..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">上传票据文件</h2>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              type="button"
              onClick={openCamera}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/20"
            >
              <Camera className="w-5 h-5" />
              <span className="font-medium">拍照录入</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
            >
              <Upload className="w-5 h-5" />
              <span className="font-medium">上传文件</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
                >
                  {file.type === 'image' ? (
                    <img
                      src={file.dataUrl}
                      alt={file.name}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-red-50">
                      <FileText className="w-12 h-12 text-red-500" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="p-2">
                    <p className="text-xs text-slate-600 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {uploadedFiles.length === 0 && (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
              <Scan className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 mb-2">支持拍照或上传图片、PDF文件</p>
              <p className="text-sm text-slate-400">拍照时将自动检测并裁剪票据边框</p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Link
            to="/receipts"
            className="flex-1 py-3.5 text-center border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !form.name}
            className={cn(
              'flex-1 py-3.5 rounded-xl font-medium transition-all',
              isSubmitting || !form.name
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/20'
            )}
          >
            {isSubmitting ? '保存中...' : '保存票据'}
          </button>
        </div>
      </form>

      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-slate-900 rounded-2xl overflow-hidden w-full max-w-2xl">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">拍照录入票据</h3>
              <button
                onClick={closeCamera}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="relative">
              {!capturedImage ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full aspect-video object-cover"
                    playsInline
                    autoPlay
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                      <p className="text-white">{error}</p>
                    </div>
                  )}
                </>
              ) : (
                <img src={capturedImage} alt="Captured" className="w-full" />
              )}
            </div>

            <div className="p-4 flex justify-center gap-4">
              {!capturedImage ? (
                <button
                  onClick={handleCapture}
                  disabled={!isStreaming}
                  className={cn(
                    'w-16 h-16 rounded-full border-4 transition-all',
                    isStreaming
                      ? 'border-white bg-danger-500 hover:bg-danger-600'
                      : 'border-slate-600 bg-slate-700 cursor-not-allowed'
                  )}
                />
              ) : (
                <>
                  <button
                    onClick={retakePhoto}
                    className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                  >
                    重拍
                  </button>
                  <button
                    onClick={() => {
                      closeCamera();
                    }}
                    className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    使用这张
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
