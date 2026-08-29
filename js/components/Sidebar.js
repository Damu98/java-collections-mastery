/* ==========================================================================
   SIDEBAR
   --------------------------------------------------------------------------
   Persistent left navigation grouped by category (List / Set / Map / Queue),
   each collection tagged with a phase badge and a filled/outline dot to show
   whether its content has been written yet. Respects the shared search
   query and collapses into an off-canvas drawer on small screens.
   ========================================================================== */

function CollectionStatusDot({ id }) {
  const done = hasContent(id);
  return (
    <span
      className={`h-1.5 w-1.5 shrink-0 rounded-full ${done ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
      title={done ? 'Content available' : 'Coming soon'}
    />
  );
}

function SidebarLink({ collection, route, onNavigate }) {
  const isActive = route.view === 'collection' && route.id === collection.id;
  return (
    <a
      href={collectionHref(collection.id)}
      onClick={onNavigate}
      className={`group flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
        isActive
          ? 'bg-brand-50 text-brand-700 font-medium dark:bg-brand-950 dark:text-brand-300'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
      }`}
    >
      <CollectionStatusDot id={collection.id} />
      <span className="flex-1 truncate">{collection.name}</span>
      <span className="text-[10px] text-slate-300 dark:text-slate-600 group-hover:text-slate-400">P{collection.phase}</span>
    </a>
  );
}

function SidebarCategoryGroup({ category, collections, route, onNavigate, forceOpen }) {
  const [open, setOpen] = React.useState(true);
  const isOpen = forceOpen || open;

  if (collections.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      >
        <Icon name={category.icon} className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">{category.label}</span>
        <span className="text-[10px] font-normal normal-case text-slate-300 dark:text-slate-600">{collections.length}</span>
        <Icon name="chevronDown" className={`h-3.5 w-3.5 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
      </button>
      {isOpen ? (
        <div className="mt-0.5 space-y-0.5 pl-1">
          {collections.map((c) => (
            <SidebarLink key={c.id} collection={c} route={route} onNavigate={onNavigate} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Sidebar({ route, onNavigate, mobileOpen, onCloseMobile }) {
  const { query } = useSearch();
  const filtered = useFilteredCollections();
  const isSearching = query.trim().length > 0;

  const groups = Object.values(CATEGORIES).map((category) => ({
    category,
    collections: filtered.filter((c) => c.category === category.key),
  }));

  const totalMatches = filtered.length;

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
          <Icon name="layers" className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">Collections Mastery</p>
          <p className="truncate text-[11px] text-slate-400">Java Collections Framework</p>
        </div>
        <button onClick={onCloseMobile} className="ml-auto lg:hidden text-slate-400 hover:text-slate-600">
          <Icon name="close" className="h-5 w-5" />
        </button>
      </div>

      <a
        href="#/"
        onClick={onNavigate}
        className={`mx-3 mt-3 flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
          route.view === 'home'
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70'
        }`}
      >
        <Icon name="home" className="h-4 w-4" />
        Dashboard
      </a>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {isSearching ? (
          <p className="px-2 pb-1 text-xs text-slate-400">
            {totalMatches} result{totalMatches === 1 ? '' : 's'} for <span className="font-medium text-slate-500 dark:text-slate-300">"{query}"</span>
          </p>
        ) : null}
        {groups.map(({ category, collections }) => (
          <SidebarCategoryGroup
            key={category.key}
            category={category}
            collections={collections}
            route={route}
            onNavigate={onNavigate}
            forceOpen={isSearching}
          />
        ))}
        {isSearching && totalMatches === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-slate-400">No collections match your search.</p>
        ) : null}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> content available
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700 ml-2" /> coming soon
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: static sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        {content}
      </aside>

      {/* Mobile: off-canvas drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 animate-fadeIn" onClick={onCloseMobile} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-xl animate-popIn">{content}</aside>
        </div>
      ) : null}
    </>
  );
}
