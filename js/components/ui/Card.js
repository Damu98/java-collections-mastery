/* ==========================================================================
   CARD / SECTION
   --------------------------------------------------------------------------
   Generic surface used everywhere: dashboard tiles, section wrappers inside
   a collection page, etc. `Section` adds a heading + icon and is the
   standard wrapper CollectionView uses for every content block.
   ========================================================================== */

function Card({ children, className = '', hoverable = false, as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card ${
        hoverable ? 'transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function Section({ title, icon, subtitle, children, className = '', right = null }) {
  return (
    <Card className={`p-5 sm:p-6 animate-fadeIn ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          {icon ? (
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <Icon name={icon} className="h-5 w-5" />
            </span>
          ) : null}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            {subtitle ? <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p> : null}
          </div>
        </div>
        {right}
      </div>
      <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 space-y-3">{children}</div>
    </Card>
  );
}

function EmptyState({ icon = 'sparkles', title, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      {description ? <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm">{description}</p> : null}
    </div>
  );
}
