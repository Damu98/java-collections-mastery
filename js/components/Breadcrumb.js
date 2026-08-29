/* ==========================================================================
   BREADCRUMB
   --------------------------------------------------------------------------
   Small trail shown at the top of every page below the TopBar:
   Dashboard / <Category> / <Collection name>
   ========================================================================== */

function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-4 flex-wrap">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 ? <Icon name="chevronRight" className="h-3.5 w-3.5 shrink-0" /> : null}
            {item.href && !isLast ? (
              <a href={item.href} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                {item.label}
              </a>
            ) : (
              <span className={isLast ? 'font-medium text-slate-600 dark:text-slate-300' : ''}>{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
