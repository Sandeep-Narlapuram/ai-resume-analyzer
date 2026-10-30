import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  FileSearch,
  History,
  Settings,
  User,
  X,
  ScanLine,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload', label: 'Upload Resume', icon: UploadCloud },
  { to: '/history', label: 'Resume History', icon: History },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen = false, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen w-64 shrink-0
          border-r border-white/10 bg-ink/95 lg:bg-transparent
          transform transition-transform duration-300 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 lg:hidden">
          <span className="flex items-center gap-2 font-display font-semibold">
            <ScanLine className="h-5 w-5 text-violet-400" />
            ScoreMyResume
          </span>
          <button onClick={onClose} aria-label="Close sidebar" className="p-2 text-ink_text-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-500/20 to-aqua-500/10 text-ink_text-primary border border-violet-400/20'
                    : 'text-ink_text-muted hover:text-ink_text-primary hover:bg-white/[0.05]'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="glass-panel p-4 text-center">
            <FileSearch className="h-6 w-6 mx-auto text-aqua-400 mb-2" />
            <p className="text-xs text-ink_text-muted leading-relaxed">
              3 of 5 free analyses used today
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
