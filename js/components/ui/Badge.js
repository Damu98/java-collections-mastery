/* ==========================================================================
   BADGE
   --------------------------------------------------------------------------
   Small pill used for phase numbers, thread-safety flags, Big-O complexity,
   difficulty levels, etc. `tone` picks a color; everything else is layout.
   ========================================================================== */

const BADGE_TONES = {
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ring-slate-200 dark:ring-slate-700',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 ring-brand-200 dark:ring-brand-800',
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800',
  blue: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 ring-sky-200 dark:ring-sky-800',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 ring-amber-200 dark:ring-amber-800',
  orange: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 ring-orange-200 dark:ring-orange-800',
  red: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 ring-rose-200 dark:ring-rose-800',
  purple: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 ring-violet-200 dark:ring-violet-800',
};

function Badge({ children, tone = 'slate', className = '', icon }) {
  const toneClasses = BADGE_TONES[tone] || BADGE_TONES.slate;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${toneClasses} ${className}`}>
      {icon ? <Icon name={icon} className="h-3.5 w-3.5" /> : null}
      {children}
    </span>
  );
}

/** Maps a raw Big-O string like "O(1)" / "O(log n)" / "O(n)" to a sensible tone. */
function bigOTone(notation) {
  const n = (notation || '').replace(/\s+/g, '');
  if (/O\(1\)/.test(n)) return 'green';
  if (/O\(log/.test(n)) return 'blue';
  if (/O\(n\)/.test(n) && !/n\^|n2|nlog|n\*log/i.test(n)) return 'amber';
  if (/log/.test(n)) return 'orange';
  return 'red';
}

function BigOBadge({ notation }) {
  return (
    <Badge tone={bigOTone(notation)} className="font-mono-code font-semibold">
      {notation}
    </Badge>
  );
}
