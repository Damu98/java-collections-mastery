/* ==========================================================================
   QUIZ
   --------------------------------------------------------------------------
   Self-contained interactive quiz: pick an answer, get instant feedback +
   explanation, see a running score, retake at the end. Fully driven by data
   so every collection page can supply its own question set:
     questions: [{ question, options: string[], answerIndex, explanation }]
   ========================================================================== */

function QuizQuestion({ index, data, selected, onSelect }) {
  const answered = selected != null;
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
      <p className="font-medium text-slate-800 dark:text-slate-200 mb-3">
        <span className="text-brand-600 dark:text-brand-400 mr-1.5">Q{index + 1}.</span>
        {data.question}
      </p>
      <div className="space-y-2">
        {data.options.map((option, i) => {
          const isCorrect = i === data.answerIndex;
          const isPicked = i === selected;
          let stateClasses = 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-slate-50 dark:hover:bg-slate-800/50';
          if (answered && isCorrect) stateClasses = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 dark:border-emerald-700';
          else if (answered && isPicked && !isCorrect) stateClasses = 'border-rose-400 bg-rose-50 dark:bg-rose-950/50 dark:border-rose-700';
          else if (answered) stateClasses = 'border-slate-200 dark:border-slate-800 opacity-60';

          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => onSelect(i)}
              className={`flex w-full items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${stateClasses}`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-semibold">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 text-slate-700 dark:text-slate-300">{option}</span>
              {answered && isCorrect ? <Icon name="checkCircle" className="h-4 w-4 text-emerald-500 shrink-0" /> : null}
              {answered && isPicked && !isCorrect ? <Icon name="xCircle" className="h-4 w-4 text-rose-500 shrink-0" /> : null}
            </button>
          );
        })}
      </div>
      {answered && data.explanation ? (
        <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-md p-2.5">
          <span className="font-semibold text-slate-600 dark:text-slate-300">Explanation: </span>
          {data.explanation}
        </p>
      ) : null}
    </div>
  );
}

function Quiz({ questions }) {
  const [answers, setAnswers] = React.useState({});
  const [attempt, setAttempt] = React.useState(0);

  if (!questions || questions.length === 0) return null;

  const answeredCount = Object.keys(answers).length;
  const score = Object.entries(answers).reduce((acc, [qIndex, choice]) => {
    return acc + (questions[qIndex].answerIndex === choice ? 1 : 0);
  }, 0);
  const allAnswered = answeredCount === questions.length;

  const select = (qIndex, optionIndex) => {
    if (answers[qIndex] != null) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const retake = () => {
    setAnswers({});
    setAttempt((a) => a + 1);
  };

  return (
    <div key={attempt} className="space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-brand-50 dark:bg-brand-950/50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-brand-700 dark:text-brand-300">
          <Icon name="trophy" className="h-4 w-4" />
          Score: {score} / {questions.length}
          <span className="text-brand-400 dark:text-brand-600 font-normal">
            ({answeredCount}/{questions.length} answered)
          </span>
        </div>
        {allAnswered ? (
          <button
            onClick={retake}
            className="text-xs font-semibold text-brand-700 dark:text-brand-300 hover:underline"
          >
            Retake quiz
          </button>
        ) : null}
      </div>
      {questions.map((q, i) => (
        <QuizQuestion key={i} index={i} data={q} selected={answers[i]} onSelect={(opt) => select(i, opt)} />
      ))}
    </div>
  );
}
