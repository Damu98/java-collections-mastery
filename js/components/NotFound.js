/* ==========================================================================
   NOT FOUND
   --------------------------------------------------------------------------
   Shown for unknown hash routes and unknown collection ids.
   ========================================================================== */

function NotFound({ message }) {
  return (
    <Card className="p-10">
      <EmptyState
        icon="xCircle"
        title="Page not found"
        description={message || "The page you're looking for doesn't exist."}
      />
      <div className="flex justify-center">
        <a
          href="#/"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          <Icon name="home" className="h-4 w-4" />
          Back to Dashboard
        </a>
      </div>
    </Card>
  );
}
