import { Link } from 'react-router-dom';
import { Home, ScanLine } from 'lucide-react';
import Button from '../components/common/Button.jsx';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 h-72 w-72 rounded-full bg-violet-500/15 blur-[100px]" />
      </div>

      <div className="relative text-center max-w-md animate-fade-up">
        <span className="grid h-16 w-16 mx-auto place-items-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-aqua-500/10 text-violet-300 mb-6">
          <ScanLine className="h-8 w-8" />
        </span>
        <p className="font-mono text-6xl font-semibold text-white/[0.08] mb-2">404</p>
        <h1 className="text-2xl font-display font-semibold mb-3">This page didn't make the cut</h1>
        <p className="text-sm text-ink_text-muted mb-8 leading-relaxed">
          Like a resume missing a keyword, this page isn't matching anything we have. Let's get you
          back on track.
        </p>
        <Link to="/">
          <Button icon={Home} iconPosition="left">
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
