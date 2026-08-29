/* ==========================================================================
   DIAGRAM PRIMITIVES
   --------------------------------------------------------------------------
   Pure HTML/CSS building blocks (no canvas/SVG library) used to compose the
   per-collection internal-structure visualizations added from Phase 2
   onward: array slots, linked-list nodes with arrows, hash buckets, tree
   nodes, etc. Every collection's `diagrams` entries are plain functions
   that return JSX built out of these primitives, so the visual language
   stays consistent across all ~25 pages.
   ========================================================================== */

function DiagramFrame({ title, caption, children }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-[radial-gradient(circle,theme(colors.slate.200)_1px,transparent_1px)] dark:bg-[radial-gradient(circle,theme(colors.slate.800)_1px,transparent_1px)] [background-size:16px_16px]">
      {title ? (
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {title}
        </div>
      ) : null}
      <div className="overflow-x-auto p-6">
        <div className="flex min-w-max items-center gap-1">{children}</div>
      </div>
      {caption ? (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
          {caption}
        </div>
      ) : null}
    </div>
  );
}

const DIAGRAM_TONES = {
  slate: 'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
  brand: 'border-brand-400 bg-brand-50 text-brand-800 dark:border-brand-600 dark:bg-brand-950 dark:text-brand-200',
  green: 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-200',
  amber: 'border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-200',
  rose: 'border-rose-400 bg-rose-50 text-rose-800 dark:border-rose-600 dark:bg-rose-950 dark:text-rose-200',
  dashed: 'border-slate-300 border-dashed bg-transparent text-slate-400 dark:border-slate-700',
};

/** A single cell/node: an array slot, a linked-list node's payload, a tree/bucket entry, etc. */
function DiagramBox({ label, sub, tone = 'slate', index }) {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className={`flex h-12 min-w-[3rem] items-center justify-center rounded-md border-2 px-3 font-mono-code text-sm font-semibold shadow-sm ${DIAGRAM_TONES[tone] || DIAGRAM_TONES.slate}`}>
        {label}
      </div>
      {sub != null ? <span className="text-[11px] text-slate-400 font-mono-code">{sub}</span> : null}
      {index != null ? <span className="text-[11px] text-slate-400 font-mono-code">[{index}]</span> : null}
    </div>
  );
}

/** Horizontal arrow connector, e.g. a linked-list `next` pointer. */
function DiagramArrow({ label }) {
  return (
    <div className="flex flex-col items-center shrink-0 px-0.5">
      {label ? <span className="text-[10px] text-slate-400 mb-0.5">{label}</span> : null}
      <svg width="28" height="12" viewBox="0 0 28 12" className="text-slate-400 dark:text-slate-600">
        <line x1="0" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="2" />
        <path d="M20 1 L27 6 L20 11 Z" fill="currentColor" />
      </svg>
    </div>
  );
}

/** Small labeled tag pointing at a box from above/below, e.g. "head", "tail", "top". */
function DiagramPointer({ label, position = 'top' }) {
  return (
    <div className={`flex flex-col items-center shrink-0 ${position === 'top' ? '' : 'self-end'}`}>
      {position === 'top' ? <Icon name="chevronDown" className="h-3.5 w-3.5 text-brand-500" /> : null}
      <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">{label}</span>
      {position === 'bottom' ? <Icon name="chevronDown" className="h-3.5 w-3.5 text-brand-500 rotate-180" /> : null}
    </div>
  );
}

/** A vertical stack of boxes (used for hash-bucket chaining diagrams). */
function DiagramBucketColumn({ bucketIndex, entries, tone = 'slate' }) {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <span className="text-[11px] text-slate-400 font-mono-code">bucket[{bucketIndex}]</span>
      <div className="flex flex-col gap-1">
        {entries.length === 0 ? (
          <div className="flex h-10 w-20 items-center justify-center rounded-md border border-dashed border-slate-300 dark:border-slate-700 text-[11px] text-slate-300 dark:text-slate-600">
            empty
          </div>
        ) : (
          entries.map((entry, i) => (
            <div key={i} className={`flex h-10 w-20 items-center justify-center rounded-md border-2 px-2 font-mono-code text-xs font-semibold ${DIAGRAM_TONES[tone] || DIAGRAM_TONES.slate}`}>
              {entry}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
