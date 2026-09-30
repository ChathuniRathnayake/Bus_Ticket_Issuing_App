// Fares are stored per route as `stopFareCents`, a cumulative array parallel to
// `stops` where stopFareCents[i] is the price from the origin (stop 0) to stop i.
// A journey from boarding stop p to drop stop q therefore costs
// stopFareCents[q] - stopFareCents[p], which is what makes intermediate
// boarding/alighting change the price. Routes without stopFareCents fall back
// to a flat `priceCents`.

export function formatLkr(cents) {
  const value = Number(cents);
  if (!Number.isFinite(value) || value <= 0) return null;
  return `Rs ${(value / 100).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fullFareCents(route) {
  const fares = route?.stopFareCents;
  if (Array.isArray(fares) && fares.length >= 2) {
    const first = Number(fares[0]);
    const last = Number(fares[fares.length - 1]);
    if (Number.isFinite(first) && Number.isFinite(last) && last - first > 0) return last - first;
  }
  const flat = Number(route?.priceCents);
  return Number.isFinite(flat) && flat > 0 ? flat : null;
}

export function journeyFareCents(route, stops, boardingStopId, dropStopId) {
  const fallback = fullFareCents(route);
  const fares = route?.stopFareCents;
  if (!Array.isArray(stops) || !Array.isArray(fares) || fares.length !== stops.length) return fallback;

  const from = stops.findIndex((stop) => stop.stopId === boardingStopId);
  const to = stops.findIndex((stop) => stop.stopId === dropStopId);
  if (from < 0 || to < 0 || to <= from) return fallback;

  const start = Number(fares[from]);
  const end = Number(fares[to]);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return fallback;

  const difference = end - start;
  return difference > 0 ? difference : fallback;
}
