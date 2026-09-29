import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/route_model.dart';

class PassengerDataService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Fetch all available bus stops as a stream
  Stream<List<String>> getBusStopsStream() {
    return _firestore.collection('halts').snapshots().map((snapshot) {
      if (snapshot.docs.isEmpty) return [];
      
      final Set<String> stopNames = snapshot.docs
          .map((doc) {
            final data = doc.data();
            // Check multiple possible field names
            return (data['name'] ?? data['haltName'] ?? data['stopName'] ?? '').toString();
          })
          .where((name) => name.isNotEmpty)
          .cast<String>()
          .toSet();
      
      final List<String> sortedStops = stopNames.toList()..sort();
      return sortedStops;
    });
  }

  // Fetch all available bus stops (Future version)
  Future<List<String>> getBusStops() async {
    try {
      final snapshot = await _firestore.collection('halts').get();
      if (snapshot.docs.isEmpty) return [];
      
      final Set<String> stopNames = snapshot.docs
          .map((doc) {
            final data = doc.data();
            return (data['name'] ?? data['haltName'] ?? data['stopName'] ?? '').toString();
          })
          .where((name) => name.isNotEmpty)
          .cast<String>()
          .toSet();
      
      return stopNames.toList()..sort();
    } catch (e) {
      print("Error fetching bus stops: $e");
      return [];
    }
  }

  // Fetch popular routes
  Future<List<RouteModel>> getPopularRoutes() async {
    try {
      final snapshot = await _firestore
          .collection('routes')
          .where('isPopular', isEqualTo: true)
          .get();
      
      if (snapshot.docs.isEmpty) {
        // If no popular routes marked, just get some routes
        final allRoutes = await _firestore.collection('routes').limit(5).get();
        return allRoutes.docs.map((doc) => RouteModel.fromMap(doc.data(), id: doc.id)).toList();
      }
      
      return snapshot.docs.map((doc) => RouteModel.fromMap(doc.data(), id: doc.id)).toList();
    } catch (e) {
      print("Error fetching popular routes: $e");
      return [];
    }
  }

  // Search routes based on from and to halts
  Future<List<RouteModel>> searchRoutes(String from, String to) async {
    try {
      final Set<String> matchingRouteIds = {};

      // 1. Direct match with startStop and endStop in 'routes' collection
      final directMatchSnapshot = await _firestore
          .collection('routes')
          .where('startStop', isEqualTo: from)
          .where('endStop', isEqualTo: to)
          .get();
      
      for (var doc in directMatchSnapshot.docs) {
        matchingRouteIds.add(doc.id);
      }

      // 2. Search via 'halts' collection for intermediate halts
      // Get routeIds that pass through 'from'
      final fromSnapshot = await _firestore.collection('halts').where('name', isEqualTo: from).get();
      final fromRoutes = fromSnapshot.docs.map((doc) => {
        'routeId': (doc.data()['routeId'] ?? '').toString(),
        'order': int.tryParse(doc.data()['order']?.toString() ?? '0') ?? 0
      }).toList();

      // Get routeIds that pass through 'to'
      final toSnapshot = await _firestore.collection('halts').where('name', isEqualTo: to).get();
      final toRoutes = toSnapshot.docs.map((doc) => {
        'routeId': (doc.data()['routeId'] ?? '').toString(),
        'order': int.tryParse(doc.data()['order']?.toString() ?? '0') ?? 0
      }).toList();

      // Find matching routeIds where fromOrder < toOrder
      for (var f in fromRoutes) {
        for (var t in toRoutes) {
          if (f['routeId'] == t['routeId'] && (f['order'] as int) < (t['order'] as int)) {
            matchingRouteIds.add(f['routeId'] as String);
          }
        }
      }

      if (matchingRouteIds.isEmpty) return [];

      // 3. Fetch the actual route documents
      // Note: whereIn is limited to 30 items
      final routesSnapshot = await _firestore
          .collection('routes')
          .where(FieldPath.documentId, whereIn: matchingRouteIds.take(30).toList())
          .get();
      
      return routesSnapshot.docs.map((doc) => RouteModel.fromMap(doc.data(), id: doc.id)).toList();
    } catch (e) {
      print("Error searching routes via halts and direct match: $e");
      return [];
    }
  }

  // Get buses assigned to specific routes matching from and to for a specific date
  Future<List<Map<String, dynamic>>> getBusesForRoute(String from, String to, String date) async {
    try {
      final routes = await searchRoutes(from, to);
      if (routes.isEmpty) return [];

      final List<Map<String, dynamic>> allBuses = [];

      for (var route in routes) {
        // Try schedules collection first (if it exists)
        final scheduleSnapshot = await _firestore
            .collection('schedules')
            .where('routeId', isEqualTo: route.id)
            .where('date', isEqualTo: date)
            .get();

        if (scheduleSnapshot.docs.isNotEmpty) {
          // Schedules exist — use them to filter buses
          final scheduledBusIds = scheduleSnapshot.docs
              .map((doc) => doc.data()['busId']?.toString())
              .where((id) => id != null && id.isNotEmpty)
              .toSet();

          final busSnapshot = await _firestore
              .collection('buses')
              .where('routeId', isEqualTo: route.id)
              .get();

          for (var doc in busSnapshot.docs) {
            if (!scheduledBusIds.contains(doc.id)) continue;
            final data = doc.data();
            data['id'] = doc.id;
            data['routeId'] = route.id;
            data['routeName'] = route.routeName;
            data['price'] = route.price;

            final busSchedule = scheduleSnapshot.docs.firstWhere(
              (s) => s.data()['busId'] == doc.id,
              orElse: () => scheduleSnapshot.docs.first,
            );
            data['departureTime'] = busSchedule.data()['departureTime'] ?? route.departureTime ?? '';
            data['arrivalTime'] = busSchedule.data()['arrivalTime'] ?? route.arrivalTime ?? '';
            allBuses.add(data);
          }
        } else {
          // No schedules collection — fall back to showing all buses on this route
          final busSnapshot = await _firestore
              .collection('buses')
              .where('routeId', isEqualTo: route.id)
              .get();

          for (var doc in busSnapshot.docs) {
            final data = doc.data();
            data['id'] = doc.id;
            data['routeId'] = route.id;
            data['routeName'] = route.routeName;
            data['price'] = route.price;
            data['departureTime'] = route.departureTime ?? '';
            data['arrivalTime'] = route.arrivalTime ?? '';
            allBuses.add(data);
          }
        }
      }

      return allBuses;
    } catch (e) {
      print("Error fetching buses for route: $e");
      return [];
    }
  }

  // Fetch halts for a specific route
  Future<List<Map<String, dynamic>>> getHaltsForRoute(String routeId) async {
    try {
      final snapshot = await _firestore
          .collection('halts')
          .where('routeId', isEqualTo: routeId)
          .orderBy('order')
          .get();
      
      return snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return data;
      }).toList();
    } catch (e) {
      print("Error fetching halts for route: $e");
      return [];
    }
  }

  // Fetch all halts
  Future<List<Map<String, dynamic>>> getAllHalts() async {
    try {
      final snapshot = await _firestore.collection('halts').get();
      return snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return data;
      }).toList();
    } catch (e) {
      print("Error fetching all halts: $e");
      return [];
    }
  }

  // Get booked seats for a specific bus on a specific date
  Stream<List<int>> getBookedSeatsStream(String busId, String date) {
    return _firestore
        .collection('bookings')
        .where('busId', isEqualTo: busId)
        .where('date', isEqualTo: date)
        .snapshots()
        .map((snapshot) {
      List<int> bookedSeats = [];
      for (var doc in snapshot.docs) {
        final seats = doc.data()['selectedSeats'] as List<dynamic>?;
        if (seats != null) {
          bookedSeats.addAll(seats.cast<int>());
        }
      }
      return bookedSeats;
    });
  }

  // Get ALL scheduled buses for a specific date (no route filter)
  // Falls back to all buses if the 'schedules' collection doesn't exist yet
  Future<List<Map<String, dynamic>>> getAllBusesForDate(String date) async {
    try {
      final scheduleSnapshot = await _firestore
          .collection('schedules')
          .where('date', isEqualTo: date)
          .get();

      if (scheduleSnapshot.docs.isNotEmpty) {
        // ── Schedules collection exists — use it ──────────────────────────
        final List<Map<String, dynamic>> allBuses = [];

        for (var schedDoc in scheduleSnapshot.docs) {
          final schedData = schedDoc.data();
          final busId = schedData['busId']?.toString() ?? '';
          final routeId = schedData['routeId']?.toString() ?? '';
          if (busId.isEmpty) continue;

          final busDoc = await _firestore.collection('buses').doc(busId).get();
          if (!busDoc.exists) continue;

          final busData = busDoc.data() ?? {};
          busData['id'] = busId;
          busData['routeId'] = routeId;

          if (routeId.isNotEmpty) {
            final routeDoc =
                await _firestore.collection('routes').doc(routeId).get();
            if (routeDoc.exists) {
              final rd = routeDoc.data() ?? {};
              busData['routeName'] = rd['routeName'] ?? '';
              busData['startStop'] = rd['startStop'] ?? '';
              busData['endStop'] = rd['endStop'] ?? '';
              busData['price'] = rd['price']?.toString() ?? '';
            }
          }

          busData['departureTime'] = schedData['departureTime'] ?? '';
          busData['arrivalTime'] = schedData['arrivalTime'] ?? '';
          allBuses.add(busData);
        }
        return allBuses;
      }

      // ── No schedules collection — fall back to all buses linked to routes ──
      final busSnapshot = await _firestore.collection('buses').get();
      if (busSnapshot.docs.isEmpty) return [];

      final List<Map<String, dynamic>> allBuses = [];

      for (var busDoc in busSnapshot.docs) {
        final busData = busDoc.data();
        busData['id'] = busDoc.id;

        final routeId = busData['routeId']?.toString() ?? '';
        if (routeId.isNotEmpty) {
          final routeDoc =
              await _firestore.collection('routes').doc(routeId).get();
          if (routeDoc.exists) {
            final rd = routeDoc.data() ?? {};
            busData['routeName'] = rd['routeName'] ?? '';
            busData['startStop'] = rd['startStop'] ?? rd['startPoint'] ?? '';
            busData['endStop'] = rd['endStop'] ?? rd['endPoint'] ?? '';
            busData['price'] = rd['price']?.toString() ?? '';
            busData['departureTime'] = rd['departureTime'] ?? '';
            busData['arrivalTime'] = rd['arrivalTime'] ?? '';
          }
        }

        if ((busData['routeName'] ?? '').toString().isEmpty) continue;
        allBuses.add(busData);
      }

      return allBuses;
    } catch (e) {
      print("Error fetching all buses for date: $e");
      return [];
    }
  }

  // Book tickets
  Future<String> bookTickets({
    required String busId,
    required String from,
    required String to,
    required String date,
    required List<int> selectedSeats,
    required double totalAmount,
    required String passengerName,
    required String phone,
    required String nic,
    required String email,
  }) async {
    final docRef = await _firestore.collection('bookings').add({
      'busId': busId,
      'from': from,
      'to': to,
      'date': date,
      'selectedSeats': selectedSeats,
      'totalAmount': totalAmount,
      'passengerName': passengerName,
      'phone': phone,
      'nic': nic,
      'email': email,
      'status': 'confirmed',
      'createdAt': FieldValue.serverTimestamp(),
    });
    return docRef.id;
  }
}