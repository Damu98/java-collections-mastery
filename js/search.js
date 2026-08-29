/* ==========================================================================
   SEARCH
   --------------------------------------------------------------------------
   A tiny context so the search box lives in the TopBar but can filter the
   Sidebar (and, later, be reused by any page that wants to jump straight to
   a collection). Matching is a simple case-insensitive substring match over
   name / summary / package / category — good enough for ~25 collections and
   avoids pulling in a fuzzy-search dependency for a no-build-tools app.
   ========================================================================== */

const SearchContext = React.createContext({ query: '', setQuery: () => {} });

function SearchProvider({ children }) {
  const [query, setQuery] = React.useState('');
  const value = React.useMemo(() => ({ query, setQuery }), [query]);
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

function useSearch() {
  return React.useContext(SearchContext);
}

function matchesQuery(collection, rawQuery) {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    collection.name,
    collection.summary,
    collection.javaPackage,
    CATEGORIES[collection.category] ? CATEGORIES[collection.category].label : '',
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

function useFilteredCollections() {
  const { query } = useSearch();
  return React.useMemo(() => COLLECTIONS.filter((c) => matchesQuery(c, query)), [query]);
}
