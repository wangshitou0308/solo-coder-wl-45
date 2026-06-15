import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FileAttachment } from '@/types';
import { generateId } from '@/utils/date';

interface FileStore {
  files: FileAttachment[];
  addFile: (file: Omit<FileAttachment, 'id' | 'createdAt'>) => void;
  deleteFile: (id: string) => void;
  getFileById: (id: string) => FileAttachment | undefined;
  getFilesByReceipt: (receiptId: string) => FileAttachment[];
  getFilesByItem: (itemId: string) => FileAttachment[];
}

export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      files: [],

      addFile: (fileData) => {
        const newFile: FileAttachment = {
          ...fileData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ files: [...state.files, newFile] }));
      },

      deleteFile: (id) => {
        set((state) => ({
          files: state.files.filter((file) => file.id !== id),
        }));
      },

      getFileById: (id) => {
        return get().files.find((file) => file.id === id);
      },

      getFilesByReceipt: (receiptId) => {
        return get().files.filter((file) => file.receiptId === receiptId);
      },

      getFilesByItem: (itemId) => {
        return get().files.filter((file) => file.itemId === itemId);
      },
    }),
    {
      name: 'file-store',
    }
  )
);
