import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/conductor_model.dart';
import '../../models/bus_model.dart';
import '../../models/route_model.dart';

class ConductorAuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// Login with email and password
  Future<Map<String, dynamic>?> login(String email, String password) async {
    try {
      // Authenticate with Firebase Auth
      final credential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      final userId = credential.user!.uid;

      // Fetch conductor document from Firestore
      final doc = await _firestore.collection('conductors').doc(userId).get();
      if (!doc.exists) return null;

      final conductor = Conductor.fromMap(doc.data()!, id: doc.id);

      Bus? bus;
      RouteModel? route;

      // Fetch bus if linked
      if (conductor.busId != null) {
        final busDoc = await _firestore.collection('buses').doc(conductor.busId).get();
        if (busDoc.exists) bus = Bus.fromMap(busDoc.data()!, id: busDoc.id);
      }

      // Fetch route if linked
      if (conductor.routeId != null) {
        final routeDoc = await _firestore.collection('routes').doc(conductor.routeId).get();
        if (routeDoc.exists) route = RouteModel.fromMap(routeDoc.data()!, id: routeDoc.id);
      }

      return {
        'conductor': conductor,
        'bus': bus,
        'route': route,
      };
    } on FirebaseAuthException catch (e) {
      print('Auth Error: ${e.message}');
      return null;
    } catch (e) {
      print('Login Error: $e');
      return null;
    }
  }

  Future<void> logout() async {
    await _auth.signOut();
  }
}