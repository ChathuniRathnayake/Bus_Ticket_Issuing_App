import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/route_model.dart';
import '../../models/schedule_model.dart';

class PassengerDataService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Fetch all available bus stops as a stream from routes
  Stream<List<String>> getBusStopsStream() {
    return _firestore.collection('routes').snapshots().map((snapshot) {
      if (snapshot.docs.isEmpty) return [];
      
      final Set<String> stopNames = {};
      
      for (var doc in snapshot.docs) {
        final data = doc.data();
        
        // Add start and end stops
        if (data['startStop'] != null && data['startStop'].toString().isNotEmpty) {
          stopNames.add(data['startStop'].toString());
        }
        if (data['startPoint'] != null && data['startPoint'].toString().isNotEmpty) {
          stopNames.add(data['startPoint'].toString());
        }
        if (data['endStop'] != null && data['endStop'].toString().isNotEmpty) {
          stopNames.add(data['endStop'].toString());
        }
        if (data['endPoint'] != null && data['endPoint'].toString().isNotEmpty) {
          stopNames.add(data['endPoint'].toString());
        }
        
        // Add intermediate stops if they exist
        if (data['stops'] != null && data['stops'] is List) {
          for (var stop in data['stops']) {
            if (stop is String && stop.isNotEmpty) {
              stopNames.add(stop);
            } else if (stop is Map && stop['name'] != null && stop['name'].toString().isNotEmpty) {
              stopNames.add(stop['name'].toString());
            }
          }
        }
      }
      
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

  // Fetch upcoming available schedules for the home page (up to 10)
  Future<List<ScheduleModel>> getAvailableSchedules() async {
    try {
      final now = DateTime.now();
      final dateStr = "${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}";
      
      final snapshot = await _firestore
          .collection('schedules')
          .where('date', isGreaterThanOrEqualTo: dateStr)
          .orderBy('date')
          .limit(20) // Fetch some extra to account for filtering
          .get();
          
      final List<ScheduleModel> result = [];
      
      for (var doc in snapshot.docs) {
        final data = doc.data();
        
        // Skip past schedules if it's today
        if (data['date'] == dateStr && data['departureTime'] != null) {
          final timeParts = data['departureTime'].toString().split(':');
          if (timeParts.length >= 2) {
            final scheduleTime = DateTime(
              now.year, now.month, now.day, 
              int.parse(timeParts[0]), 
              int.parse(timeParts[1])
            );
            if (scheduleTime.isBefore(now)) continue;
          }
        }
        
        String routeName = "Unknown Route";
        String startStop = "";
        String endStop = "";
        String busPlateNumber = "";
        String busModel = "";
        String price = "N/A";

        // Fetch Route details
        if (data['routeId'] != null) {
          final routeDoc = await _firestore.collection('routes').doc(data['routeId']).get();
          if (routeDoc.exists) {
            final routeData = routeDoc.data()!;
            routeName = routeData['routeName'] ?? routeName;
            startStop = routeData['startStop'] ?? startStop;
            endStop = routeData['endStop'] ?? endStop;
            price = routeData['price']?.toString() ?? price;
          }
        }

        // Fetch Bus details
        if (data['busId'] != null) {
          final busDoc = await _firestore.collection('buses').doc(data['busId']).get();
          if (busDoc.exists) {
            final busData = busDoc.data()!;
            busPlateNumber = busData['plateNumber'] ?? busPlateNumber;
            busModel = busData['model'] ?? busModel;
          }
        }

        result.add(ScheduleModel(
          id: doc.id,
          routeId: data['routeId'] ?? '',
          busId: data['busId'] ?? '',
          date: data['date'] ?? '',
          departureTime: data['departureTime'] ?? '',
          status: data['status'] ?? 'active',
          routeName: routeName,
          startStop: startStop,
          endStop: endStop,
          busPlateNumber: busPlateNumber,
          busModel: busModel,
          price: price,
        ));
        
        if (result.length >= 10) break;
      }
      
      return result;
    } catch (e) {
      print("Error fetching available schedules: $e");
      return [];
    }
  }

  // Search routes based on from and to halts
  Future<List<RouteModel>> searchRoutes(String from, String to) async {
    try {
      final Set<String> matchingRouteIds = {};

      if (from == "Not Selected" && to == "Not Selected") {
        // Return all routes
        final snapshot = await _firestore.collection('routes').get();
        return snapshot.docs.map((doc) => RouteModel.fromMap(doc.data(), id: doc.id)).toList();
      }

      if (from != "Not Selected" && to != "Not Selected") {
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
        final fromSnapshot = await _firestore.collection('halts').where('name', isEqualTo: from).get();
        final fromRoutes = fromSnapshot.docs.map((doc) => {
          'routeId': (doc.data()['routeId'] ?? '').toString(),
          'order': int.tryParse(doc.data()['order']?.toString() ?? '0') ?? 0
        }).toList();

        final toSnapshot = await _firestore.collection('halts').where('name', isEqualTo: to).get();
        final toRoutes = toSnapshot.docs.map((doc) => {
          'routeId': (doc.data()['routeId'] ?? '').toString(),
          'order': int.tryParse(doc.data()['order']?.toString() ?? '0') ?? 0
        }).toList();

        for (var f in fromRoutes) {
          for (var t in toRoutes) {
            if (f['routeId'] == t['routeId'] && (f['order'] as int) < (t['order'] as int)) {
              matchingRouteIds.add(f['routeId'] as String);
            }
          }
        }
      } else if (from != "Not Selected") {
        // Match only from
        final directMatchSnapshot = await _firestore
            .collection('routes')
            .where('startStop', isEqualTo: from)
            .get();
        for (var doc in directMatchSnapshot.docs) {
          matchingRouteIds.add(doc.id);
        }
        final fromSnapshot = await _firestore.collection('halts').where('name', isEqualTo: from).get();
        for (var doc in fromSnapshot.docs) {
          matchingRouteIds.add((doc.data()['routeId'] ?? '').toString());
        }
      } else if (to != "Not Selected") {
        // Match only to
        final directMatchSnapshot = await _firestore
            .collection('routes')
            .where('endStop', isEqualTo: to)
            .get();
        for (var doc in directMatchSnapshot.docs) {
          matchingRouteIds.add(doc.id);
        }
        final toSnapshot = await _firestore.collection('halts').where('name', isEqualTo: to).get();
        for (var doc in toSnapshot.docs) {
          matchingRouteIds.add((doc.data()['routeId'] ?? '').toString());
        }
      }

      matchingRouteIds.removeWhere((id) => id.isEmpty);

      if (matchingRouteIds.isEmpty) return [];

      // 3. Fetch the actual route documents in batches of 30 due to whereIn limits
      final List<RouteModel> allMatchedRoutes = [];
      final List<String> routeIdList = matchingRouteIds.toList();
      
      for (var i = 0; i < routeIdList.length; i += 30) {
        final batch = routeIdList.skip(i).take(30).toList();
        final routesSnapshot = await _firestore
            .collection('routes')
            .where(FieldPath.documentId, whereIn: batch)
            .get();
        allMatchedRoutes.addAll(routesSnapshot.docs.map((doc) => RouteModel.fromMap(doc.data(), id: doc.id)));
      }
      
      return allMatchedRoutes;
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
          .get();
      
      final halts = snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return data;
      }).toList();

      // Sort locally to avoid Firestore composite index requirement
      halts.sort((a, b) => (a['order'] ?? 0).compareTo(b['order'] ?? 0));

      return halts;
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

  // Fetch schedules for a specific route and date
  Future<List<ScheduleModel>> getSchedulesForRouteAndDate(String from, String to, String date) async {
    try {
      // 1. Fetch all schedules for the given date
      final schedulesSnapshot = await _firestore
          .collection('schedules')
          .where('date', isEqualTo: date)
          .get();

      if (schedulesSnapshot.docs.isEmpty) return [];

      final List<ScheduleModel> allSchedules = [];

      // 2. Process each schedule
      for (var doc in schedulesSnapshot.docs) {
        final data = doc.data();
        final routeId = data['routeId'];
        if (routeId == null) continue;

        // Fetch route details
        final routeDoc = await _firestore.collection('routes').doc(routeId).get();
        if (!routeDoc.exists) continue;
        
        final routeData = routeDoc.data()!;
        final startStop = routeData['startStop'] ?? routeData['startPoint'] ?? '';
        final endStop = routeData['endStop'] ?? routeData['endPoint'] ?? '';
        final stops = routeData['stops'] != null ? List<dynamic>.from(routeData['stops']) : [];

        // 3. Filter by 'from' and 'to'
        bool matchesFrom = from == "Not Selected";
        bool matchesTo = to == "Not Selected";

        if (!matchesFrom) {
          if (startStop == from) matchesFrom = true;
          else if (stops.any((stop) => (stop is Map ? stop['name'] : stop) == from)) matchesFrom = true;
        }

        if (!matchesTo) {
          if (endStop == to) matchesTo = true;
          else if (stops.any((stop) => (stop is Map ? stop['name'] : stop) == to)) matchesTo = true;
        }

        // If it doesn't match both, skip this schedule
        if (!matchesFrom || !matchesTo) continue;

        data['scheduleId'] = doc.id;
        data['routeId'] = routeId;
        data['routeName'] = routeData['routeName'] ?? routeData['name'] ?? '';
        data['price'] = routeData['price'];
        
        // Fetch bus details for the schedule
        if (data['busId'] != null) {
          final busDoc = await _firestore.collection('buses').doc(data['busId']).get();
          if (busDoc.exists) {
            final busData = busDoc.data();
            if (busData != null) {
              data['busModel'] = busData['model'];
              data['busPlateNumber'] = busData['plateNumber'];
              data['totalSeats'] = busData['totalSeats'];
              data['busStatus'] = busData['status'];
              
              // Only add if bus is active
              if (busData['status'] == 'Active') {
                allSchedules.add(ScheduleModel.fromMap(data, id: doc.id));
              }
            }
          } else {
             // Fallback if bus doesn't exist
             allSchedules.add(ScheduleModel.fromMap(data, id: doc.id));
          }
        } else {
          allSchedules.add(ScheduleModel.fromMap(data, id: doc.id));
        }
      }
      
      // Sort schedules by departure time
      allSchedules.sort((a, b) {
        final timeA = a.departureTime.isEmpty ? '00:00' : a.departureTime;
        final timeB = b.departureTime.isEmpty ? '00:00' : b.departureTime;
        return timeA.compareTo(timeB);
      });
      
      return allSchedules;
    } catch (e) {
      print("Error fetching schedules for route and date: $e");
      return [];
    }
  }
}