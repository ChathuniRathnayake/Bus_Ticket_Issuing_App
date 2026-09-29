import { admin, db } from "../config/firebase.js";

const SEED_TAG = "sample-routes-schedules-2026-09";
const SOURCES = {
	ntc: "https://ntc.gov.lk/Bus_info/time_table.php",
	expresswayTimetable: "https://drive.google.com/drive/folders/1CU2zYTLomUcnElUnOoB0kdMtQjYK0oVH?usp=share_link",
	normalwayTimetable: "https://drive.google.com/drive/folders/1IXszV0llAjHNvumrKR99U0yzGQ7_Rd2x?usp=share_link",
	rdaExpressway: "https://www.exway.rda.gov.lk/exway/index.html",
	busTimetable: "https://bustimetable.lk/",
	highwayBus: "https://highwaybus.lk/",
};

// Final suggested operator passenger stop lists. Intermediate entries are the
// regular roadside boarding/alighting points on each corridor; expressway
// interchanges and "interchange only" waypoints have been removed.
const routeSpecs = [
	{ id: "KANDY_KURUNEGALA", name: "Kandy–Kurunegala", origin: "Kandy", destination: "Kurunegala", durationMinutes: 150, classification: "operator_passenger_stops", note: "Final suggested passenger stop list.", stops: [["Kandy", "terminal"], ["Peradeniya", "normal_road_waypoint"], ["Katugastota", "normal_road_waypoint"], ["Galagedara", "normal_road_waypoint"], ["Kurunegala", "terminal"]] },
	{ id: "GALLE_KANDY", name: "Galle–Kandy", origin: "Galle", destination: "Kandy", durationMinutes: 450, classification: "operator_passenger_stops", note: "Final suggested passenger stop list.", stops: [["Galle", "terminal"], ["Nittambuwa", "normal_road_waypoint"], ["Warakapola", "normal_road_waypoint"], ["Kegalle", "normal_road_waypoint"], ["Mawanella", "normal_road_waypoint"], ["Peradeniya", "normal_road_waypoint"], ["Kandy", "terminal"]] },
	{ id: "COLOMBO_GALLE", name: "Colombo–Galle", origin: "Colombo", destination: "Galle", durationMinutes: 180, classification: "operator_passenger_stops", note: "Final suggested passenger stop list.", stops: [["Colombo", "terminal"], ["Maharagama", "normal_road_waypoint"], ["Pannipitiya", "normal_road_waypoint"], ["Kottawa", "normal_road_waypoint"], ["Galle", "terminal"]] },
	{ id: "MATARA_KANDY", name: "Matara–Kandy", origin: "Matara", destination: "Kandy", durationMinutes: 420, classification: "operator_passenger_stops", note: "Final suggested passenger stop list.", stops: [["Matara", "terminal"], ["Nittambuwa", "normal_road_waypoint"], ["Warakapola", "normal_road_waypoint"], ["Kegalle", "normal_road_waypoint"], ["Mawanella", "normal_road_waypoint"], ["Peradeniya", "normal_road_waypoint"], ["Kandy", "terminal"]] },
	{ id: "NUWARA_ELIYA_COLOMBO", name: "Nuwara Eliya–Colombo", origin: "Nuwara Eliya", destination: "Colombo", durationMinutes: 360, classification: "operator_passenger_stops", note: "Final suggested passenger stop list.", stops: [["Nuwara Eliya", "terminal"], ["Hatton", "normal_road_waypoint"], ["Ginigathhena", "normal_road_waypoint"], ["Avissawella", "normal_road_waypoint"], ["Hanwella", "normal_road_waypoint"], ["Kaduwela", "normal_road_waypoint"], ["Colombo", "terminal"]] },
	{ id: "COLOMBO_KANDY", name: "Colombo–Kandy", origin: "Colombo", destination: "Kandy", durationMinutes: 240, classification: "operator_passenger_stops", note: "Final suggested passenger stop list.", stops: [["Colombo", "terminal"], ["Kadawatha", "normal_road_waypoint"], ["Nittambuwa", "normal_road_waypoint"], ["Warakapola", "normal_road_waypoint"], ["Kegalle", "normal_road_waypoint"], ["Mawanella", "normal_road_waypoint"], ["Kandy", "terminal"]] },
	{ id: "COLOMBO_MATARA", name: "Colombo–Matara", origin: "Colombo", destination: "Matara", durationMinutes: 225, classification: "operator_passenger_stops", note: "Final suggested passenger stop list.", stops: [["Colombo", "terminal"], ["Maharagama", "normal_road_waypoint"], ["Pannipitiya", "normal_road_waypoint"], ["Kottawa", "normal_road_waypoint"], ["Matara", "terminal"]] },
	{ id: "KANDY_GALLE", name: "Kandy–Galle", origin: "Kandy", destination: "Galle", durationMinutes: 450, classification: "operator_passenger_stops", note: "Final suggested passenger stop list.", stops: [["Kandy", "terminal"], ["Peradeniya", "normal_road_waypoint"], ["Mawanella", "normal_road_waypoint"], ["Kegalle", "normal_road_waypoint"], ["Warakapola", "normal_road_waypoint"], ["Nittambuwa", "normal_road_waypoint"], ["Galle", "terminal"]] },
	{ id: "KURUNEGALA_COLOMBO", name: "Kurunegala–Colombo", origin: "Kurunegala", destination: "Colombo", durationMinutes: 180, classification: "operator_passenger_stops", note: "Final suggested passenger stop list (route-dependent).", stops: [["Kurunegala", "terminal"], ["Dambadeniya", "normal_road_waypoint"], ["Narammala", "normal_road_waypoint"], ["Pannala", "normal_road_waypoint"], ["Colombo", "terminal"]] },
	{ id: "NEGOMBO_GALLE", name: "Negombo–Galle", origin: "Negombo", destination: "Galle", durationMinutes: 270, classification: "operator_passenger_stops", note: "Final suggested passenger stop list.", stops: [["Negombo", "terminal"], ["Ja-Ela", "normal_road_waypoint"], ["Wattala", "normal_road_waypoint"], ["Peliyagoda", "normal_road_waypoint"], ["Kottawa", "normal_road_waypoint"], ["Galle", "terminal"]] },
	{ id: "COLOMBO_BADULLA", name: "Colombo–Badulla", origin: "Colombo", destination: "Badulla", durationMinutes: 480, classification: "operator_passenger_stops", note: "Final suggested passenger stop list.", stops: [["Colombo", "terminal"], ["Maharagama", "normal_road_waypoint"], ["Pannipitiya", "normal_road_waypoint"], ["Kottawa", "normal_road_waypoint"], ["Ratnapura", "normal_road_waypoint"], ["Balangoda", "normal_road_waypoint"], ["Badulla", "terminal"]] },
	{ id: "COLOMBO_HAMBANTOTA", name: "Colombo–Hambantota", origin: "Colombo", destination: "Hambantota", durationMinutes: 330, classification: "operator_passenger_stops", note: "Final suggested passenger stop list.", stops: [["Colombo", "terminal"], ["Maharagama", "normal_road_waypoint"], ["Pannipitiya", "normal_road_waypoint"], ["Kottawa", "normal_road_waypoint"], ["Hambantota", "terminal"]] },
	{ id: "COLOMBO_ANURADHAPURA", name: "Colombo–Anuradhapura", origin: "Colombo", destination: "Anuradhapura", durationMinutes: 330, classification: "operator_passenger_stops", note: "Final suggested passenger stop list.", stops: [["Colombo", "terminal"], ["Kadawatha", "normal_road_waypoint"], ["Mirigama", "normal_road_waypoint"], ["Pasyala", "normal_road_waypoint"], ["Nittambuwa", "normal_road_waypoint"], ["Warakapola", "normal_road_waypoint"], ["Anuradhapura", "terminal"]] },
	{ id: "GALLE_KURUNEGALA", name: "Galle–Kurunegala", origin: "Galle", destination: "Kurunegala", durationMinutes: 390, classification: "operator_passenger_stops", note: "Final suggested passenger stop list.", stops: [["Galle", "terminal"], ["Nittambuwa", "normal_road_waypoint"], ["Warakapola", "normal_road_waypoint"], ["Kegalle", "normal_road_waypoint"], ["Mawanella", "normal_road_waypoint"], ["Galagedara", "normal_road_waypoint"], ["Kurunegala", "terminal"]] },
	{ id: "MATARA_COLOMBO", name: "Matara–Colombo", origin: "Matara", destination: "Colombo", durationMinutes: 225, classification: "operator_passenger_stops", note: "Final suggested passenger stop list.", stops: [["Matara", "terminal"], ["Kottawa", "normal_road_waypoint"], ["Pannipitiya", "normal_road_waypoint"], ["Maharagama", "normal_road_waypoint"], ["Colombo", "terminal"]] },
];

const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const sourceUrls = Object.values(SOURCES);

function routeDocument(spec) {
	const stops = spec.stops.map(([name, stopType], sequence) => ({
		stopId: `${spec.id.toLowerCase()}-${String(sequence + 1).padStart(2, "0")}-${slug(name)}`,
		name,
		sequence,
		stopType,
		boardingAllowed: sequence === 0,
		alightingAllowed: sequence === spec.stops.length - 1,
		...(sequence === 0 || sequence === spec.stops.length - 1
			? { estimatedMinutesFromOrigin: sequence === 0 ? 0 : spec.durationMinutes }
			: {}),
		timingBasis: sequence === 0 || sequence === spec.stops.length - 1
			? "sample estimate; confirm current operator time card"
			: "not available from supplied corridor; no arrival time asserted",
		sourceUrls: stopType === "expressway_interchange" || stopType === "expressway_segment"
			? [SOURCES.rdaExpressway, SOURCES.expresswayTimetable]
			: [SOURCES.ntc, SOURCES.normalwayTimetable],
	}));

	return {
		routeId: spec.id,
		routeName: spec.name,
		startStop: spec.origin,
		endStop: spec.destination,
		distance: "",
		duration: `${Math.floor(spec.durationMinutes / 60)}:${String(spec.durationMinutes % 60).padStart(2, "0")}`,
		routeType: spec.classification,
		stops,
		sourceUrls,
		sourceVerification: spec.note,
		estimatedDurationMinutes: spec.durationMinutes,
		sampleData: true,
		seedTag: SEED_TAG,
	};
}

const routes = routeSpecs.map(routeDocument);

const dateSlots = Array.from({ length: 14 }, (_, offset) => {
	const date = new Date(Date.UTC(2026, 8, 28 + offset)).toISOString().slice(0, 10);
	return { date, count: offset < 11 ? 2 : 1 };
}).flatMap(({ date, count }) => Array.from({ length: count }, (_, slot) => ({ date, slot })));

const departureTimes = ["05:30", "15:00"];

function durationFor(route) {
	return Number(route?.estimatedDurationMinutes)
		|| ((Number(String(route?.duration || "8:00").split(":")[0]) || 0) * 60)
		+ (Number(String(route?.duration || "8:00").split(":")[1]) || 0);
}

function getWindow(schedule, durationMinutes) {
	const start = new Date(`${schedule.date}T${schedule.departureTime}:00`).getTime();
	return { start, end: start + (durationMinutes + 45) * 60_000 };
}

function overlaps(first, second) {
	const a = getWindow(first, first.durationMinutes);
	const b = getWindow(second, second.durationMinutes);
	return a.start < b.end && b.start < a.end;
}

async function planSchedules(activeBuses, existingSchedules, existingRoutes) {
	if (activeBuses.length === 0) throw new Error("No active existing buses found; no buses will be created by this seed.");
	const plans = [];
	const routeLookup = new Map([...existingRoutes, ...routes].map((route) => [route.routeId, route]));

	for (const [index, slot] of dateSlots.entries()) {
		const route = routes[index % routes.length];
		const scheduleId = `sch${String(index + 1).padStart(2, "0")}`;
		const candidate = {
			scheduleId,
			routeId: route.routeId,
			date: slot.date,
			departureTime: departureTimes[slot.slot],
			durationMinutes: route.estimatedDurationMinutes,
		};
		let bus = null;

		for (const activeBus of activeBuses) {
			const duties = [...existingSchedules, ...plans]
				.filter((schedule) => schedule.busId === activeBus.id
					&& schedule.id !== scheduleId
					&& schedule.scheduleId !== scheduleId
					&& schedule.status !== "Cancelled")
				.map((schedule) => ({
					...schedule,
					durationMinutes: durationFor(routeLookup.get(schedule.routeId)),
				}));
			if (!duties.some((duty) => overlaps(candidate, duty))) {
				bus = activeBus;
				break;
			}
		}
		if (!bus) throw new Error(`No active existing bus is free for ${scheduleId}; no bus records will be created or modified.`);

		plans.push({
			scheduleId,
			busId: bus.id,
			routeId: route.routeId,
			date: slot.date,
			departureTime: candidate.departureTime,
			status: "Active",
			estimatedDurationMinutes: route.estimatedDurationMinutes,
			sourceNote: "Sample date/time for app testing, not an NTC-published departure.",
			sampleData: true,
			seedTag: SEED_TAG,
		});
	}
	return plans;
}

async function main() {
	const apply = process.argv.includes("--apply");
	const [busSnapshot, scheduleSnapshot, routeSnapshot] = await Promise.all([
		db.collection("buses").get(),
		db.collection("schedules").get(),
		db.collection("routes").get(),
	]);
	const buses = busSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	const activeBuses = buses.filter((bus) => bus.status === "Active");
	const existingSchedules = scheduleSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	const existingRoutes = routeSnapshot.docs.map((doc) => ({ routeId: doc.id, ...doc.data() }));
	const schedules = await planSchedules(activeBuses, existingSchedules, existingRoutes);

	for (const route of routes) {
		const existing = existingRoutes.find((item) => item.routeId === route.routeId);
		if (existing && existing.seedTag !== SEED_TAG) throw new Error(`Refusing to overwrite non-seed route ${route.routeId}`);
		const ticketSnapshot = await db.collection("tickets").where("routeId", "==", route.routeId).get();
		const hasActiveTickets = ticketSnapshot.docs.some((doc) => ["BOOKED", "booked", "PENDING_PAYMENT", "CHECKOUT_CREATED"].includes(doc.data().status));
		if (existing && hasActiveTickets && JSON.stringify(existing.stops) !== JSON.stringify(route.stops)) {
			throw new Error(`Refusing to change ${route.routeId} stops while active tickets reference it`);
		}
	}

	for (const schedule of schedules) {
		const existing = existingSchedules.find((item) => item.id === schedule.scheduleId);
		if (existing && existing.seedTag !== SEED_TAG) throw new Error(`Refusing to overwrite non-seed schedule ${schedule.scheduleId}`);
		if (existing) {
			const ticketSnapshot = await db.collection("tickets").where("scheduleId", "==", schedule.scheduleId).get();
			if (ticketSnapshot.docs.some((doc) => ["BOOKED", "booked", "PENDING_PAYMENT", "CHECKOUT_CREATED"].includes(doc.data().status))
				&& ["busId", "routeId", "date", "departureTime"].some((field) => existing[field] !== schedule[field])) {
				throw new Error(`Refusing to change ${schedule.scheduleId} while active tickets reference it`);
			}
		}
	}

	const summary = {
		mode: apply ? "apply" : "dry-run",
		routes: routes.length,
		schedules: schedules.length,
		existingActiveBusesUsed: [...new Set(schedules.map((schedule) => schedule.busId))].length,
		firstDate: schedules[0]?.date,
		lastDate: schedules.at(-1)?.date,
	};
	console.log(JSON.stringify(summary, null, 2));
	if (!apply) {
		console.log("Dry run only. Pass --apply to upsert records.");
		return;
	}

	const writer = db.bulkWriter();
	for (const route of routes) {
		writer.set(db.collection("routes").doc(route.routeId), {
			...route,
			updatedAt: admin.firestore.FieldValue.serverTimestamp(),
		}, { merge: true });
	}
	for (const schedule of schedules) {
		writer.set(db.collection("schedules").doc(schedule.scheduleId), {
			...schedule,
			updatedAt: admin.firestore.FieldValue.serverTimestamp(),
		}, { merge: true });
	}
	await writer.close();
	console.log(`Upserted ${routes.length} route and ${schedules.length} schedule records; buses and booking data were not modified.`);
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
}).finally(() => admin.app().delete());
