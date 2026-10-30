import { Link, Outlet } from 'react-router-dom';
import { ScanLine } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-24 h-72 w-72 rounded-full bg-violet-500/20 blur-[100px]" />
        <div className="absolute bottom-1/4 -right-24 h-72 w-72 rounded-full bg-aqua-500/20 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-aqua-500 shadow-glow">
            <ScanLine className="h-5 w-5 text-white" />
          </span>
          <span className="font-display font-semibold text-xl">
            ScoreMy<span className="text-gradient">Resume</span>
          </span>
        </Link>

        <div className="glass-panel p-8 animate-fade-up">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
