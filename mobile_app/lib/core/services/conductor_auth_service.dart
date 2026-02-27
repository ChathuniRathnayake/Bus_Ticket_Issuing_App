import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:mobile_app/models/conductor_model.dart';
import 'package:mobile_app/models/bus_model.dart';
import 'package:mobile_app/models/route_model.dart';

class ConductorAuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// LOGIN CONDUCTOR
  Future<Map<String, dynamic>?> login(
      String userId, String password) async {
    try {
      // Sign in (userId must be email in Firebase)
      final credential = await _auth.signInWithEmailAndPassword(
        email: userId,
        password: password,
      );

      final uid = credential.user!.uid;

      // Verify role
      final userDoc =
          await _firestore.collection('users').doc(uid).get();

      if (!userDoc.exists || userDoc['role'] != 'conductor') {
        await _auth.signOut();
        return null;
      }

      // Get conductor document
      final conductorDoc =
          await _firestore.collection('conductors').doc(uid).get();

      if (!conductorDoc.exists) return null;

      final conductor =
          Conductor.fromMap(conductorDoc.data()!);

      // Get assigned bus (optional)
      Bus? bus;
      if (conductorDoc.data()!.containsKey('busId')) {
        final busDoc = await _firestore
            .collection('buses')
            .doc(conductorDoc['busId'])
            .get();

        if (busDoc.exists) {
          bus = Bus.fromMap(busDoc.data()!);
        }
      }

      // Get assigned route (optional)
      RouteModel? route;
      if (conductorDoc.data()!.containsKey('routeId')) {
        final routeDoc = await _firestore
            .collection('routes')
            .doc(conductorDoc['routeId'])
            .get();

        if (routeDoc.exists) {
          route = RouteModel.fromMap(routeDoc.data()!);
        }
      }

      return {
        'conductor': conductor,
        'bus': bus,
        'route': route,
      };
    } catch (e) {
      return null;
    }
  }

  /// REGISTER CONDUCTOR
  Future<UserCredential> registerConductor({
    required String email,
    required String password,
  }) async {
    final credential = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );

    final uid = credential.user!.uid;

    await _firestore.collection('users').doc(uid).set({
      'email': email,
      'role': 'conductor',
      'createdAt': Timestamp.now(),
    });

    await _firestore.collection('conductors').doc(uid).set({
      'email': email,
      'createdAt': Timestamp.now(),
    });

    return credential;
  }

  Future<void> logout() async {
    await _auth.signOut();
  }
}