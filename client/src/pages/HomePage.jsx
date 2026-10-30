import { Link } from 'react-router-dom';
import { ScanLine, Target, ListChecks, FileDown, Sparkles, ArrowRight } from 'lucide-react';
import ScoreGauge from '../components/charts/ScoreGauge.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';

const FEATURES = [
  {
    icon: Target,
    title: 'ATS Score, instantly',
    desc: 'A single 0-100 score that estimates exactly how an ATS bot will read your resume before a recruiter ever does.',
  },
  {
    icon: ListChecks,
    title: 'Missing keyword detection',
    desc: 'See the hard skills, tools, and soft skills your target role expects that your resume is quietly missing.',
  },
  {
    icon: Sparkles,
    title: 'AI-written suggestions',
    desc: 'Section-by-section, priority-ranked rewrites — powered by Gemini — that tell you exactly what to fix first.',
  },
  {
    icon: FileDown,
    title: 'Downloadable report',
    desc: 'Export a clean, shareable PDF report to keep for reference or send to a mentor or career counselor.',
  },
];

const STEPS = [
  { label: 'Upload', desc: 'Drop in your PDF or DOCX resume, and a target job description if you have one.' },
  { label: 'Analyze', desc: 'Gemini scans your resume against real ATS parsing rules and role-specific keywords.' },
  { label: 'Improve', desc: 'Follow ranked, actionable suggestions and re-run the analysis to watch your score climb.' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-violet-500/20 blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-aqua-500/15 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <span className="chip border-violet-400/30 text-violet-300 mb-6">
              <ScanLine className="h-3.5 w-3.5" /> Powered by Google Gemini
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold tracking-tight leading-[1.05]">
              Get your resume <span className="text-gradient">past the bots</span> — and in front of a human.
            </h1>
            <p className="mt-6 text-lg text-ink_text-muted max-w-xl">
              Upload your resume, get an instant ATS score, uncover missing keywords, and receive
              AI-written suggestions built for students, freshers, and job seekers.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" icon={ArrowRight} iconPosition="right">
                  Analyze my resume free
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="secondary" size="lg">
                  How it works
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-ink_text-faint font-mono">No credit card required · 5 free analyses/day</p>
          </div>

          <div className="flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Card className="w-full max-w-sm" padding="p-8">
              <p className="text-sm text-ink_text-muted mb-6 text-center">Sample analysis result</p>
              <div className="flex justify-center">
                <ScoreGauge score={82} size={180} />
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-ink_text-muted">Keyword Match</span>
                  <span className="font-mono text-emerald-400">88%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-ink_text-muted">Formatting</span>
                  <span className="font-mono text-emerald-400">91%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-ink_text-muted">Section Completeness</span>
                  <span className="font-mono text-amber-400">74%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-display font-semibold">Everything you need to fix your resume</h2>
          <p className="mt-3 text-ink_text-muted">
            Not just a score — a full breakdown of why, and exactly what to do about it.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <Card key={title} hover className="text-left">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500/20 to-aqua-500/10 text-violet-300 mb-4">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-display font-semibold text-ink_text-primary mb-2">{title}</h3>
              <p className="text-sm text-ink_text-muted leading-relaxed">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-display font-semibold">Three steps to a stronger resume</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.label} className="relative">
              <span className="font-mono text-5xl font-semibold text-white/[0.06] absolute -top-4 left-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="relative pt-8">
                <h3 className="text-xl font-display font-semibold mb-2">{step.label}</h3>
                <p className="text-sm text-ink_text-muted leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-24">
        <Card className="text-center" padding="p-12">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold mb-3">
            Ready to see your ATS score?
          </h2>
          <p className="text-ink_text-muted mb-8 max-w-lg mx-auto">
            It takes under a minute to upload and analyze your resume. Your first report is free.
          </p>
          <Link to="/register">
            <Button size="lg" icon={ArrowRight} iconPosition="right">
              Get started now
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  );
}
