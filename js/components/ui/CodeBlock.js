/* ==========================================================================
   CODE BLOCK — the app's "interactive code viewer"
   --------------------------------------------------------------------------
   Renders a Java snippet with highlight.js syntax coloring, a copy button,
   an optional filename/title bar, an optional collapsed-by-default mode
   (used for problem solutions so the reader can attempt it first), and an
   optional "Expected output" panel that can itself be toggled.
   ========================================================================== */

function CopyButton({ text }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for environments without Clipboard API permission.
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) { /* no-op */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
    >
      <Icon name={copied ? 'check' : 'copy'} className="h-3.5 w-3.5" />
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function HighlightedCode({ code, language = 'java' }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current && window.hljs) {
      ref.current.removeAttribute('data-highlighted');
      window.hljs.highlightElement(ref.current);
    }
  }, [code, language]);

  return (
    <pre className="hljs-pre overflow-x-auto p-4 text-[13px] leading-relaxed">
      <code ref={ref} className={`language-${language}`}>
        {code}
      </code>
    </pre>
  );
}

/**
 * @param {{
 *   title?: string,
 *   code: string,
 *   language?: string,
 *   output?: string,
 *   collapsible?: boolean,
 *   defaultOpen?: boolean,
 * }} props
 */
function CodeBlock({ title, code, language = 'java', output, collapsible = false, defaultOpen = true }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [showOutput, setShowOutput] = React.useState(false);
  const bodyId = React.useId ? React.useId() : undefined;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950/60">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900 px-3 py-1.5">
        <button
          type="button"
          onClick={() => collapsible && setOpen((o) => !o)}
          className={`flex items-center gap-2 min-w-0 text-left ${collapsible ? 'cursor-pointer' : 'cursor-default'}`}
          aria-expanded={open}
        >
          {collapsible ? <Icon name={open ? 'chevronDown' : 'chevronRight'} className="h-4 w-4 shrink-0 text-slate-400" /> : null}
          <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-rose-400/70" />
          <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400/70 -ml-1.5" />
          <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400/70 -ml-1.5" />
          <span className="ml-1.5 truncate text-xs font-medium text-slate-500 dark:text-slate-400 font-mono-code">
            {title || `Solution.java`}
          </span>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          {collapsible && !open ? (
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Click to reveal solution</span>
          ) : null}
          <CopyButton text={code} />
        </div>
      </div>

      {open ? (
        <div id={bodyId}>
          <HighlightedCode code={code} language={language} />
          {output ? (
            <div className="border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowOutput((s) => !s)}
                className="flex w-full items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <Icon name={showOutput ? 'chevronDown' : 'chevronRight'} className="h-3.5 w-3.5" />
                Expected output
              </button>
              {showOutput ? (
                <pre className="px-4 pb-3 text-[13px] font-mono-code text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap">{output}</pre>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
