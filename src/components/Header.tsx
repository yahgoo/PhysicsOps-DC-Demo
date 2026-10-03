import { Activity, BookOpen, RotateCcw } from 'lucide-react';
import { SecondaryButton } from './ui';

export function Header({ onHowItWorks, onReset }: { onHowItWorks: () => void; onReset: () => void }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-ink-700 bg-ink-900 px-5 py-2.5">
      <div className="flex items-center gap-3">
        <Activity aria-hidden className="size-6 text-signal" />
        <h1 className="text-lg font-semibold tracking-tight text-white">
          PhysicsOps <span className="text-slate-400">— Cooling Investigation</span>
        </h1>
        <span className="rounded-full border border-warn/40 bg-warn/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-warn">
          Synthetic demo data
        </span>
      </div>
      <div className="flex items-center gap-2">
        <SecondaryButton onClick={onHowItWorks}>
          <BookOpen aria-hidden className="size-4" />
          How it works
        </SecondaryButton>
        <SecondaryButton onClick={onReset}>
          <RotateCcw aria-hidden className="size-4" />
          Reset demo
        </SecondaryButton>
      </div>
    </header>
  );
}
