/* ==========================================================================
   ROUTING
   --------------------------------------------------------------------------
   Minimal hash-based router — no build tools means no history-API server
   fallback to rely on, so `#/...` URLs are used throughout. Two routes:

     #/                     -> home dashboard
     #/collection/:id       -> a single collection's detail page

   Anything else falls back to a "not found" view.
   ========================================================================== */

function parseHash(hash) {
  const clean = (hash || '').replace(/^#\/?/, '').trim();
  if (clean === '') return { view: 'home' };

  const parts = clean.split('/').filter(Boolean);
  if (parts[0] === 'collection' && parts[1]) {
    return { view: 'collection', id: decodeURIComponent(parts[1]) };
  }
  return { view: 'not-found' };
}

function useHashRoute() {
  const [route, setRoute] = React.useState(() => parseHash(window.location.hash));

  React.useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = React.useCallback((path) => {
    if (window.location.hash === `#${path}`) {
      // Force a route recompute even if the hash string is unchanged
      // (e.g. re-clicking the active sidebar link).
      setRoute(parseHash(`#${path}`));
      return;
    }
    window.location.hash = path;
  }, []);

  return [route, navigate];
}

/** Helper for building an href to a collection page (used by Sidebar/Home links). */
const collectionHref = (id) => `#/collection/${encodeURIComponent(id)}`;
