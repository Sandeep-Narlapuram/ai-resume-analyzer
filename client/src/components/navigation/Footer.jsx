import { Link } from 'react-router-dom';
import { ScanLine, Github, Linkedin, Twitter } from 'lucide-react';

const FOOTER_LINKS = {
  Product: [
    { label: 'Upload Resume', to: '/upload' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'History', to: '/history' },
  ],
  Company: [
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ],
  Account: [
    { label: 'Log in', to: '/login' },
    { label: 'Create account', to: '/register' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-aqua-500">
                <ScanLine className="h-4 w-4 text-white" />
              </span>
              <span className="font-display font-semibold">ScoreMyResume</span>
            </Link>
            <p className="text-sm text-ink_text-muted leading-relaxed">
              AI-powered resume analysis that helps you get past the bots and in front of a human.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="GitHub" className="text-ink_text-faint hover:text-ink_text-primary">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-ink_text-faint hover:text-ink_text-primary">
                <Linkedin className="h-4 w-4" />
              </a>
              
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold text-ink_text-primary mb-3">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-ink_text-muted hover:text-ink_text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink_text-faint">
            © {new Date().getFullYear()} ScoreMyResume. All rights reserved.
          </p>
          <p className="text-xs text-ink_text-faint">Built for students, freshers &amp; job seekers.</p>
        </div>
      </div>
    </footer>
  );
}
