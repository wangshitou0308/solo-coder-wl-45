import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Repair } from '@/types';
import { generateId } from '@/utils/date';
import { mockRepairs } from '@/data/mockData';

interface RepairStore {
  repairs: Repair[];
  addRepair: (repair: Omit<Repair, 'id' | 'createdAt'>) => void;
  updateRepair: (id: string, updates: Partial<Repair>) => void;
  deleteRepair: (id: string) => void;
  deleteRepairsByItem: (itemId: string) => void;
  getRepairsByItem: (itemId: string) => Repair[];
  getTotalRepairCost: (itemId: string) => number;
  getMonthlyRepairCosts: (months: number) => { month: string; cost: number }[];
  importRepairs: (repairs: Repair[]) => void;
  initializeMockData: () => void;
}

export const useRepairStore = create<RepairStore>()(
  persist(
    (set, get) => ({
      repairs: [],

      addRepair: (repairData) => {
        const newRepair: Repair = {
          ...repairData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ repairs: [...state.repairs, newRepair] }));
      },

      updateRepair: (id, updates) => {
        set((state) => ({
          repairs: state.repairs.map((repair) =>
            repair.id === id ? { ...repair, ...updates } : repair
          ),
        }));
      },

      deleteRepair: (id) => {
        set((state) => ({
          repairs: state.repairs.filter((repair) => repair.id !== id),
        }));
      },

      deleteRepairsByItem: (itemId) => {
        set((state) => ({
          repairs: state.repairs.filter((repair) => repair.itemId !== itemId),
        }));
      },

      getRepairsByItem: (itemId) => {
        return get()
          .repairs.filter((repair) => repair.itemId === itemId)
          .sort((a, b) => new Date(b.repairDate).getTime() - new Date(a.repairDate).getTime());
      },

      getTotalRepairCost: (itemId) => {
        return get()
          .repairs.filter((repair) => repair.itemId === itemId)
          .reduce((sum, repair) => sum + repair.cost, 0);
      },

      getMonthlyRepairCosts: (months: number) => {
        const result: { month: string; cost: number }[] = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthLabel = `${date.getFullYear()}年${date.getMonth() + 1}月`;

          const monthCost = get()
            .repairs.filter((repair) => repair.repairDate.startsWith(monthKey))
            .reduce((sum, repair) => sum + repair.cost, 0);

          result.push({ month: monthLabel, cost: monthCost });
        }

        return result;
      },

      importRepairs: (repairs) => {
        set({ repairs });
      },

      initializeMockData: () => {
        if (get().repairs.length === 0) {
          set({ repairs: [...mockRepairs] });
        }
      },
    }),
    {
      name: 'repair-store',
    }
  )
);
