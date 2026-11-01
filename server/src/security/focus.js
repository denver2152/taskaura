export function isPlausibleFocusSession({ durationMinutes, startedAt, completedAt }, now = Date.now()) {
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const expected = durationMinutes * 60_000;
  const elapsed = end - start;
  return Number.isFinite(start)
    && Number.isFinite(end)
    && end > start
    && end <= now + 60_000
    && start <= now + 60_000
    && elapsed >= expected - 60_000
    && elapsed <= expected + 24 * 60 * 60_000;
}
