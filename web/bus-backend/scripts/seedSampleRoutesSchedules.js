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

const routeSpecs = [
	{ id: "GALLE_KANDY", name: "Galle–Kandy", origin: "Galle", destination: "Kandy", durationMinutes: 450, classification: "illustrative_mixed_corridor", note: "Illustrative connection from the Southern Expressway to the Central Expressway; not a verified direct timetable.", stops: [["Galle Bus Stand", "terminal"], ["Pinnaduwa Interchange", "expressway_interchange"], ["Southern Expressway", "expressway_segment"], ["Kottawa Interchange", "expressway_interchange"], ["Outer Circular Expressway", "expressway_segment"], ["Kadawatha Interchange", "expressway_interchange"], ["Central Expressway", "expressway_segment"], ["Kurunegala", "normal_road_waypoint"], ["Galagedara", "normal_road_waypoint"], ["Kandy", "terminal"]] },
	{ id: "COLOMBO_GALLE", name: "Colombo–Galle", origin: "Colombo", destination: "Galle", durationMinutes: 180, classification: "published_highway_corridor", note: "General published Colombo/Pettah–Galle highway corridor; exact terminal and operator stop pattern vary.", stops: [["Colombo/Pettah", "terminal"], ["Orugodawatta", "normal_road_waypoint"], ["Peliyagoda", "normal_road_waypoint"], ["Kerawalapitiya Interchange", "expressway_interchange"], ["Outer Circular Expressway", "expressway_segment"], ["Kottawa Interchange", "expressway_interchange"], ["Southern Expressway", "expressway_segment"], ["Pinnaduwa Interchange", "expressway_interchange"], ["Galle", "terminal"]] },
	{ id: "MATARA_KANDY", name: "Matara–Kandy", origin: "Matara", destination: "Kandy", durationMinutes: 420, classification: "proposed_mixed_corridor", note: "Proposed connecting corridor; not a verified timetable for a direct Matara–Kandy service.", stops: [["Matara Bus Stand", "terminal"], ["Godagama Interchange", "expressway_interchange"], ["Southern Expressway", "expressway_segment"], ["Kottawa Interchange", "expressway_interchange"], ["Outer Circular Expressway", "expressway_segment"], ["Kadawatha Interchange", "expressway_interchange"], ["Central Expressway", "expressway_segment"], ["Kurunegala", "normal_road_waypoint"], ["Galagedara", "normal_road_waypoint"], ["Kandy", "terminal"]] },
	{ id: "NUWARA_ELIYA_COLOMBO", name: "Nuwara Eliya–Colombo", origin: "Nuwara Eliya", destination: "Colombo", durationMinutes: 360, classification: "illustrative_normal_road_corridor", note: "Illustrative A7/Avissawella-side ordinary-road corridor; not a verified highway-bus stop list.", stops: [["Nuwara Eliya", "terminal"], ["Nanu Oya", "normal_road_waypoint"], ["Hatton Road junction area", "normal_road_waypoint"], ["Avissawella", "normal_road_waypoint"], ["Hanwella", "normal_road_waypoint"], ["Kaduwela", "normal_road_waypoint"], ["Colombo", "terminal"]] },
	{ id: "COLOMBO_KANDY", name: "Colombo–Kandy", origin: "Colombo", destination: "Kandy", durationMinutes: 240, classification: "published_highway_corridor", note: "General Colombo–Kandy highway service corridor (EX3/4-602 cited by requester); confirm operator-authorized boarding locations.", stops: [["Colombo/Pettah", "terminal"], ["Peliyagoda", "normal_road_waypoint"], ["Kadawatha", "normal_road_waypoint"], ["Yakkala", "normal_road_waypoint"], ["Nittambuwa", "normal_road_waypoint"], ["Pasyala", "normal_road_waypoint"], ["Mirigama", "normal_road_waypoint"], ["Kurunegala", "normal_road_waypoint"], ["Galagedara", "normal_road_waypoint"], ["Kandy", "terminal"]] },
	{ id: "COLOMBO_MATARA", name: "Colombo–Matara", origin: "Colombo", destination: "Matara", durationMinutes: 225, classification: "published_expressway_corridor", note: "Published expressway service corridor; approach-side boarding varies by operator and is not authorized by this sample record.", stops: [["Colombo", "terminal"], ["Maharagama", "normal_road_waypoint"], ["Pannipitiya", "normal_road_waypoint"], ["Kottawa/Makumbura", "normal_road_waypoint"], ["Southern Expressway", "expressway_segment"], ["Godagama Interchange", "expressway_interchange"], ["Matara", "terminal"]] },
	{ id: "COLOMBO_HAMBANTOTA", name: "Colombo–Hambantota", origin: "Colombo", destination: "Hambantota", durationMinutes: 330, classification: "illustrative_expressway_corridor", note: "Expressway corridor; actual terminal and final approach depend on operator service.", stops: [["Colombo", "terminal"], ["Maharagama", "normal_road_waypoint"], ["Pannipitiya", "normal_road_waypoint"], ["Kottawa/Makumbura", "normal_road_waypoint"], ["Southern Expressway", "expressway_segment"], ["Mattala Interchange", "expressway_interchange"], ["Hambantota", "terminal"]] },
	{ id: "KANDY_GALLE", name: "Kandy–Galle", origin: "Kandy", destination: "Galle", durationMinutes: 450, classification: "proposed_mixed_corridor", note: "Proposed reverse-direction mixed corridor; verify whether an operator runs this direct service.", stops: [["Kandy", "terminal"], ["Galagedara", "normal_road_waypoint"], ["Kurunegala", "normal_road_waypoint"], ["Central Expressway", "expressway_segment"], ["Kadawatha Interchange", "expressway_interchange"], ["Outer Circular Expressway", "expressway_segment"], ["Kottawa Interchange", "expressway_interchange"], ["Southern Expressway", "expressway_segment"], ["Pinnaduwa Interchange", "expressway_interchange"], ["Galle", "terminal"]] },
	{ id: "KURUNEGALA_COLOMBO", name: "Kurunegala–Colombo", origin: "Kurunegala", destination: "Colombo", durationMinutes: 180, classification: "published_highway_corridor", note: "General published Colombo–Kurunegala/Kandy highway corridor; precise interchange entry/exit depends on service.", stops: [["Kurunegala", "terminal"], ["Mirigama", "normal_road_waypoint"], ["Pasyala", "normal_road_waypoint"], ["Nittambuwa", "normal_road_waypoint"], ["Yakkala", "normal_road_waypoint"], ["Kadawatha", "normal_road_waypoint"], ["Peliyagoda", "normal_road_waypoint"], ["Colombo/Pettah", "terminal"]] },
	{ id: "NEGOMBO_GALLE", name: "Negombo–Galle", origin: "Negombo", destination: "Galle", durationMinutes: 270, classification: "proposed_mixed_corridor", note: "Plausible connecting corridor; not confirmation of a direct scheduled service.", stops: [["Negombo", "terminal"], ["Ja-Ela", "normal_road_waypoint"], ["Kerawalapitiya Interchange", "expressway_interchange"], ["Outer Circular Expressway", "expressway_segment"], ["Kottawa Interchange", "expressway_interchange"], ["Southern Expressway", "expressway_segment"], ["Pinnaduwa Interchange", "expressway_interchange"], ["Galle", "terminal"]] },
	{ id: "COLOMBO_BADULLA", name: "Colombo–Badulla", origin: "Colombo", destination: "Badulla", durationMinutes: 480, classification: "proposed_mixed_corridor", note: "Proposed corridor via Southern Expressway/Mattala and Uva; operators may instead use A4 via Ratnapura.", stops: [["Colombo", "terminal"], ["Maharagama", "normal_road_waypoint"], ["Pannipitiya", "normal_road_waypoint"], ["Kottawa/Makumbura", "normal_road_waypoint"], ["Southern Expressway", "expressway_segment"], ["Mattala Interchange", "expressway_interchange"], ["Wellawaya", "normal_road_waypoint"], ["Ella", "normal_road_waypoint"], ["Bandarawela", "normal_road_waypoint"], ["Badulla", "terminal"]] },
	{ id: "KANDY_COLOMBO", name: "Kandy–Colombo", origin: "Kandy", destination: "Colombo", durationMinutes: 240, classification: "published_highway_corridor", note: "General published Kandy–Colombo service corridor; intermediate passenger boarding permissions require operator confirmation.", stops: [["Kandy", "terminal"], ["Peradeniya", "normal_road_waypoint"], ["Mawanella", "normal_road_waypoint"], ["Kegalle", "normal_road_waypoint"], ["Warakapola", "normal_road_waypoint"], ["Pasyala", "normal_road_waypoint"], ["Nittambuwa", "normal_road_waypoint"], ["Yakkala", "normal_road_waypoint"], ["Kadawatha", "normal_road_waypoint"], ["Peliyagoda", "normal_road_waypoint"], ["Colombo/Pettah", "terminal"]] },
	{ id: "COLOMBO_ANURADHAPURA", name: "Colombo–Anuradhapura", origin: "Colombo", destination: "Anuradhapura", durationMinutes: 330, classification: "illustrative_mixed_corridor", note: "Illustrative route via Kurunegala–Dambulla; exact road and expressway access require operator timetable confirmation.", stops: [["Colombo", "terminal"], ["Peliyagoda", "normal_road_waypoint"], ["Kadawatha", "normal_road_waypoint"], ["Mirigama", "normal_road_waypoint"], ["Kurunegala", "normal_road_waypoint"], ["Dambulla", "normal_road_waypoint"], ["Kekirawa", "normal_road_waypoint"], ["Anuradhapura", "terminal"]] },
	{ id: "GALLE_KURUNEGALA", name: "Galle–Kurunegala", origin: "Galle", destination: "Kurunegala", durationMinutes: 390, classification: "ntc_corridor_operator_stops_unverified", note: "NTC records include a Galle–Kurunegala expressway service; precise operator stopping pattern remains unverified.", stops: [["Galle", "terminal"], ["Pinnaduwa Interchange", "expressway_interchange"], ["Southern Expressway", "expressway_segment"], ["Kottawa Interchange", "expressway_interchange"], ["Outer Circular Expressway", "expressway_segment"], ["Kadawatha Interchange", "expressway_interchange"], ["Central Expressway", "expressway_segment"], ["Kurunegala", "terminal"]] },
	{ id: "MATARA_COLOMBO", name: "Matara–Colombo", origin: "Matara", destination: "Colombo", durationMinutes: 225, classification: "published_expressway_corridor", note: "General published expressway service corridor; exact operator terminal and stops vary.", stops: [["Matara Bus Stand", "terminal"], ["Godagama Interchange", "expressway_interchange"], ["Southern Expressway", "expressway_segment"], ["Kottawa Interchange", "expressway_interchange"], ["Outer Circular Expressway", "expressway_segment"], ["Kerawalapitiya Interchange", "expressway_interchange"], ["Peliyagoda", "normal_road_waypoint"], ["Orugodawatta", "normal_road_waypoint"], ["Colombo/Pettah", "terminal"]] },
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
		startTime: "",
		endTime: "",
		date: "",
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
		const scheduleId = `SAMPLE_${slot.date.replaceAll("-", "")}_${String(slot.slot + 1).padStart(2, "0")}`;
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
