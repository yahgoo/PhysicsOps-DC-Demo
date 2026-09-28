import { useState } from 'react';
import { CalendarCheck, ClipboardCheck } from 'lucide-react';
import type { EngineeringFinding } from '../engine/types';
import type { InspectionStatus } from '../app/demoState';
import { Dialog } from './Dialog';
import { Panel, PrimaryButton, SecondaryButton } from './ui';

export const INSPECTION_CREATED_MESSAGE = 'Demo inspection request created. No request was sent to a maintenance system.';

export function InspectionRequest({
  status,
  finding,
  enabled,
  onCreate,
}: {
  status: InspectionStatus;
  finding: EngineeringFinding;
  enabled: boolean;
  onCreate: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Panel title="Next action" className="h-full">
      <div className="flex flex-1 flex-col justify-center gap-2 px-4 py-2">
        {status === 'created' ? (
          <p role="status" className="flex items-start gap-2 text-sm text-ok">
            <ClipboardCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
            {INSPECTION_CREATED_MESSAGE}
          </p>
        ) : (
          <>
            <p className="text-xs text-slate-400">Inspection request status: not requested</p>
            <PrimaryButton onClick={() => setOpen(true)} disabled={!enabled} className="self-start whitespace-nowrap">
              <CalendarCheck aria-hidden className="size-4" />
              Schedule inspection — demo
            </PrimaryButton>
            {!enabled ? <p className="text-xs text-slate-500">Available after an abnormal finding.</p> : null}
          </>
        )}
      </div>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Schedule inspection — demo"
        description="This creates a simulated request inside the demo only. Nothing is sent to a maintenance system."
      >
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Asset</dt>
            <dd className="text-slate-100">CH-02</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reason</dt>
            <dd className="text-slate-100">
              {finding.headline}. Leading hypothesis: {finding.leadingHypothesis} (evidence strength: {finding.strengthLabel}).
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Requested checks</dt>
            <dd>
              <ul className="list-disc space-y-0.5 pl-4 text-slate-200">
                {finding.nextChecks.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex justify-end gap-2">
          <SecondaryButton onClick={() => setOpen(false)}>Cancel</SecondaryButton>
          <PrimaryButton
            onClick={() => {
              onCreate();
              setOpen(false);
            }}
          >
            Create demo inspection request
          </PrimaryButton>
        </div>
      </Dialog>
    </Panel>
  );
}
