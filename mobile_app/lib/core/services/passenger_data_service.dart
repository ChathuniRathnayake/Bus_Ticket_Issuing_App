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

  // Get buses assigned to specific routes matching from and to
  Future<List<Map<String, dynamic>>> getBusesForRoute(String from, String to) async {
    try {
      final routes = await searchRoutes(from, to);
      if (routes.isEmpty) return [];

      final List<Map<String, dynamic>> allBuses = [];

      for (var route in routes) {
        final snapshot = await _firestore
            .collection('buses')
            .where('routeId', isEqualTo: route.id)
            .get();
        
        for (var doc in snapshot.docs) {
          final data = doc.data();
          data['id'] = doc.id;
          data['routeId'] = route.id;
          data['routeName'] = route.routeName;
          data['price'] = route.price;
          allBuses.add(data);
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
}