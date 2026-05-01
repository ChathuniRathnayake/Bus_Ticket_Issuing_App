import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class PassengerAuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Register Passenger
  Future<UserCredential> registerPassenger({
    required String name,
    required String email,
    required String password,
  }) async {
    final credential = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );

    // Add user info in Firestore (users and passengers)
    final uid = credential.user!.uid;
    await _firestore.collection('users').doc(uid).set({
      'name': name,
      'email': email,
      'role': 'passenger',
      'createdAt': Timestamp.now(),
    });

    await _firestore.collection('passengers').doc(uid).set({
      'name': name,
      'email': email,
      'createdAt': Timestamp.now(),
    });

    // Update display name in Firebase Auth
    await credential.user!.updateDisplayName(name);

    // Send email verification
    await credential.user!.sendEmailVerification();

    return credential;
  }

  // Login Passenger
  Future<User?> loginPassenger({
    required String email,
    required String password,
    bool checkEmailVerified = true,
  }) async {
    final credential = await _auth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );

    final doc = await _firestore.collection('users').doc(credential.user!.uid).get();

    if (doc['role'] != 'passenger') {
      await _auth.signOut();
      throw Exception("Not authorized as passenger");
    }

    if (checkEmailVerified && !credential.user!.emailVerified) {
      throw Exception("Email not verified");
    }

    return credential.user;
  }

  // Logout
  Future<void> logout() async {
    await _auth.signOut();
  }

  // Send password reset email
  Future<void> sendPasswordResetEmail(String email) async {
    await _auth.sendPasswordResetEmail(email: email);
  }

  // Update password for logged-in user
  Future<void> updatePassword(String newPassword) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception("No logged in user");
    await user.updatePassword(newPassword);
  }

  // Verify OTP (dummy for now)
  Future<void> verifyOtp(String otp) async {
    if (otp != "123456") throw Exception("Invalid OTP");
  }

  // Resend email verification OTP
  Future<void> resendOtp() async {
    final user = _auth.currentUser;
    if (user == null) throw Exception("No logged in user");
    await user.sendEmailVerification();
  }
}