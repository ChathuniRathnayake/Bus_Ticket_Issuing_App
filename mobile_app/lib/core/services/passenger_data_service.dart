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
      // 1. Get routeIds that pass through 'from'
      final fromSnapshot = await _firestore.collection('halts').where('name', isEqualTo: from).get();
      final fromRoutes = fromSnapshot.docs.map((doc) => {
        'routeId': (doc.data()['routeId'] ?? '').toString(),
        'order': int.tryParse(doc.data()['order']?.toString() ?? '0') ?? 0
      }).toList();

      // 2. Get routeIds that pass through 'to'
      final toSnapshot = await _firestore.collection('halts').where('name', isEqualTo: to).get();
      final toRoutes = toSnapshot.docs.map((doc) => {
        'routeId': (doc.data()['routeId'] ?? '').toString(),
        'order': int.tryParse(doc.data()['order']?.toString() ?? '0') ?? 0
      }).toList();

      // 3. Find matching routeIds where fromOrder < toOrder
      final matchingRouteIds = <String>[];
      for (var f in fromRoutes) {
        for (var t in toRoutes) {
          if (f['routeId'] == t['routeId'] && (f['order'] as int) < (t['order'] as int)) {
            matchingRouteIds.add(f['routeId'] as String);
          }
        }
      }

      if (matchingRouteIds.isEmpty) {
        // Fallback to legacy search in case halts are not populated for a route
        final snapshot = await _firestore
            .collection('routes')
            .where('startStop', isEqualTo: from)
            .where('endStop', isEqualTo: to)
            .get();
        return snapshot.docs.map((doc) => RouteModel.fromMap(doc.data(), id: doc.id)).toList();
      }

      // 4. Fetch the actual route documents
      // Note: whereIn is limited to 30 items
      final routesSnapshot = await _firestore
          .collection('routes')
          .where(FieldPath.documentId, whereIn: matchingRouteIds.take(30).toList())
          .get();
      
      return routesSnapshot.docs.map((doc) => RouteModel.fromMap(doc.data(), id: doc.id)).toList();
    } catch (e) {
      print("Error searching routes via halts: $e");
      return [];
    }
  }

  // Get buses assigned to a specific route
  Future<List<Map<String, dynamic>>> getBusesForRoute(String from, String to) async {
    try {
      // First find the route ID
      final routes = await searchRoutes(from, to);
      if (routes.isEmpty) return [];

      final routeId = routes.first.id;

      // Then find buses for that route
      final snapshot = await _firestore
          .collection('buses')
          .where('routeId', isEqualTo: routeId)
          .get();
      
      return snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        data['routeId'] = routeId; // Ensure routeId is included
        return data;
      }).toList();
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
}