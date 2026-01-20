import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:mobile_app/models/bus_model.dart';
import 'package:mobile_app/models/conductor_model.dart';
import 'package:mobile_app/models/route_model.dart';

class ConductorAuthService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  /// Register a conductor (admin only)
  Future<bool> registerConductor(
      String conductorId, String password, String name) async {
    try {
      // Store conductor in Firestore with plain password
      await _db.collection('conductors').doc(conductorId).set({
        'conductorId': conductorId.trim(),
        'password': password.trim(), // plain password
        'busId': '',                 // default empty bus assignment
        'name': name.trim(),
      });

      return true;
    } catch (e) {
      print("Register error: $e");
      return false;
    }
  }

  /// Login using Firestore only (no Firebase Auth)
  Future<Map<String, dynamic>?> login(String conductorId, String password) async {
    try {
      // Fetch conductor document from Firestore
      final doc = await _db.collection('conductors').doc(conductorId.trim()).get();

      if (!doc.exists) {
        print("No conductor found with ID: $conductorId");
        return null;
      }

      final conductorData = doc.data()!;

      // Compare plain password
      if (conductorData['password'] != password.trim()) {
        print("Incorrect password for conductor: $conductorId");
        return null;
      }

      final conductor = Conductor.fromMap(conductorData);

      // Fetch bus info
      final busDoc = await _db.collection('buses').doc(conductor.busId).get();
      final bus = busDoc.exists ? Bus.fromMap(busDoc.data()!) : null;

      // Fetch route info
      final routeDoc = bus != null
          ? await _db.collection('routes').doc(bus.routeId).get()
          : null;
      final route = (routeDoc != null && routeDoc.exists)
          ? RouteModel.fromMap(routeDoc.data()!)
          : null;

      return {
        'conductor': conductor,
        'bus': bus,
        'route': route,
      };
    } catch (e) {
      print("Login error: $e");
      return null;
    }
  }
}
