/* ==========================================================================
   COMPARISON TABLE
   --------------------------------------------------------------------------
   Generic "X vs Y vs Z" grid used both inside a single collection page
   (e.g. "when to use this vs. its siblings") and later on category index
   pages. Shape: { headers: string[], rows: string[][] }. The first header
   is treated as the row-label column.
   ========================================================================== */

function ComparisonTable({ headers, rows }) {
  if (!headers || !rows || rows.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {headers.map((h, i) => (
              <th key={i} className={`px-4 py-2.5 font-semibold ${i === 0 ? 'sticky left-0 bg-slate-50 dark:bg-slate-900' : ''}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-4 py-2.5 ${
                    ci === 0
                      ? 'font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap sticky left-0 bg-white dark:bg-slate-900'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
