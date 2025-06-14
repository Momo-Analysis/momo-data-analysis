export function formatMySQLDateTime(isoString) {
  return new Date(isoString).toISOString().slice(0, 19).replace('T', ' ');
}

export function formatPostgresDateTime(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString();
}