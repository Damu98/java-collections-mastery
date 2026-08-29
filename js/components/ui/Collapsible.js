/* ==========================================================================
   COLLAPSIBLE
   --------------------------------------------------------------------------
   Generic expand/collapse row, used for interview Q&A ("show answer"),
   common-mistake cards ("mistake -> why -> fix"), and any other
   click-to-reveal content block that isn't a full code sample.
   ========================================================================== */

function Collapsible({ summary, children, defaultOpen = false, tone = 'slate' }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <span className="flex-1">{summary}</span>
        <Icon name="chevronDown" className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-300 animate-fadeIn">{children}</div> : null}
    </div>
  );
}

/** { mistake, why, fix } card used by the "Common mistakes" section. */
function MistakeCard({ mistake, why, fix }) {
  return (
    <div className="rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 p-4 space-y-2">
      <p className="flex items-start gap-2 text-sm font-semibold text-rose-700 dark:text-rose-400">
        <Icon name="xCircle" className="h-4 w-4 shrink-0 mt-0.5" />
        {mistake}
      </p>
      {why ? <p className="text-sm text-slate-600 dark:text-slate-300 pl-6"><span className="font-medium">Why it happens: </span>{why}</p> : null}
      {fix ? (
        <p className="flex items-start gap-2 text-sm pl-6 text-emerald-700 dark:text-emerald-400">
          <Icon name="checkCircle" className="h-4 w-4 shrink-0 mt-0.5" />
          <span><span className="font-medium">Fix: </span>{fix}</span>
        </p>
      ) : null}
    </div>
  );
}
