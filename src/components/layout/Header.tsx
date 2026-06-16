import { Bell, Search, Plus, Menu, X, ChevronRight, Clock } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useItemStore } from '@/store/useItemStore';
import { getWarrantyStatus, getDaysUntil, getWarrantyStatusText } from '@/utils/date';
import { cn } from '@/lib/utils';
import { WarrantyStatus } from '@/types';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { items } = useItemStore();
  const notificationRef = useRef<HTMLDivElement>(null);

  const expiringItems = useMemo(() => {
    return items
      .map((item) => ({
        item,
        status: getWarrantyStatus(item.warrantyEndDate),
        daysRemaining: getDaysUntil(item.warrantyEndDate),
      }))
      .filter(({ status }) => status !== 'active' && status !== 'expired')
      .sort((a, b) => {
        const statusPriority: Record<WarrantyStatus, number> = {
          'expiring-3': 0,
          'expiring-7': 1,
          'expiring-30': 2,
          'active': 3,
          'expired': 4,
        };
        if (statusPriority[a.status] !== statusPriority[b.status]) {
          return statusPriority[a.status] - statusPriority[b.status];
        }
        return a.daysRemaining - b.daysRemaining;
      });
  }, [items]);

  const expiringCount = expiringItems.length;

  const getStatusColor = (status: WarrantyStatus) => {
    switch (status) {
      case 'expiring-3': return 'text-danger-600 bg-danger-50';
      case 'expiring-7': return 'text-danger-600 bg-danger-50';
      case 'expiring-30': return 'text-warning-700 bg-warning-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索票据、物品..."
                className="pl-10 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  'relative p-2 rounded-lg transition-colors',
                  showNotifications ? 'bg-primary-50 text-primary-600' : 'hover:bg-slate-100 text-slate-600'
                )}
              >
                <Bell className="w-5 h-5" />
                {expiringCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                    {expiringCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-scale-in">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">保修提醒</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      共 {expiringCount} 个物品即将到期
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {expiringItems.length === 0 ? (
                      <div className="px-5 py-8 text-center">
                        <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="text-slate-500 text-sm">暂无即将到期的保修</p>
                      </div>
                    ) : (
                      <div>
                        {expiringItems.map(({ item, status, daysRemaining }) => (
                          <Link
                            key={item.id}
                            to={`/items/${item.id}`}
                            onClick={() => setShowNotifications(false)}
                            className="block px-5 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-slate-500 truncate mt-0.5">
                                  {item.brand} {item.model}
                                </p>
                              </div>
                              <span className={cn(
                                'px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 whitespace-nowrap',
                                getStatusColor(status)
                              )}>
                                {daysRemaining > 0 ? `${daysRemaining}天后到期` : '即将到期'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {getWarrantyStatusText(status)}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                    <Link
                      to="/"
                      onClick={() => setShowNotifications(false)}
                      className="flex items-center justify-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      查看全部保修提醒
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/receipts/new"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">录入票据</span>
            </Link>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300',
          mobileMenuOpen ? 'max-h-96' : 'max-h-0'
        )}
      >
        <nav className="px-4 pb-4 border-t border-slate-200">
          <MobileNav />
        </nav>
      </div>
    </header>
  );
}

function MobileNav() {
  const navItems = [
    { path: '/', label: '首页' },
    { path: '/receipts', label: '票据管理' },
    { path: '/items', label: '物品管理' },
    { path: '/manuals', label: '说明书库' },
    { path: '/dashboard', label: '数据看板' },
    { path: '/export', label: '导出中心' },
  ];

  return (
    <ul className="pt-4 space-y-1">
      {navItems.map((item) => (
        <li key={item.path}>
          <Link
            to={item.path}
            className="block px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
