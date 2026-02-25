import 'package:flutter/material.dart';
import 'conductor/onboarding/onboarding_screen.dart'; 
import 'app/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Run the app WITHOUT Firebase
  runApp(MaterialApp(
    debugShowCheckedModeBanner: false,
    title: 'Conductor App',
    home: const ConductorOnboardingScreen(),
    theme: AppTheme.lightTheme,
  ));
}
