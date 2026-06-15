import { differenceInDays, format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { WarrantyStatus } from '@/types';

export const formatDate = (date: string | Date, fmt: string = 'yyyy-MM-dd'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt, { locale: zhCN });
};

export const formatDateCN = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy年MM月dd日', { locale: zhCN });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const getDaysUntil = (targetDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = parseISO(targetDate);
  target.setHours(0, 0, 0, 0);
  return differenceInDays(target, today);
};

export const getWarrantyStatus = (warrantyEndDate: string): WarrantyStatus => {
  const days = getDaysUntil(warrantyEndDate);
  if (days < 0) return 'expired';
  if (days <= 3) return 'expiring-3';
  if (days <= 7) return 'expiring-7';
  if (days <= 30) return 'expiring-30';
  return 'active';
};

export const getWarrantyStatusColor = (status: WarrantyStatus): string => {
  switch (status) {
    case 'active': return 'text-success-600 bg-success-50';
    case 'expiring-30': return 'text-warning-600 bg-warning-50';
    case 'expiring-7': return 'text-danger-500 bg-danger-50';
    case 'expiring-3': return 'text-danger-600 bg-danger-100';
    case 'expired': return 'text-slate-500 bg-slate-100';
  }
};

export const getWarrantyStatusText = (status: WarrantyStatus): string => {
  switch (status) {
    case 'active': return '在保';
    case 'expiring-30': return '30天内到期';
    case 'expiring-7': return '7天内到期';
    case 'expiring-3': return '3天内到期';
    case 'expired': return '已过保';
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getCurrentMonthRange = (): { start: string; end: string } => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
};

export const getMonthsAgo = (months: number): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return format(date, 'yyyy-MM');
};
