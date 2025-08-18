import * as React from 'react';

type Props = React.PropsWithChildren<{
  className?: string;
}>;

// tiny helper to join class names without any deps
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

/**
 * GlassCard
 * - Matches the look you used elsewhere: rounded-2xl, subtle border, soft shadow, glassy bg.
 * - No external utils required (no "@/lib/utils" dependency).
 */
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
