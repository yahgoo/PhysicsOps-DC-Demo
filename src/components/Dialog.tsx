import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-ink-950/80 backdrop-blur-sm" />
        <RadixDialog.Content
          className={`fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[92vw] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-ink-600 bg-ink-900 p-5 shadow-2xl ${wide ? 'max-w-3xl' : 'max-w-lg'}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <RadixDialog.Title className="text-lg font-semibold text-white">{title}</RadixDialog.Title>
              <RadixDialog.Description className="mt-0.5 text-sm text-slate-400">{description}</RadixDialog.Description>
            </div>
            <RadixDialog.Close aria-label="Close" className="rounded p-1 text-slate-400 hover:text-white">
              <X aria-hidden className="size-5" />
            </RadixDialog.Close>
          </div>
          <div className="mt-4">{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
