/* ==========================================================================
   COMPLEXITY TABLE
   --------------------------------------------------------------------------
   Renders the standard operation -> average/worst/space complexity table
   every collection page includes, with color-coded Big-O badges.
   rows: [{ operation, average, worst, space, notes }]
   ========================================================================== */

function ComplexityTable({ rows }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <th className="px-4 py-2.5 font-semibold">Operation</th>
            <th className="px-4 py-2.5 font-semibold">Average</th>
            <th className="px-4 py-2.5 font-semibold">Worst case</th>
            <th className="px-4 py-2.5 font-semibold">Space</th>
            <th className="px-4 py-2.5 font-semibold">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
              <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{row.operation}</td>
              <td className="px-4 py-2.5"><BigOBadge notation={row.average} /></td>
              <td className="px-4 py-2.5"><BigOBadge notation={row.worst} /></td>
              <td className="px-4 py-2.5">{row.space ? <BigOBadge notation={row.space} /> : <span className="text-slate-400">—</span>}</td>
              <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{row.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
