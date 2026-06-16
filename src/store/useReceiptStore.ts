import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Receipt, ReceiptType } from '@/types';
import { generateId } from '@/utils/date';
import { mockReceipts } from '@/data/mockData';
import { useFileStore } from './useFileStore';

interface ReceiptStore {
  receipts: Receipt[];
  addReceipt: (receipt: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addReceiptWithReturn: (receipt: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateReceipt: (id: string, updates: Partial<Receipt>) => void;
  deleteReceipt: (id: string) => void;
  deleteReceiptsByItem: (itemId: string) => void;
  getReceiptById: (id: string) => Receipt | undefined;
  getReceiptsByItem: (itemId: string) => Receipt[];
  getReceiptsByType: (type: ReceiptType) => Receipt[];
  getManuals: () => Receipt[];
  searchReceipts: (keyword: string) => Receipt[];
  importReceipts: (receipts: Receipt[]) => void;
  initializeMockData: () => void;
}

export const useReceiptStore = create<ReceiptStore>()(
  persist(
    (set, get) => ({
      receipts: [],

      addReceipt: (receiptData) => {
        const newReceipt: Receipt = {
          ...receiptData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ receipts: [...state.receipts, newReceipt] }));
      },

      addReceiptWithReturn: (receiptData) => {
        const newReceipt: Receipt = {
          ...receiptData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ receipts: [...state.receipts, newReceipt] }));
        return newReceipt.id;
      },

      updateReceipt: (id, updates) => {
        set((state) => ({
          receipts: state.receipts.map((receipt) =>
            receipt.id === id
              ? { ...receipt, ...updates, updatedAt: new Date().toISOString() }
              : receipt
          ),
        }));
      },

      deleteReceipt: (id) => {
        const receipt = get().getReceiptById(id);
        set((state) => ({
          receipts: state.receipts.filter((receipt) => receipt.id !== id),
        }));
        if (receipt) {
          const { deleteFilesByReceipt } = useFileStore.getState();
          deleteFilesByReceipt(id);
        }
      },

      deleteReceiptsByItem: (itemId) => {
        const receipts = get().getReceiptsByItem(itemId);
        const receiptIds = receipts.map((r) => r.id);
        set((state) => ({
          receipts: state.receipts.filter((receipt) => receipt.itemId !== itemId),
        }));
        const { deleteFilesByReceipt } = useFileStore.getState();
        receiptIds.forEach((rid) => deleteFilesByReceipt(rid));
      },

      getReceiptById: (id) => {
        return get().receipts.find((receipt) => receipt.id === id);
      },

      getReceiptsByItem: (itemId) => {
        return get().receipts.filter((receipt) => receipt.itemId === itemId);
      },

      getReceiptsByType: (type) => {
        return get().receipts.filter((receipt) => receipt.type === type);
      },

      getManuals: () => {
        return get().receipts.filter((receipt) => receipt.type === 'manual');
      },

      searchReceipts: (keyword) => {
        const lowerKeyword = keyword.toLowerCase();
        return get().receipts.filter(
          (receipt) =>
            receipt.name.toLowerCase().includes(lowerKeyword) ||
            receipt.merchant.toLowerCase().includes(lowerKeyword) ||
            (receipt.description && receipt.description.toLowerCase().includes(lowerKeyword))
        );
      },

      importReceipts: (receipts) => {
        set({ receipts });
      },

      initializeMockData: () => {
        if (get().receipts.length === 0) {
          set({ receipts: [...mockReceipts] });
        }
      },
    }),
    {
      name: 'receipt-store',
    }
  )
);
