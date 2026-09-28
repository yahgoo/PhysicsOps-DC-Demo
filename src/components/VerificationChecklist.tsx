import { Panel } from './ui';

export function VerificationChecklist({ items, checked, onToggle, available }: { items: string[]; checked: string[]; onToggle: (item: string) => void; available: boolean }) {
  return (
    <Panel title="Verification checklist" className="h-full" actions={available ? <span className="text-xs text-slate-400">{checked.filter((c) => items.includes(c)).length}/{items.length} reviewed</span> : null}>
      {available ? (
        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-2">
          {items.map((item, i) => {
            const id = `check-${i}`;
            return (
              <li key={item} className="flex items-start gap-2 text-xs text-slate-200">
                <input id={id} type="checkbox" checked={checked.includes(item)} onChange={() => onToggle(item)} className="mt-0.5 accent-cyan-400" />
                <label htmlFor={id}>{item}</label>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-4 py-3 text-xs text-slate-400">Available once the investigation has produced a finding.</p>
      )}
    </Panel>
  );
}
