export function Statement({ problemId }: { problemId: number }) {
  return (
    <div className="h-full overflow-hidden">
      <iframe
        src={`/api/problem/${problemId}/statement`}
        className="h-full w-full"
      />
    </div>
  );
}
