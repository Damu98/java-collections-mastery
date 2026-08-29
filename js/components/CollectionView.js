/* ==========================================================================
   COLLECTION VIEW
   --------------------------------------------------------------------------
   The single template every collection (ArrayList, HashMap, PriorityQueue,
   ...) renders through. It reads structural metadata from `COLLECTIONS`
   (js/data/collections.js) and written content from `CollectionsContent`
   (js/data/registry.js) and lays both out identically for every id. Later
   phases never touch this file — they only add js/content/<id>.js files
   that populate the registry with data matching the documented shape.
   ========================================================================== */

const PLANNED_SECTIONS = [
  'Overview', 'Internal working', 'Time complexity table', 'Memory considerations', 'Thread safety',
  'Iteration behavior', 'Ordering', 'Null handling', 'Production use cases', 'Spring Boot examples',
  'Interview questions', 'Beginner / Intermediate / Advanced problems', 'Real project scenarios',
  'Nested collection examples', 'Best practices', 'Common mistakes', 'Comparison tables',
  'Visualization diagrams', 'Interactive quiz',
];

function ComingSoon({ meta }) {
  return (
    <Card className="p-8">
      <EmptyState
        icon="sparkles"
        title={`${meta.name} content is on the roadmap`}
        description={`This page will be filled in during Phase ${meta.phase} of the build. Here's everything it will eventually cover:`}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
        {PLANNED_SECTIONS.map((s) => (
          <div key={s} className="flex items-center gap-2 rounded-md bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
            <Icon name="clock" className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
            {s}
          </div>
        ))}
      </div>
    </Card>
  );
}

function CollectionHeader({ meta }) {
  const category = CATEGORIES[meta.category];
  return (
    <Card className="p-6 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <Icon name={category.icon} className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{meta.name}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">{meta.summary}</p>
            <p className="mt-1.5 font-mono-code text-xs text-slate-400">{meta.javaPackage}.{meta.name.replace(/\s*\(.*\)/, '')}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-end">
          <Badge tone="brand">Phase {meta.phase}</Badge>
          <Badge>{category.label}</Badge>
          <Badge tone={meta.threadSafe ? 'green' : 'slate'} icon={meta.threadSafe ? 'lock' : undefined}>
            {meta.threadSafe ? 'Thread-safe' : 'Not thread-safe'}
          </Badge>
          <Badge tone="purple">Since {meta.since}</Badge>
        </div>
      </div>
      {meta.interfaces?.length ? (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-4">
          <span className="text-xs text-slate-400 mr-1">Implements:</span>
          {meta.interfaces.map((i) => (
            <Badge key={i} tone="slate">{i}</Badge>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

/* ---- Section renderers: each returns null if its data is absent -------- */

function ParagraphsAndPoints({ data }) {
  if (!data) return null;
  return (
    <>
      {(data.paragraphs || []).map((p, i) => <p key={i}>{p}</p>)}
      {data.keyPoints?.length ? (
        <ul className="space-y-1.5 pl-1">
          {data.keyPoints.map((kp, i) => (
            <li key={i} className="flex items-start gap-2">
              <Icon name="check" className="h-4 w-4 mt-0.5 shrink-0 text-brand-500" />
              <span>{kp}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {data.points?.length ? (
        <ul className="space-y-1.5 pl-1">
          {data.points.map((kp, i) => (
            <li key={i} className="flex items-start gap-2">
              <Icon name="check" className="h-4 w-4 mt-0.5 shrink-0 text-brand-500" />
              <span>{kp}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function ConceptsTab({ content }) {
  const sections = [
    { key: 'overview', title: 'Overview', icon: 'compass', data: content.overview },
    { key: 'internalWorking', title: 'Internal Working', icon: 'layers', data: content.internalWorking },
    { key: 'ordering', title: 'Ordering', icon: 'list', data: content.ordering },
    { key: 'nullHandling', title: 'Null Handling', icon: 'xCircle', data: content.nullHandling },
    { key: 'iteration', title: 'Iteration Behavior', icon: 'compass', data: content.iteration },
    { key: 'threadSafety', title: 'Thread Safety', icon: 'lock', data: content.threadSafety },
    { key: 'memory', title: 'Memory Considerations', icon: 'layers', data: content.memory },
  ].filter((s) => s.data);

  if (sections.length === 0) return <EmptyState title="No concept notes yet" />;

  return (
    <div className="space-y-5">
      {sections.map((s) => (
        <Section key={s.key} title={s.title} icon={s.icon}>
          <ParagraphsAndPoints data={s.data} />
          {s.key === 'internalWorking' && content.diagrams?.length
            ? content.diagrams.map((d, i) => (
                <DiagramFrame key={i} title={d.title} caption={d.caption}>
                  {d.render()}
                </DiagramFrame>
              ))
            : null}
        </Section>
      ))}
    </div>
  );
}

function ComplexityTab({ content }) {
  if (!content.complexity && !content.comparisonTable) return <EmptyState title="No complexity data yet" />;
  return (
    <div className="space-y-5">
      {content.complexity ? (
        <Section title="Time Complexity" icon="clock">
          <ComplexityTable rows={content.complexity} />
        </Section>
      ) : null}
      {content.comparisonTable ? (
        <Section title="How It Compares" icon="layers">
          <ComparisonTable headers={content.comparisonTable.headers} rows={content.comparisonTable.rows} />
        </Section>
      ) : null}
    </div>
  );
}

function ProblemSet({ label, problems }) {
  if (!problems || problems.length === 0) return null;
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</h4>
      {problems.map((p, i) => (
        <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.title}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{p.statement}</p>
          <CodeBlock title="Solution.java" code={p.code} output={p.output} collapsible defaultOpen={false} />
        </div>
      ))}
    </div>
  );
}

function CodeAndPracticeTab({ content }) {
  const hasAny = content.useCases || content.springBootExamples || content.realProjectScenarios || content.nestedExamples || content.problems;
  if (!hasAny) return <EmptyState title="No code examples yet" />;

  return (
    <div className="space-y-5">
      {content.useCases?.length ? (
        <Section title="Production Use Cases" icon="sparkles">
          <div className="grid sm:grid-cols-2 gap-3">
            {content.useCases.map((u, i) => (
              <div key={i} className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3.5">
                <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">{u.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{u.description}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {content.springBootExamples?.length ? (
        <Section title="Spring Boot Examples" icon="code">
          <div className="space-y-4">
            {content.springBootExamples.map((ex, i) => (
              <div key={i} className="space-y-2">
                <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">{ex.title}</p>
                {ex.description ? <p className="text-xs text-slate-500 dark:text-slate-400">{ex.description}</p> : null}
                <CodeBlock title={ex.title} code={ex.code} />
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {content.realProjectScenarios?.length ? (
        <Section title="Real Project Scenarios" icon="layers">
          <div className="space-y-4">
            {content.realProjectScenarios.map((sc, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">{sc.title}</p>
                  <Badge tone="brand">{sc.domain}</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{sc.description}</p>
                <CodeBlock title={sc.title} code={sc.code} />
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {content.nestedExamples?.length ? (
        <Section title="Nested Collection Examples" icon="layers">
          <div className="space-y-4">
            {content.nestedExamples.map((ex, i) => (
              <div key={i} className="space-y-2">
                <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">{ex.title}</p>
                {ex.explanation ? <p className="text-xs text-slate-500 dark:text-slate-400">{ex.explanation}</p> : null}
                <CodeBlock title={ex.title} code={ex.code} />
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {content.problems ? (
        <Section title="Practice Problems" icon="code">
          <div className="space-y-6">
            <ProblemSet label="Beginner" problems={content.problems.beginner} />
            <ProblemSet label="Intermediate" problems={content.problems.intermediate} />
            <ProblemSet label="Advanced" problems={content.problems.advanced} />
          </div>
        </Section>
      ) : null}
    </div>
  );
}

function InterviewPrepTab({ content }) {
  if (!content.interviewQuestions && !content.quiz) return <EmptyState title="No interview prep yet" />;
  return (
    <div className="space-y-5">
      {content.interviewQuestions?.length ? (
        <Section title="Interview Questions" icon="sparkles">
          <div className="space-y-2">
            {content.interviewQuestions.map((q, i) => (
              <Collapsible
                key={i}
                summary={
                  <span className="flex items-center gap-2">
                    <span className="text-slate-800 dark:text-slate-100">{q.question}</span>
                    {q.difficulty ? <Badge tone={q.difficulty === 'Advanced' ? 'red' : q.difficulty === 'Intermediate' ? 'amber' : 'green'}>{q.difficulty}</Badge> : null}
                  </span>
                }
              >
                {q.answer}
              </Collapsible>
            ))}
          </div>
        </Section>
      ) : null}
      {content.quiz?.length ? (
        <Section title="Interactive Quiz" icon="trophy">
          <Quiz questions={content.quiz} />
        </Section>
      ) : null}
    </div>
  );
}

function BestPracticesTab({ content }) {
  if (!content.bestPractices && !content.commonMistakes) return <EmptyState title="No best-practice notes yet" />;
  return (
    <div className="space-y-5">
      {content.bestPractices?.length ? (
        <Section title="Best Practices" icon="checkCircle">
          <ul className="space-y-2">
            {content.bestPractices.map((bp, i) => (
              <li key={i} className="flex items-start gap-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 p-3">
                <Icon name="checkCircle" className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{bp}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
      {content.commonMistakes?.length ? (
        <Section title="Common Mistakes" icon="xCircle">
          <div className="space-y-3">
            {content.commonMistakes.map((m, i) => (
              <MistakeCard key={i} mistake={m.mistake} why={m.why} fix={m.fix} />
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}

function CollectionContent({ meta, content }) {
  const tabs = [
    { id: 'concepts', label: 'Concepts', icon: 'compass', content: <ConceptsTab content={content} /> },
    { id: 'complexity', label: 'Complexity', icon: 'clock', content: <ComplexityTab content={content} /> },
    { id: 'practice', label: 'Code & Practice', icon: 'code', content: <CodeAndPracticeTab content={content} /> },
    { id: 'interview', label: 'Interview Prep', icon: 'sparkles', content: <InterviewPrepTab content={content} /> },
    { id: 'best-practices', label: 'Best Practices', icon: 'trophy', content: <BestPracticesTab content={content} /> },
  ];
  return <Tabs tabs={tabs} />;
}

function CollectionView({ id }) {
  const meta = getCollectionById(id);

  if (!meta) {
    return <NotFound message={`No collection with id "${id}" exists.`} />;
  }

  const content = CollectionsContent[id];

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '#/' },
          { label: CATEGORIES[meta.category].label, href: '#/' },
          { label: meta.name },
        ]}
      />
      <CollectionHeader meta={meta} />
      {content ? <CollectionContent meta={meta} content={content} /> : <ComingSoon meta={meta} />}
    </div>
  );
}
