import * as React from 'react';

type Props = React.PropsWithChildren<{ className?: string }>;

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function GlassCard({ className, children }: Props) {
  return (
    <div
      className={cx(
        'rounded-2xl border border-neutral-200/40 dark:border-neutral-800/60',
        'bg-white/60 dark:bg-neutral-900/40 backdrop-blur supports-[backdrop-filter]:backdrop-blur',
        'shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
}
export default GlassCard;
