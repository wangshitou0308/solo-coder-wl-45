import { NavLink } from 'react-router-dom';
import {
  Home,
  FileText,
  Package,
  BookOpen,
  BarChart3,
  Download,
  Camera,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/receipts', label: '票据管理', icon: FileText },
  { path: '/items', label: '物品管理', icon: Package },
  { path: '/manuals', label: '说明书库', icon: BookOpen },
  { path: '/dashboard', label: '数据看板', icon: BarChart3 },
  { path: '/export', label: '导出中心', icon: Download },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white min-h-screen">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-wide">票据管家</h1>
            <p className="text-xs text-slate-400">家庭资产管理助手</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-1">本地安全存储</p>
          <p className="text-sm text-slate-300">数据仅保存在您的浏览器中</p>
        </div>
      </div>
    </aside>
  );
}
