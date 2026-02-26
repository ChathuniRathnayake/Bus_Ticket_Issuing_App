import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class PassengerAuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Register Passenger
  Future<UserCredential> registerPassenger({
    required String email,
    required String password,
  }) async {
    final credential = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );

    await _firestore.collection('users').doc(credential.user!.uid).set({
      'email': email,
      'role': 'passenger',
      'createdAt': Timestamp.now(),
    });

    return credential;
  }

  // Login Passenger
  Future<User?> loginPassenger({
    required String email,
    required String password,
  }) async {
    final credential = await _auth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );

    final doc = await _firestore
        .collection('users')
        .doc(credential.user!.uid)
        .get();

    if (doc['role'] != 'passenger') {
      await _auth.signOut();
      throw Exception("Not authorized as passenger");
    }

    return credential.user;
  }

  Future<void> logout() async {
    await _auth.signOut();
  }
}