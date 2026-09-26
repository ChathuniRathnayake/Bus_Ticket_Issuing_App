import { admin, db } from "../config/firebase.js";

const SEED_TAG = "sample-routes-schedules-2026-09";
const ACTIVE_STATUSES = new Set(["Active", "ACTIVE"]);
const BUS_TURNAROUND_MINUTES = 45;

function getDurationMinutes(route) {
	const estimated = Number(route.estimatedDurationMinutes);
	if (Number.isFinite(estimated) && estimated > 0) return estimated;
	const [hours, minutes] = String(route.duration || "8:00").split(":").map(Number);
	return (hours * 60) + minutes;
}

function getWindow(schedule, route) {
	const start = new Date(`${schedule.date}T${schedule.departureTime}:00`).getTime();
	return { start, end: start + (getDurationMinutes(route) + BUS_TURNAROUND_MINUTES) * 60_000 };
}

function overlaps(first, second) {
	return first.start < second.end && second.start < first.end;
}

async function main() {
	const [routeSnapshot, scheduleSnapshot, busSnapshot] = await Promise.all([
		db.collection("routes").get(),
		db.collection("schedules").get(),
		db.collection("buses").get(),
	]);
	const routeById = new Map(routeSnapshot.docs.map((doc) => [doc.id, doc.data()]));
	const busById = new Map(busSnapshot.docs.map((doc) => [doc.id, doc.data()]));
	const seededRoutes = routeSnapshot.docs.filter((doc) => doc.data().seedTag === SEED_TAG);
	const seededSchedules = scheduleSnapshot.docs.filter((doc) => doc.data().seedTag === SEED_TAG);
	const badReferences = [];
	const invalidSchedules = [];
	const invalidRoutes = [];
	const conflicts = [];

	for (const doc of seededRoutes) {
		const route = doc.data();
		const stops = route.stops || [];
		const ids = new Set(stops.map((stop) => stop.stopId));
		if (stops.length < 2 || ids.size !== stops.length || stops.some((stop, index) =>
			!stop.stopId || !stop.name || stop.sequence !== index)) {
			invalidRoutes.push(`${doc.id}:invalid-stop-order-or-ID`);
		}
		if (stops.some((stop, index) => {
			const mustBoard = index === 0;
			const mustAlight = index === stops.length - 1;
			return stop.boardingAllowed !== mustBoard || stop.alightingAllowed !== mustAlight
				|| (["expressway_interchange", "expressway_segment"].includes(stop.stopType)
					&& (stop.boardingAllowed || stop.alightingAllowed));
		})) invalidRoutes.push(`${doc.id}:invalid-stop-permissions`);
	}

	for (const doc of seededSchedules) {
		const schedule = doc.data();
		if (!routeById.has(schedule.routeId) || !busById.has(schedule.busId)) badReferences.push(doc.id);
		if (schedule.status !== "Active"
			|| !ACTIVE_STATUSES.has(busById.get(schedule.busId)?.status)
			|| schedule.date < "2026-09-28"
			|| schedule.date > "2026-10-11") invalidSchedules.push(doc.id);
	}

	const byBus = new Map();
	for (const doc of scheduleSnapshot.docs) {
		const schedule = doc.data();
		if (!ACTIVE_STATUSES.has(schedule.status)) continue;
		const route = routeById.get(schedule.routeId);
		if (!route) continue;
		const current = byBus.get(schedule.busId) || [];
		current.push({ id: doc.id, window: getWindow(schedule, route) });
		byBus.set(schedule.busId, current);
	}
	for (const [busId, duties] of byBus) {
		duties.sort((first, second) => first.window.start - second.window.start);
		for (let index = 0; index < duties.length; index += 1) {
			for (let next = index + 1; next < duties.length; next += 1) {
				if (duties[next].window.start >= duties[index].window.end) break;
				if (overlaps(duties[index].window, duties[next].window)) {
					conflicts.push(`${busId}:${duties[index].id}/${duties[next].id}`);
				}
			}
		}
	}

	const dates = seededSchedules.map((doc) => doc.data().date).sort();
	const result = {
		seededRoutes: seededRoutes.length,
		seededSchedules: seededSchedules.length,
		scheduleDateRange: dates.length ? [dates[0], dates.at(-1)] : [],
		missingRouteOrBusReferences: badReferences,
		inactiveOrOutOfRangeSchedules: invalidSchedules,
		invalidRouteStopRecords: invalidRoutes,
		overlappingActiveScheduleDuties: conflicts,
	};
	console.log(JSON.stringify(result, null, 2));
	if (seededRoutes.length !== 15 || seededSchedules.length !== 25
		|| badReferences.length || invalidSchedules.length || invalidRoutes.length || conflicts.length) {
		process.exitCode = 1;
	}
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
}).finally(() => admin.app().delete());
