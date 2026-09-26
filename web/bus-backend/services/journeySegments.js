export const ACTIVE_TICKET_STATUSES = new Set([
	"PENDING_PAYMENT",
	"CHECKOUT_CREATED",
	"BOOKED",
	"booked",
	"CONFIRMED",
	"Confirmed",
]);

export function getOrderedStops(route) {
	if (Array.isArray(route.stops) && route.stops.length >= 2) {
		return route.stops.map((raw, index) => {
			if (typeof raw !== "string") return { ...raw, sequence: Number.isInteger(raw.sequence) ? raw.sequence : index };
			return {
				stopId: `legacy-${index}-${raw.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
				name: raw,
				sequence: index,
				stopType: "normal_road_waypoint",
				boardingAllowed: index === 0,
				alightingAllowed: index === route.stops.length - 1,
			};
		});
	}
	return [
		{ stopId: `legacy-${route.routeId || route.startStop}-origin`, name: route.startStop, sequence: 0, stopType: "terminal", boardingAllowed: true, alightingAllowed: false },
		{ stopId: `legacy-${route.routeId || route.endStop}-destination`, name: route.endStop, sequence: 1, stopType: "terminal", boardingAllowed: false, alightingAllowed: true },
	];
}

export function validateJourneySegment(route, boardingStopId, dropStopId) {
	if (!boardingStopId || !dropStopId) throw new Error("Boarding and destination stops are required");
	const stops = getOrderedStops(route).sort((a, b) => a.sequence - b.sequence);
	const boardingIndex = stops.findIndex((stop) => stop.stopId === boardingStopId);
	const dropIndex = stops.findIndex((stop) => stop.stopId === dropStopId);
	if (boardingIndex < 0 || dropIndex < 0) throw new Error("Selected stop is not on this route");
	if (boardingIndex >= dropIndex) throw new Error("Destination must follow boarding point");
	if (stops[boardingIndex].boardingAllowed !== true) throw new Error("Boarding is not allowed at this stop");
	if (stops[dropIndex].alightingAllowed !== true) throw new Error("Alighting is not allowed at this stop");
	return {
		stops,
		boardingIndex,
		dropIndex,
		boardingStop: stops[boardingIndex],
		dropStop: stops[dropIndex],
		segmentStopIds: stops.slice(boardingIndex, dropIndex).map((stop) => stop.stopId),
	};
}

export function journeySegmentsOverlap(first, second) {
	if (![first.boardingStopIndex, first.dropStopIndex, second.boardingStopIndex, second.dropStopIndex].every(Number.isInteger)) {
		return true;
	}
	return first.boardingStopIndex < second.dropStopIndex
		&& second.boardingStopIndex < first.dropStopIndex;
}
