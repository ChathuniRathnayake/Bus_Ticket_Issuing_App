import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/route_model.dart';

class PassengerDataService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Fetch all available bus stops
  Future<List<String>> getBusStops() async {
    try {
      final snapshot = await _firestore.collection('stops').get();
      if (snapshot.docs.isEmpty) {
        // Return some defaults if collection is empty, or just empty list
        return [];
      }
      return snapshot.docs.map((doc) => doc['name'] as String).toList();
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

  // Search routes based on from and to
  Future<List<RouteModel>> searchRoutes(String from, String to) async {
    try {
      final snapshot = await _firestore
          .collection('routes')
          .where('startStop', isEqualTo: from)
          .where('endStop', isEqualTo: to)
          .get();
      
      return snapshot.docs.map((doc) => RouteModel.fromMap(doc.data(), id: doc.id)).toList();
    } catch (e) {
      print("Error searching routes: $e");
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
        // Map to what the UI expects if needed, or just return raw data
        return data;
      }).toList();
    } catch (e) {
      print("Error fetching buses for route: $e");
      return [];
    }
  }
}