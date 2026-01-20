import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'conductor/auth/conductor_login.dart'; 
import 'app/app_theme.dart';
import 'firebase_options.dart';

/// Test Firestore connection
Future<void> testFirestoreConnection() async {
  try {
    final snapshot = await FirebaseFirestore.instance
        .collection('conductors')
        .get();
    print("Number of conductor docs: ${snapshot.docs.length}");
  } catch (e) {
    print("Firestore connection error: $e");
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

    // ✅ Call your test function here
  await testFirestoreConnection();
  runApp(MaterialApp(
    debugShowCheckedModeBanner: false,
    title: 'Conductor App',
    home: ConductorLoginScreen(),
    theme: AppTheme.lightTheme,
  ));
}
