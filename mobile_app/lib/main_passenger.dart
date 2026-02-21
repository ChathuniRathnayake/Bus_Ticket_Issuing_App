import 'package:flutter/material.dart';
import 'passenger/onboarding/onboarding_screen.dart';
import 'app/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  runApp(MaterialApp(
    debugShowCheckedModeBanner: false,
    title: 'Passenger App',
    home: const OnboardingScreen(),
    theme: AppTheme.lightTheme,
  ));
}
