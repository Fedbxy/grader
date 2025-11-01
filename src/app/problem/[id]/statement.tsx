export function Statement({
  problemId,
  withSplitLayout,
}: {
  problemId: number;
  withSplitLayout?: boolean;
}) {
  return (
    <div className="flex min-h-full flex-1 overflow-hidden rounded-lg border">
      <iframe
        src={`/api/problem/${problemId}/statement`}
        className={`${withSplitLayout ? "min-h-full" : "min-h-screen-minus-header-footer"} w-full`}
      />
    </div>
  );
}
