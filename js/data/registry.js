/* ==========================================================================
   CONTENT REGISTRY
   --------------------------------------------------------------------------
   `CollectionsContent` is populated by per-collection content files added in
   later phases (e.g. js/content/arraylist.js does
   `CollectionsContent['arraylist'] = { ... }`). It starts empty on purpose:
   CollectionView.js treats a missing entry as "not written yet" and renders
   a "coming soon" outline instead of crashing, so this file never needs to
   change as new phases are added — only new js/content/*.js files do, plus
   one new <script> tag per file in index.html.

   Shape every entry is expected to (partially) satisfy — every field is
   optional, CollectionView only renders sections that are present:

   CollectionsContent[id] = {
     overview:          { paragraphs: string[], keyPoints: string[] },
     internalWorking:   { paragraphs: string[] },
     complexity:        [{ operation, average, worst, space, notes }],
     memory:            { paragraphs: string[], points: string[] },
     threadSafety:      { isThreadSafe: boolean, paragraphs: string[] },
     iteration:         { failFast: boolean, paragraphs: string[] },
     ordering:          { paragraphs: string[] },
     nullHandling:      { paragraphs: string[], allowsNull: boolean },
     useCases:          [{ title, description }],
     springBootExamples:[{ title, description, code }],
     interviewQuestions:[{ question, answer, difficulty }],
     problems: {
       beginner:     [{ title, statement, code, output }],
       intermediate: [{ title, statement, code, output }],
       advanced:     [{ title, statement, code, output }],
     },
     realProjectScenarios: [{ title, domain, description, code }],
     nestedExamples:       [{ title, code, explanation }],
     bestPractices:        string[],
     commonMistakes:       [{ mistake, why, fix }],
     comparisonTable:      { headers: string[], rows: string[][] },
     diagrams:             [{ title, caption, render: () => JSX }],  // built from js/components/ui/Diagram.js primitives
     quiz:                 [{ question, options: string[], answerIndex, explanation }],
   }
   ========================================================================== */

const CollectionsContent = {};

/** True once at least one section of real content has been registered for an id. */
const hasContent = (id) => Object.prototype.hasOwnProperty.call(CollectionsContent, id);

/** Fraction (0..1) of collections in a phase that currently have content — powers the Home progress bars. */
const getPhaseProgress = (phaseId) => {
  const items = getCollectionsByPhase(phaseId);
  if (items.length === 0) return 0;
  const done = items.filter((c) => hasContent(c.id)).length;
  return done / items.length;
};
