import { Target, Users, ShieldCheck, Cpu } from 'lucide-react';
import Card from '../components/common/Card.jsx';

const VALUES = [
  {
    icon: Target,
    title: 'Built for the real ATS',
    desc: 'Our scoring model is grounded in how real Applicant Tracking Systems parse and rank resumes — not guesswork.',
  },
  {
    icon: Users,
    title: 'For the overlooked, not the elite',
    desc: 'Students and freshers rarely get resume feedback from a recruiter. We built this so anyone can get that feedback, instantly.',
  },
  {
    icon: Cpu,
    title: 'Powered by Gemini',
    desc: "We use Google's Gemini models to read your resume the way a thoughtful reviewer would — structured, specific, and honest.",
  },
  {
    icon: ShieldCheck,
    title: 'Your resume stays yours',
    desc: 'You can delete any resume or analysis permanently, at any time. We never share your data.',
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-up">
        <span className="chip border-violet-400/30 text-violet-300 mb-6 mx-auto w-fit">About</span>
        <h1 className="text-4xl font-display font-semibold tracking-tight mb-4">
          A second opinion on your resume, before it ever reaches a recruiter.
        </h1>
        <p className="text-ink_text-muted leading-relaxed">
          ScoreMyResume was built on a simple observation: most resumes are rejected by software,
          not people. We wanted to give job seekers the same lens an ATS uses — so they can fix
          what's actually broken, instead of guessing.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-20">
        {VALUES.map(({ icon: Icon, title, desc }) => (
          <Card key={title} hover>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500/20 to-aqua-500/10 text-violet-300 mb-4">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="font-display font-semibold mb-2">{title}</h3>
            <p className="text-sm text-ink_text-muted leading-relaxed">{desc}</p>
          </Card>
        ))}
      </div>

      <Card padding="p-10" className="text-center">
        <h2 className="text-2xl font-display font-semibold mb-3">Who it's for</h2>
        <p className="text-ink_text-muted max-w-2xl mx-auto leading-relaxed">
          Final-year students preparing for campus placements, freshers applying to their first
          role, career-changers rebuilding their story, and working professionals tailoring a
          resume to a new job description. If you've ever wondered why your resume isn't getting
          replies, this is for you.
        </p>
      </Card>
    </div>
  );
}
