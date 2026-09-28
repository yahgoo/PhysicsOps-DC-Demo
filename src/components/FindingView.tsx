import type { EngineeringFinding } from '../engine/types';

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</h4>
      <div className="mt-0.5 text-sm text-slate-200">{children}</div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-0.5 pl-4">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

export function FindingView({ finding }: { finding: EngineeringFinding }) {
  return (
    <article className="space-y-2.5" aria-label="Engineering finding">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-white">{finding.headline}</h3>
        <span className="rounded border border-warn/40 bg-warn/10 px-2 py-0.5 text-xs font-medium text-warn">Evidence strength: {finding.strengthLabel}</span>
      </div>
      <Section label="Observed">{finding.observed}</Section>
      <Section label="Leading hypothesis">{finding.leadingHypothesis}</Section>
      {finding.supportingEvidence.length > 0 ? (
        <Section label="Supporting evidence">
          <List items={finding.supportingEvidence} />
        </Section>
      ) : null}
      {finding.alternatives.length > 0 ? (
        <Section label="Alternatives">
          <List items={finding.alternatives} />
        </Section>
      ) : null}
      <Section label="Limitations">
        <List items={finding.limitations} />
      </Section>
      <Section label="Next checks">
        <p className="text-slate-300">See the verification checklist below. Additional measurement: {finding.additionalMeasurement}</p>
      </Section>
    </article>
  );
}
