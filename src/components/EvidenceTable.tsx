import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { EvidenceItem } from '../engine/types';
import { AssessmentBadge } from './ui';

function Row({ item }: { item: EvidenceItem }) {
  const [open, setOpen] = useState(false);
  const detailId = `evidence-${item.id}`;
  return (
    <li className="rounded-md border border-ink-700 bg-ink-850/60">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={detailId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-2 px-3 py-2 text-left"
      >
        {open ? <ChevronDown aria-hidden className="mt-0.5 size-4 shrink-0 text-slate-400" /> : <ChevronRight aria-hidden className="mt-0.5 size-4 shrink-0 text-slate-400" />}
        <span className="flex-1 text-sm text-slate-100">{item.title}</span>
        {item.value ? <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-200">{item.value}</span> : null}
        <AssessmentBadge assessment={item.assessment} />
      </button>
      {open ? (
        <div id={detailId} className="space-y-1.5 border-t border-ink-700 px-3 py-2 pl-9 text-xs text-slate-300">
          <p>{item.detail}</p>
          <p className="font-mono text-[11px] text-slate-400">{item.calculation}</p>
        </div>
      ) : null}
    </li>
  );
}

export function EvidenceTable({ items }: { items: EvidenceItem[] }) {
  if (items.length === 0) return <p className="text-sm text-slate-400">No evidence could be evaluated.</p>;
  return (
    <ul className="space-y-1.5" aria-label="Evidence">
      {items.map((item) => (
        <Row key={item.id} item={item} />
      ))}
    </ul>
  );
}
