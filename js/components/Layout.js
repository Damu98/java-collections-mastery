/* ==========================================================================
   LAYOUT
   --------------------------------------------------------------------------
   Shell shared by every page: Sidebar + TopBar + a scrollable main region.
   Owns the mobile-sidebar-open flag and the theme state, and closes the
   mobile drawer automatically whenever the route changes.
   ========================================================================== */

function Layout({ route, navigate, children }) {
  const [theme, toggleTheme] = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [route.view, route.id]);

  const handleNavigate = (e) => {
    // Let the browser follow the href (updates window.location.hash); we only
    // need to make sure the mobile drawer closes on tap.
    setMobileOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar route={route} onNavigate={handleNavigate} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar onOpenMobileSidebar={() => setMobileOpen(true)} theme={theme} onToggleTheme={toggleTheme} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
