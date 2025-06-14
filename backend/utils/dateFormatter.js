export function formatMySQLDateTime(isoString) {
  return new Date(isoString).toISOString().slice(0, 19).replace('T', ' ');
}
