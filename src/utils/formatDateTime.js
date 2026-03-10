/**
 * Formats an ISO 8601 date string as "YYYY-MM-DD HH:MM".
 * If the time component is 00:00(:00), only "YYYY-MM-DD" is returned.
 * Returns null for falsy input.
 */
export function formatDateTime(isoString) {
  if (!isoString) return null;

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");

  if (hh === "00" && min === "00") {
    return `${yyyy}-${mm}-${dd}`;
  }

  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}
