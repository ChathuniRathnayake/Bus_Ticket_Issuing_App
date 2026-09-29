import test from "node:test";
import assert from "node:assert/strict";
import { journeySegmentsOverlap, validateJourneySegment } from "../services/journeySegments.js";

const route = {
  routeId: "TEST_ROUTE",
  startStop: "Origin",
  endStop: "Destination",
  stops: [
    { stopId: "origin", name: "Origin", sequence: 0, boardingAllowed: true, alightingAllowed: false },
    { stopId: "middle", name: "Middle", sequence: 1, boardingAllowed: true, alightingAllowed: true },
    { stopId: "destination", name: "Destination", sequence: 2, boardingAllowed: false, alightingAllowed: true },
  ],
};

test("validates ordered stops and segment legs", () => {
  const segment = validateJourneySegment(route, "origin", "middle");
  assert.deepEqual(segment.segmentStopIds, ["origin"]);
  assert.equal(segment.boardingIndex, 0);
  assert.equal(segment.dropIndex, 1);
});

test("allows adjacent segments to reuse a seat", () => {
  assert.equal(journeySegmentsOverlap(
    { boardingStopIndex: 0, dropStopIndex: 1 },
    { boardingStopIndex: 1, dropStopIndex: 2 },
  ), false);
});

test("rejects overlapping segments", () => {
  assert.equal(journeySegmentsOverlap(
    { boardingStopIndex: 0, dropStopIndex: 2 },
    { boardingStopIndex: 1, dropStopIndex: 2 },
  ), true);
});

test("rejects reverse stop order", () => {
  assert.throws(() => validateJourneySegment(route, "middle", "origin"), /Destination must follow/);
});

test("allows boarding and alighting at any ordered route halt", () => {
  const routeWithUnflaggedHalts = {
    ...route,
    stops: route.stops.map((stop) => ({ ...stop, boardingAllowed: false, alightingAllowed: false })),
  };
  const segment = validateJourneySegment(routeWithUnflaggedHalts, "middle", "destination");
  assert.deepEqual(segment.segmentStopIds, ["middle"]);
  assert.equal(segment.boardingStop.stopId, "middle");
  assert.equal(segment.dropStop.stopId, "destination");
});
