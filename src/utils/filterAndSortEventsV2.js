export function filterAndSortEventsV2(events, {typeFilter, statusFilter, regionFilter, fromDate, toDate}) {
  return [...events]
    .filter(e => !typeFilter?.length || typeFilter.includes(e.type))
    .filter(e => !statusFilter?.length || statusFilter.includes(e.timeStateRelativeToNow))
    .filter(e => !regionFilter?.length || e.regions?.some(r => regionFilter.includes(r)))
    .filter(e => !fromDate || !e.endDateTime || fromDate.isBefore(e.endDateTime, "day"))
    .filter(e => !toDate || toDate.isAfter(e.startDateTime, "day"))
    .sort((a, b) => {
      const startDiff = new Date(b.startDateTime) - new Date(a.startDateTime);

      if (startDiff !== 0) return startDiff;
      const aEnd = a.endDateTime ? new Date(a.endDateTime) : -Infinity;
      const bEnd = b.endDateTime ? new Date(b.endDateTime) : -Infinity;

      return bEnd - aEnd;
    });
}
