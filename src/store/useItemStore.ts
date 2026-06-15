import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Item, ItemCategory, WarrantyExtension } from '@/types';
import { generateId } from '@/utils/date';
import { mockItems } from '@/data/mockData';

interface ItemStore {
  items: Item[];
  warrantyExtensions: WarrantyExtension[];
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => Item | undefined;
  getItemsByCategory: (category: ItemCategory) => Item[];
  addWarrantyExtension: (ext: Omit<WarrantyExtension, 'id' | 'createdAt'>) => void;
  extendWarranty: (itemId: string, newEndDate: string, reason: string, cost: number) => void;
  importItems: (items: Item[]) => void;
  initializeMockData: () => void;
}

export const useItemStore = create<ItemStore>()(
  persist(
    (set, get) => ({
      items: [],
      warrantyExtensions: [],

      addItem: (itemData) => {
        const newItem: Item = {
          ...itemData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ items: [...state.items, newItem] }));
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          ),
        }));
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      getItemById: (id) => {
        return get().items.find((item) => item.id === id);
      },

      getItemsByCategory: (category) => {
        return get().items.filter((item) => item.category === category);
      },

      addWarrantyExtension: (ext) => {
        const newExt: WarrantyExtension = {
          ...ext,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          warrantyExtensions: [...state.warrantyExtensions, newExt],
        }));
      },

      extendWarranty: (itemId, newEndDate, reason, cost) => {
        const item = get().getItemById(itemId);
        if (!item) return;

        const ext: Omit<WarrantyExtension, 'id' | 'createdAt'> = {
          itemId,
          originalEndDate: item.warrantyEndDate,
          newEndDate,
          reason,
          cost,
        };
        get().addWarrantyExtension(ext);
        get().updateItem(itemId, {
          warrantyEndDate: newEndDate,
          originalWarrantyEndDate: item.originalWarrantyEndDate || item.warrantyEndDate,
        });
      },

      importItems: (items) => {
        set({ items });
      },

      initializeMockData: () => {
        if (get().items.length === 0) {
          set({ items: [...mockItems] });
        }
      },
    }),
    {
      name: 'item-store',
    }
  )
);
