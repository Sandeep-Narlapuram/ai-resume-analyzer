import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogOut, User, ScanLine } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../hooks/useTheme.js';
import { useToast } from '../../hooks/useToast.js';
import { initialsFromName } from '../../utils/formatters.js';

const PUBLIC_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar({ onMenuClick, showSidebarToggle = false }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    toast.success('Signed out successfully');
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            {showSidebarToggle && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg text-ink_text-muted hover:bg-white/[0.06] btn-focus-ring"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-aqua-500 shadow-glow">
                <ScanLine className="h-5 w-5 text-white" />
              </span>
              <span className="font-display font-semibold text-lg tracking-tight text-ink_text-primary">
                ScoreMy<span className="text-gradient">Resume</span>
              </span>
            </Link>
          </div>

          {!isAuthenticated && (
            <nav className="hidden md:flex items-center gap-8">
              {PUBLIC_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive ? 'text-ink_text-primary' : 'text-ink_text-muted hover:text-ink_text-primary'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2 rounded-lg text-ink_text-muted hover:bg-white/[0.06] btn-focus-ring transition-colors"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.06] btn-focus-ring"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-500/80 to-aqua-500/80 text-xs font-semibold text-white">
                    {initialsFromName(user?.name) || <User className="h-4 w-4" />}
                  </span>
                  <span className="text-sm font-medium text-ink_text-primary">{user?.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  aria-label="Sign out"
                  className="p-2 rounded-lg text-ink_text-muted hover:bg-white/[0.06] hover:text-rose-400 btn-focus-ring"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-ink_text-primary rounded-lg hover:bg-white/[0.06] btn-focus-ring"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-violet-500 to-aqua-500 text-white shadow-glow hover:brightness-110 btn-focus-ring"
                >
                  Get started
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-ink_text-muted hover:bg-white/[0.06] btn-focus-ring"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-4 space-y-3 animate-fade-up">
          {!isAuthenticated &&
            PUBLIC_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-ink_text-muted hover:text-ink_text-primary"
              >
                {link.label}
              </Link>
            ))}
          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="block text-sm font-medium">
                Profile
              </Link>
              <button onClick={handleLogout} className="block text-sm font-medium text-rose-400">
                Sign out
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1 text-center px-4 py-2 text-sm rounded-lg glass">
                Log in
              </Link>
              <Link
                to="/register"
                className="flex-1 text-center px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-violet-500 to-aqua-500 text-white"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
