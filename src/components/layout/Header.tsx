import { Bell, Search, Plus, Menu, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useItemStore } from '@/store/useItemStore';
import { getWarrantyStatus } from '@/utils/date';
import { cn } from '@/lib/utils';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items } = useItemStore();

  const expiringCount = useMemo(() => {
    return items.filter((item) => {
      const status = getWarrantyStatus(item.warrantyEndDate);
      return status !== 'active' && status !== 'expired';
    }).length;
  }, [items]);

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
            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              {expiringCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                  {expiringCount}
                </span>
              )}
            </button>

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
