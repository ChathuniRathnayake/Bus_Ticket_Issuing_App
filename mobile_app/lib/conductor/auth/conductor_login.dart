import 'package:flutter/material.dart';
import 'package:mobile_app/core/services/conductor_auth_service.dart';
import 'package:mobile_app/models/bus_model.dart';
import 'package:mobile_app/models/conductor_model.dart';
import 'package:mobile_app/models/route_model.dart';
import '../dashboard/conductor_dashboard.dart';
import '../../widgets/custom_textfield.dart';
import '../../widgets/custom_button.dart';

class ConductorLoginScreen extends StatefulWidget {
  const ConductorLoginScreen({super.key});

  @override
  State<ConductorLoginScreen> createState() => _ConductorLoginScreenState();
}

class _ConductorLoginScreenState extends State<ConductorLoginScreen> {
  final TextEditingController userIdController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            stops: [0.05, 0.12, 0.34, 0.37, 0.51, 0.52],
            colors: [
              Color.fromARGB(254, 38, 57, 227),
              Color(0xFF1B56FD),
              Color(0xFF60B5FF),
              Color(0xFF70BDFF),
              Color(0xFFFFFFFF),
              Color(0xFFFFFFFF),
            ],
          ),
        ),
        child: Column(
          children: [
            const SizedBox(height: 100),
            Image.asset(
              'assets/images/logo.png',
              height: 120, // Adjusted for layout balance
              fit: BoxFit.contain,
            ),
            const SizedBox(height: 30),
            const Text(
              "Login as Conductor",
              style: TextStyle(
                fontSize: 30,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 40),
            // Updated Form Container to match the image
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(50),
                    topRight: Radius.circular(50),
                  ),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 35, vertical: 50),
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      
                      const SizedBox(height: 40),
                      const Text(
                        "User ID",
                        style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                      ),
                      const SizedBox(height: 10),
                      // Text field with light blue background from the image
                      Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFFA6E7F0), // Light blue background
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: CustomTextField(
                          controller: userIdController,
                          hint: "User ID",
                          // Ensure CustomTextField's decoration has no border/fill or matches this
                        ),
                      ),
                      const SizedBox(height: 25),
                      const Text(
                        "Password",
                        style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                      ),
                      const SizedBox(height: 10),
                      Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFFA6E7F0), // Light blue background
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: CustomTextField(
                          controller: passwordController,
                          hint: "Password",
                          obscure: true,
                        ),
                      ),
                      const SizedBox(height: 50),
                      _isLoading
                          ? const Center(child: CircularProgressIndicator())
                          : SizedBox(
                              width: double.infinity,
                              height: 55, // Set height to match design
                              child: CustomButton(
                                text: "Login",
                                onTap: _handleLogin,
                              ),
                            ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleLogin() async {
    setState(() => _isLoading = true);
    final authService = ConductorAuthService();
    final data = await authService.login(
      userIdController.text.trim(),
      passwordController.text.trim(),
    );

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (data != null) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => ConductorDashboard(
            conductor: data['conductor'] as Conductor,
            bus: data['bus'] as Bus?,
            route: data['route'] as RouteModel?,
          ),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Invalid UserID or Password"),
          behavior: SnackBarBehavior.floating,
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }
}