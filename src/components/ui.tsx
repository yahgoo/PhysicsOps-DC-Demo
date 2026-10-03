import type { ReactNode } from 'react';
import { CircleHelp, CircleMinus, CirclePlus, CircleSlash } from 'lucide-react';
import type { EvidenceAssessment } from '../engine/types';

export function Panel({ title, children, className = '', actions }: { title?: ReactNode; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={`flex min-h-0 flex-col rounded-lg border border-ink-700 bg-ink-900/80 ${className}`}>
      {title ? (
        <header className="flex items-center justify-between gap-2 border-b border-ink-700/70 px-4 py-2.5">
          <h2 className="text-sm font-semibold tracking-wide text-slate-100">{title}</h2>
          {actions}
        </header>
      ) : null}
      {children}
    </section>
  );
}

const ASSESSMENT_STYLE: Record<EvidenceAssessment, { label: string; className: string; Icon: typeof CirclePlus }> = {
  supports: { label: 'Supports', className: 'border-signal/50 bg-signal/10 text-signal', Icon: CirclePlus },
  weakens: { label: 'Weakens', className: 'border-slate-500/60 bg-slate-500/10 text-slate-300', Icon: CircleMinus },
  inconclusive: { label: 'Inconclusive', className: 'border-warn/50 bg-warn/10 text-warn', Icon: CircleHelp },
  missing: { label: 'Missing measurement', className: 'border-dashed border-slate-500 text-slate-400', Icon: CircleSlash },
};

export function AssessmentBadge({ assessment }: { assessment: EvidenceAssessment }) {
  const { label, className, Icon } = ASSESSMENT_STYLE[assessment];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium ${className}`}>
      <Icon aria-hidden className="size-3" />
      {label}
    </span>
  );
}

export function PrimaryButton({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-signal px-3.5 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-slate-400 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-ink-600 bg-ink-850 px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:border-signal/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
