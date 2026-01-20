import 'package:flutter/material.dart';
import 'package:mobile_app/conductor/auth/conductor_login.dart';
import 'app_theme.dart';
class BusApp extends StatelessWidget {
  const BusApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: AppTheme.lightTheme,
      home: ConductorLoginScreen(),
    );
  }
}
