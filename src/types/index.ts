export type ReceiptType = 'receipt' | 'invoice' | 'warranty' | 'manual' | 'contract' | 'certificate' | 'repair';
export type ItemCategory = 'appliance' | 'digital' | 'furniture' | 'car' | 'other';
export type WarrantyStatus = 'active' | 'expiring-30' | 'expiring-7' | 'expiring-3' | 'expired';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  brand: string;
  model: string;
  purchaseDate: string;
  purchaseChannel: string;
  price: number;
  warrantyEndDate: string;
  originalWarrantyEndDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  name: string;
  type: ReceiptType;
  itemId?: string;
  issueDate: string;
  amount: number;
  merchant: string;
  warrantyEndDate?: string;
  description?: string;
  fileIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Repair {
  id: string;
  itemId: string;
  repairDate: string;
  faultDescription: string;
  repairMethod: string;
  cost: number;
  replacedParts: string;
  notes?: string;
  receiptId?: string;
  createdAt: string;
}

export interface FileAttachment {
  id: string;
  receiptId?: string;
  manualId?: string;
  itemId?: string;
  name: string;
  type: 'image' | 'pdf';
  dataUrl: string;
  size: number;
  createdAt: string;
}

export interface WarrantyExtension {
  id: string;
  itemId: string;
  originalEndDate: string;
  newEndDate: string;
  reason: string;
  cost: number;
  createdAt: string;
}

export const RECEIPT_TYPE_LABELS: Record<ReceiptType, string> = {
  receipt: '购物小票',
  invoice: '电子发票',
  warranty: '保修卡',
  manual: '说明书',
  contract: '合同',
  certificate: '证书',
  repair: '维修单',
};

export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  appliance: '家电',
  digital: '数码',
  furniture: '家具',
  car: '汽车',
  other: '其他',
};

export const RECEIPT_TYPE_COLORS: Record<ReceiptType, string> = {
  receipt: 'bg-blue-100 text-blue-700',
  invoice: 'bg-green-100 text-green-700',
  warranty: 'bg-amber-100 text-amber-700',
  manual: 'bg-purple-100 text-purple-700',
  contract: 'bg-slate-100 text-slate-700',
  certificate: 'bg-rose-100 text-rose-700',
  repair: 'bg-orange-100 text-orange-700',
};

export const ITEM_CATEGORY_COLORS: Record<ItemCategory, string> = {
  appliance: 'bg-cyan-100 text-cyan-700',
  digital: 'bg-indigo-100 text-indigo-700',
  furniture: 'bg-amber-100 text-amber-700',
  car: 'bg-red-100 text-red-700',
  other: 'bg-gray-100 text-gray-700',
};
