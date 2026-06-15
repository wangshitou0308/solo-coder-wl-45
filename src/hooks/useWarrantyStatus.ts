import { useMemo } from 'react';
import { getDaysUntil, getWarrantyStatus, getWarrantyStatusColor, getWarrantyStatusText } from '@/utils/date';
import { WarrantyStatus } from '@/types';

interface UseWarrantyStatusReturn {
  status: WarrantyStatus;
  statusText: string;
  statusColor: string;
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  isCritical: boolean;
}

export const useWarrantyStatus = (warrantyEndDate: string): UseWarrantyStatusReturn => {
  return useMemo(() => {
    const status = getWarrantyStatus(warrantyEndDate);
    const daysRemaining = getDaysUntil(warrantyEndDate);

    return {
      status,
      statusText: getWarrantyStatusText(status),
      statusColor: getWarrantyStatusColor(status),
      daysRemaining,
      isExpired: status === 'expired',
      isExpiringSoon: status === 'expiring-30' || status === 'expiring-7' || status === 'expiring-3',
      isCritical: status === 'expiring-3' || status === 'expiring-7',
    };
  }, [warrantyEndDate]);
};

export const useItemsWithWarrantyStatus = (items: Array<{ id: string; warrantyEndDate: string }>) => {
  return useMemo(() => {
    return items.map((item) => ({
      ...item,
      ...useWarrantyStatus(item.warrantyEndDate),
    }));
  }, [items]);
};

export const useSortByWarrantyStatus = <T extends { warrantyEndDate: string }>(
  items: T[]
): T[] => {
  return useMemo(() => {
    const priority: Record<WarrantyStatus, number> = {
      'expiring-3': 0,
      'expiring-7': 1,
      'expiring-30': 2,
      'expired': 3,
      'active': 4,
    };

    return [...items].sort((a, b) => {
      const statusA = getWarrantyStatus(a.warrantyEndDate);
      const statusB = getWarrantyStatus(b.warrantyEndDate);
      const priorityDiff = priority[statusA] - priority[statusB];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.warrantyEndDate).getTime() - new Date(b.warrantyEndDate).getTime();
    });
  }, [items]);
};
