import 'package:flutter/material.dart';
import 'conductor/auth/conductor_login.dart'; 
import 'app/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Run the app WITHOUT Firebase
  runApp(MaterialApp(
    debugShowCheckedModeBanner: false,
    title: 'Conductor App',
    home: ConductorLoginScreen(),
    theme: AppTheme.lightTheme,
  ));
}
