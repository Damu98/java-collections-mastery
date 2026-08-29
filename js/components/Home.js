/* ==========================================================================
   HOME / DASHBOARD
   --------------------------------------------------------------------------
   Landing page: hero, per-phase progress (derived live from the content
   registry, never hardcoded), category cards, and a full sortable-by-glance
   table of every collection with its status. This page needs no changes as
   later phases add content — `hasContent`/`getPhaseProgress` do the work.
   ========================================================================== */

function ProgressBar({ fraction }) {
  const pct = Math.round(fraction * 100);
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function PhaseCard({ phase }) {
  const items = getCollectionsByPhase(phase.id);
  const fraction = getPhaseProgress(phase.id);
  const doneCount = items.filter((c) => hasContent(c.id)).length;

  return (
    <Card className="p-5" hoverable>
      <div className="flex items-center justify-between mb-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
          {phase.id}
        </span>
        <Badge tone={fraction === 1 ? 'green' : fraction > 0 ? 'blue' : 'slate'}>
          {doneCount}/{items.length} written
        </Badge>
      </div>
      <h3 className="font-semibold text-slate-800 dark:text-slate-100">{phase.name}</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{phase.blurb}</p>
      <div className="mt-3">
        <ProgressBar fraction={fraction} />
      </div>
    </Card>
  );
}

function CategoryCard({ category }) {
  const items = getCollectionsByCategory(category.key);
  return (
    <Card className="p-5" hoverable>
      <div className="flex items-center gap-2.5 mb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
          <Icon name={category.icon} className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">{category.label}</h3>
          <p className="text-xs text-slate-400">{items.length} collections</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{category.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((c) => (
          <a
            key={c.id}
            href={collectionHref(c.id)}
            className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950 dark:hover:text-brand-300 transition-colors"
          >
            <CollectionStatusDot id={c.id} />
            {c.name}
          </a>
        ))}
      </div>
    </Card>
  );
}

function AllCollectionsTable() {
  const [filterCategory, setFilterCategory] = React.useState('all');
  const rows = filterCategory === 'all' ? COLLECTIONS : getCollectionsByCategory(filterCategory);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 px-5 py-3.5">
        <h3 className="mr-auto font-semibold text-slate-800 dark:text-slate-100">All collections</h3>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterCategory('all')}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${filterCategory === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            All
          </button>
          {Object.values(CATEGORIES).map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilterCategory(cat.key)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${filterCategory === cat.key ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <th className="px-5 py-2.5 font-semibold">Name</th>
              <th className="px-5 py-2.5 font-semibold">Category</th>
              <th className="px-5 py-2.5 font-semibold">Phase</th>
              <th className="px-5 py-2.5 font-semibold">Thread-safe</th>
              <th className="px-5 py-2.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-5 py-2.5">
                  <a href={collectionHref(c.id)} className="font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400">
                    {c.name}
                  </a>
                  <p className="text-xs text-slate-400 font-mono-code">{c.javaPackage}</p>
                </td>
                <td className="px-5 py-2.5 text-slate-500 dark:text-slate-400">{CATEGORIES[c.category].label}</td>
                <td className="px-5 py-2.5"><Badge>Phase {c.phase}</Badge></td>
                <td className="px-5 py-2.5">
                  {c.threadSafe ? <Badge tone="green" icon="lock">Yes</Badge> : <Badge tone="slate">No</Badge>}
                </td>
                <td className="px-5 py-2.5">
                  {hasContent(c.id) ? <Badge tone="green" icon="check">Available</Badge> : <Badge tone="slate">Coming soon</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Home() {
  const totalCollections = COLLECTIONS.length;
  const totalWritten = COLLECTIONS.filter((c) => hasContent(c.id)).length;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 px-6 py-10 sm:px-10 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="relative">
          <Badge tone="slate" className="!bg-white/10 !text-white !ring-white/20 mb-3">
            {totalWritten}/{totalCollections} collections written
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight max-w-2xl">
            Master the Java Collections Framework, one implementation at a time.
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-brand-100">
            Deep-dive internal working, complexity, thread safety and ordering for every List, Set, Map and Queue in
            the JDK — with Spring Boot examples, real project scenarios, interview questions and interactive quizzes
            for each one.
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">Learning roadmap</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PHASES.map((phase) => (
            <PhaseCard key={phase.id} phase={phase} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">Browse by category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(CATEGORIES)
            .filter((c) => c.key !== 'core')
            .map((category) => (
              <CategoryCard key={category.key} category={category} />
            ))}
        </div>
      </section>

      <section>
        <AllCollectionsTable />
      </section>
    </div>
  );
}
