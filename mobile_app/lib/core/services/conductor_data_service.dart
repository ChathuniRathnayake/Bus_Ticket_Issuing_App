import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/bus_model.dart';
import '../../models/conductor_model.dart';
import '../../models/route_model.dart';

/// All Firestore CRUD operations for the Conductor app.
/// Screens should never call FirebaseFirestore directly — use this service.
class ConductorDataService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // ─────────────────────────────────────────────────────────────────────────
  // CONDUCTOR
  // ─────────────────────────────────────────────────────────────────────────

  /// Fetch a single conductor document by their Firebase Auth UID.
  Future<Conductor?> getConductorById(String uid) async {
    try {
      final doc = await _db.collection('conductors').doc(uid).get();
      if (!doc.exists) return null;
      return Conductor.fromMap(doc.data()!, id: doc.id);
    } catch (e) {
      print('ConductorDataService.getConductorById error: $e');
      return null;
    }
  }

  /// Update editable fields on a conductor document.
  Future<void> updateConductor(String uid, Map<String, dynamic> fields) async {
    try {
      await _db.collection('conductors').doc(uid).update(fields);
    } catch (e) {
      print('ConductorDataService.updateConductor error: $e');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BUS
  // ─────────────────────────────────────────────────────────────────────────

  /// Fetch a single bus document by its ID.
  Future<Bus?> getBusById(String busId) async {
    try {
      final doc = await _db.collection('buses').doc(busId).get();
      if (!doc.exists) return null;
      return Bus.fromMap(doc.data()!, id: doc.id);
    } catch (e) {
      print('ConductorDataService.getBusById error: $e');
      return null;
    }
  }

  /// Live stream of a bus document (for real-time dashboard updates).
  Stream<Map<String, dynamic>?> busStream(String busId) {
    return _db.collection('buses').doc(busId).snapshots().map((snap) {
      if (!snap.exists) return null;
      final data = snap.data()!;
      data['id'] = snap.id;
      return data;
    });
  }

  /// Update the current GPS location on a bus document.
  Future<void> updateBusLocation(String busId, String location) async {
    try {
      await _db.collection('buses').doc(busId).update({
        'currentLocation': location,
        'lastUpdated': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      print('ConductorDataService.updateBusLocation error: $e');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ROUTE
  // ─────────────────────────────────────────────────────────────────────────

  /// Fetch a single route document by its Firestore document ID.
  Future<RouteModel?> getRouteById(String routeId) async {
    try {
      final doc = await _db.collection('routes').doc(routeId).get();
      if (!doc.exists) return null;
      return RouteModel.fromMap(doc.data()!, id: doc.id);
    } catch (e) {
      print('ConductorDataService.getRouteById error: $e');
      return null;
    }
  }

  /// Get all stop names in order from the route's `stops` array.
  /// The list is sorted by `sequence` field and is PARALLEL to `stopFareCents`.
  Future<List<String>> getStopsForRoute(String routeId) async {
    try {
      final doc = await _db.collection('routes').doc(routeId).get();
      if (!doc.exists) return [];

      final data = doc.data()!;

      // Primary: use the structured `stops` array (sorted by sequence)
      if (data['stops'] != null && data['stops'] is List) {
        final rawStops = List<dynamic>.from(data['stops']);

        // Sort by sequence field if present
        rawStops.sort((a, b) {
          final seqA = (a is Map ? a['sequence'] ?? 0 : 0) as int;
          final seqB = (b is Map ? b['sequence'] ?? 0 : 0) as int;
          return seqA.compareTo(seqB);
        });

        final names = rawStops.map((s) {
          if (s is String) return s;
          if (s is Map && s['name'] != null) return s['name'].toString();
          return '';
        }).where((n) => n.isNotEmpty).toList();

        if (names.isNotEmpty) return names;
      }

      // Fallback: build list from startStop + endStop only
      final List<String> fallback = [];
      if (data['startStop'] != null) fallback.add(data['startStop'].toString());
      if (data['endStop'] != null) fallback.add(data['endStop'].toString());
      return fallback;
    } catch (e) {
      print('ConductorDataService.getStopsForRoute error: $e');
      return [];
    }
  }

  /// Get the stopFareCents array for a route (parallel to stops list).
  Future<List<int>> getStopFaresForRoute(String routeId) async {
    try {
      final doc = await _db.collection('routes').doc(routeId).get();
      if (!doc.exists) return [];

      final data = doc.data()!;
      if (data['stopFareCents'] == null) return [];

      return List<dynamic>.from(data['stopFareCents'])
          .map((f) => int.tryParse(f.toString()) ?? 0)
          .toList();
    } catch (e) {
      print('ConductorDataService.getStopFaresForRoute error: $e');
      return [];
    }
  }

  /// Calculate fare in rupees between two stop names on a route.
  /// Returns null if the fare cannot be determined.
  Future<double?> calculateFare({
    required String routeId,
    required String boardingStop,
    required String dropStop,
  }) async {
    try {
      final stops = await getStopsForRoute(routeId);
      final fares = await getStopFaresForRoute(routeId);

      if (stops.isEmpty || fares.isEmpty) return null;

      final fromIdx = stops.indexOf(boardingStop);
      final toIdx = stops.indexOf(dropStop);

      if (fromIdx == -1 || toIdx == -1) return null;
      if (fromIdx >= fares.length || toIdx >= fares.length) return null;

      final fareCents = (fares[toIdx] - fares[fromIdx]).abs();
      return fareCents / 100.0;
    } catch (e) {
      print('ConductorDataService.calculateFare error: $e');
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SEATS
  // ─────────────────────────────────────────────────────────────────────────

  /// Live stream of all booked seats for a bus on a specific date.
  Stream<List<Map<String, dynamic>>> bookedSeatsStream(String busId, String date) {
    return _db
        .collection('seats')
        .where('busId', isEqualTo: busId)
        .where('date', isEqualTo: date)
        .snapshots()
        .map((snap) => snap.docs.map((d) {
              final data = d.data();
              data['id'] = d.id;
              return data;
            }).toList());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TICKETS  (conductor-issued)
  // ─────────────────────────────────────────────────────────────────────────

  /// Issue a ticket:
  ///   1. Writes to `seats`   → blocks the seat on the seat map.
  ///   2. Writes to `tickets` → permanent record in the database.
  ///   3. Increments bookedSeats / decrements availableSeats on the bus.
  ///
  /// Returns the new ticket document ID, or throws on failure.
  Future<String> issueTicket({
    required String busId,
    required String routeId,
    required int seatNo,
    required String passengerName,
    required String boardingStop,
    required String dropStop,
    required double price,
    required String conductorId,
    required String date,
    String? scheduleId,
  }) async {
    // 1. Write to seats collection
    await _db.collection('seats').add({
      'busId': busId,
      'routeId': routeId,
      'seatNo': seatNo,
      'passengerName': passengerName,
      'boardingStop': boardingStop,
      'dropStop': dropStop,
      'price': price,
      'issuedBy': conductorId,
      'status': 'booked',
      'date': date,
      'scheduleId': scheduleId,
      'issuedAt': FieldValue.serverTimestamp(),
    });

    // 2. Write to tickets collection (separate map = separate serverTimestamp)
    final ticketRef = await _db.collection('tickets').add({
      'busId': busId,
      'routeId': routeId,
      'seatNo': seatNo,
      'passengerName': passengerName,
      'boardingStop': boardingStop,
      'dropStop': dropStop,
      'price': price,
      'issuedBy': conductorId,
      'status': 'booked',
      'date': date,
      'scheduleId': scheduleId,
      'issuedAt': FieldValue.serverTimestamp(),
      'createdAt': FieldValue.serverTimestamp(),
    });

    // 3. Update bus seat counters inside a transaction
    final busRef = _db.collection('buses').doc(busId);
    await _db.runTransaction((tx) async {
      final snap = await tx.get(busRef);
      if (snap.exists) {
        final d = snap.data()!;
        final booked = (d['bookedSeats'] is int)
            ? d['bookedSeats'] as int
            : int.tryParse(d['bookedSeats']?.toString() ?? '0') ?? 0;
        final available = (d['availableSeats'] is int)
            ? d['availableSeats'] as int
            : int.tryParse(d['availableSeats']?.toString() ?? '0') ?? 0;
        tx.update(busRef, {
          'bookedSeats': booked + 1,
          'availableSeats': available > 0 ? available - 1 : 0,
        });
      }
    });

    return ticketRef.id;
  }

  /// Fetch all tickets issued by a specific conductor.
  Future<List<Map<String, dynamic>>> getTicketsByConductor(String conductorId) async {
    try {
      final snap = await _db
          .collection('tickets')
          .where('issuedBy', isEqualTo: conductorId)
          .orderBy('issuedAt', descending: true)
          .get();
      return snap.docs.map((d) {
        final data = d.data();
        data['id'] = d.id;
        return data;
      }).toList();
    } catch (e) {
      print('ConductorDataService.getTicketsByConductor error: $e');
      return [];
    }
  }

  /// Fetch all tickets for a specific bus.
  Future<List<Map<String, dynamic>>> getTicketsForBus(String busId) async {
    try {
      final snap = await _db
          .collection('tickets')
          .where('busId', isEqualTo: busId)
          .orderBy('issuedAt', descending: true)
          .get();
      return snap.docs.map((d) {
        final data = d.data();
        data['id'] = d.id;
        return data;
      }).toList();
    } catch (e) {
      print('ConductorDataService.getTicketsForBus error: $e');
      return [];
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SCHEDULES
  // ─────────────────────────────────────────────────────────────────────────

  /// Fetch the current active schedule for a bus (most recent).
  Future<Map<String, dynamic>?> getActiveSchedule(String busId) async {
    try {
      final snap = await _db.collection('schedules')
          .where('busId', isEqualTo: busId)
          .where('status', isEqualTo: 'Active')
          .get();
          
      if (snap.docs.isEmpty) {
        // Fallback: get the most recent one regardless of status
        final fallbackSnap = await _db.collection('schedules')
            .where('busId', isEqualTo: busId)
            .orderBy('date', descending: true)
            .limit(1)
            .get();
        if (fallbackSnap.docs.isNotEmpty) {
          final data = fallbackSnap.docs.first.data();
          data['id'] = fallbackSnap.docs.first.id;
          return data;
        }
        return null;
      }
      
      // Helper to safely parse strings, Timestamps, or Maps to comparable strings
      String toComparableString(dynamic val) {
        if (val == null) return '';
        if (val is String) return val;
        if (val is Timestamp) return val.toDate().toIso8601String();
        if (val is Map) {
          if (val.containsKey('seconds')) {
            return Timestamp(val['seconds'] as int, val['nanoseconds'] as int? ?? 0).toDate().toIso8601String();
          }
          // If it's a custom time object with hour/minute, parse it
          if (val.containsKey('hour') && val.containsKey('minute')) {
            return "${val['hour'].toString().padLeft(2, '0')}:${val['minute'].toString().padLeft(2, '0')}";
          }
          return val.toString();
        }
        return val.toString();
      }

      // If there are multiple active schedules, sort chronologically (date ascending, then time ascending)
      // so the conductor gets the earliest active trip first.
      final docs = snap.docs;
      docs.sort((a, b) {
        final dateA = toComparableString(a.data()['date']);
        final dateB = toComparableString(b.data()['date']);
        final cmpDate = dateA.compareTo(dateB);
        if (cmpDate != 0) return cmpDate;
        
        final timeA = toComparableString(a.data()['departureTime']);
        final timeB = toComparableString(b.data()['departureTime']);
        return timeA.compareTo(timeB);
      });
      final data = docs.first.data();
      data['id'] = docs.first.id;
      return data;
    } catch (e) {
      print('ConductorDataService.getActiveSchedule error: $e');
      return null;
    }
  }

  /// Fetch schedules for a bus for the next [days] days (default 7).
  Future<List<Map<String, dynamic>>> getSchedulesForBus(
    String busId, {
    int days = 7,
  }) async {
    try {
      final now = DateTime.now();
      final snap = await _db
          .collection('schedules')
          .where('busId', isEqualTo: busId)
          .get();

      final result = snap.docs.map((d) {
        final data = d.data();
        data['id'] = d.id;
        return data;
      }).toList();

      result.sort((a, b) =>
          (a['date'] ?? '').toString().compareTo((b['date'] ?? '').toString()));
      return result;
    } catch (e) {
      print('ConductorDataService.getSchedulesForBus error: $e');
      return [];
    }
  }
}
