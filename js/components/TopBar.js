/* ==========================================================================
   TOP BAR
   --------------------------------------------------------------------------
   Sticky header: mobile menu toggle, global search input, and the
   light/dark theme switch. Also displays a keyboard shortcut ("/" to focus
   search) as a subtle affordance since there's no build step to add a full
   command palette in Phase 1.
   ========================================================================== */

function TopBar({ onOpenMobileSidebar, theme, onToggleTheme }) {
  const { query, setQuery } = useSearch();
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      const isTypingTarget = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      if (e.key === '/' && !isTypingTarget) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setQuery('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setQuery]);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-4 py-3 sm:px-6">
      <button onClick={onOpenMobileSidebar} className="lg:hidden text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
        <Icon name="menu" className="h-5.5 w-5.5" />
      </button>

      <div className="relative flex-1 max-w-md">
        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search collections… (press /)"
          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-9 pr-8 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60 focus:border-brand-400 transition-shadow"
        />
        {query ? (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <Icon name="close" className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
