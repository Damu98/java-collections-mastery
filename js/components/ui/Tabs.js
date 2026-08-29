/* ==========================================================================
   TABS
   --------------------------------------------------------------------------
   Generic controlled/uncontrolled tab strip. CollectionView uses one Tabs
   instance to group a collection's ~15 sections into a handful of digestible
   panes ("Concepts", "Complexity", "Code & Practice", "Interview Prep",
   "Best Practices") so a single page never becomes an unreadable wall.
   ========================================================================== */

function Tabs({ tabs, defaultTabId, onChange, className = '' }) {
  const [activeId, setActiveId] = React.useState(defaultTabId || (tabs[0] && tabs[0].id));
  const activeTab = tabs.find((t) => t.id === activeId) || tabs[0];

  const select = (id) => {
    setActiveId(id);
    if (onChange) onChange(id);
  };

  return (
    <div className={className}>
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800 mb-5">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab?.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => select(tab.id)}
              className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                isActive
                  ? 'text-brand-700 dark:text-brand-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon ? <Icon name={tab.icon} className="h-4 w-4" /> : null}
              {tab.label}
              {tab.count != null ? (
                <span className="ml-1 rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 text-xs">{tab.count}</span>
              ) : null}
              {isActive ? <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-brand-600 dark:bg-brand-400" /> : null}
            </button>
          );
        })}
      </div>
      <div key={activeTab?.id} className="animate-fadeIn">
        {activeTab ? activeTab.content : null}
      </div>
    </div>
  );
}
