import 'package:flutter/material.dart';
import 'conductor/auth/conductor_login.dart'; // path to your login screen
import 'app/app_theme.dart';

void main() {
  runApp(MaterialApp(
    debugShowCheckedModeBanner: false,
    title: 'Conductor App',
    home: ConductorLoginScreen(),
    theme: AppTheme.lightTheme,
  ));
}
