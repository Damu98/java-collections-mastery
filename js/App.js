/* ==========================================================================
   APP
   --------------------------------------------------------------------------
   Root component: wires the router to the Layout + page components and
   provides the SearchProvider context to the whole tree.
   ========================================================================== */

function AppRoutes({ route, navigate }) {
  switch (route.view) {
    case 'home':
      return <Home />;
    case 'collection':
      return <CollectionView id={route.id} />;
    default:
      return <NotFound />;
  }
}

function App() {
  const [route, navigate] = useHashRoute();

  return (
    <SearchProvider>
      <Layout route={route} navigate={navigate}>
        <AppRoutes route={route} navigate={navigate} />
      </Layout>
    </SearchProvider>
  );
}
