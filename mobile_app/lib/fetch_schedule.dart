import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/widgets.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  final db = FirebaseFirestore.instance;
  final snap = await db.collection('schedules').limit(1).get();
  if (snap.docs.isNotEmpty) {
    print("Schedule 1: " + snap.docs.first.data().toString());
  }
}
