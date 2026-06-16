import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FileAttachment } from '@/types';
import { generateId } from '@/utils/date';

interface FileStore {
  files: FileAttachment[];
  addFile: (file: Omit<FileAttachment, 'id' | 'createdAt'>) => string;
  deleteFile: (id: string) => void;
  deleteFilesByReceipt: (receiptId: string) => void;
  deleteFilesByItem: (itemId: string) => void;
  updateFileReceiptId: (fileId: string, receiptId: string) => void;
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
        return newFile.id;
      },

      deleteFile: (id) => {
        set((state) => ({
          files: state.files.filter((file) => file.id !== id),
        }));
      },

      deleteFilesByReceipt: (receiptId) => {
        set((state) => ({
          files: state.files.filter((file) => file.receiptId !== receiptId),
        }));
      },

      deleteFilesByItem: (itemId) => {
        set((state) => ({
          files: state.files.filter((file) => file.itemId !== itemId),
        }));
      },

      updateFileReceiptId: (fileId, receiptId) => {
        set((state) => ({
          files: state.files.map((file) =>
            file.id === fileId ? { ...file, receiptId } : file
          ),
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
