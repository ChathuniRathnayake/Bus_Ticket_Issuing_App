import 'package:flutter/material.dart';
import '../dashboard/conductor_dashboard.dart';
import '../../widgets/custom_textfield.dart';
import '../../widgets/custom_button.dart';

class ConductorLoginScreen extends StatelessWidget {
  const ConductorLoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Extend body behind the app bar area for a seamless gradient
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          // 1. Background Gradient Layer
          Container(
            width: double.infinity,
            height: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                // Colors extracted from your Figma screenshot
                colors: [
                  Color(0xFF0118D8), // 5% stop
                  Color(0xFF1B56FD), // 12% stop
                  Color(0xFF60B5FF), // 34% stop
                  Color(0xFF70BDFF), // 37% stop
                  Colors.white,      // 51% & 52% stops
                ],
                stops: [0.05, 0.12, 0.34, 0.37, 0.51],
              ),
            ),
          ),

          // 2. Content Layer
          Column(
            children: [
              const SizedBox(height: 80),
              // Header Image/Logo
              Center(
                child: Image.asset(
                  'assets/images/logo.png', // Ensure this matches your logo in Figma
                  width: 150,
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                "Login as Conductor",
                style: TextStyle(
                  color: Colors.black,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 40),

              // 3. The White Login Card
              Expanded(
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 40),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(40),
                      topRight: Radius.circular(40),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 10,
                        offset: Offset(0, -5),
                      ),
                    ],
                  ),
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Login",
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1B56FD),
                          ),
                        ),
                        const SizedBox(height: 30),
                        
                        const Text("User ID", style: TextStyle(fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        const CustomTextField(hint: "User ID"),
                        
                        const SizedBox(height: 20),
                        
                        const Text("Password", style: TextStyle(fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        const CustomTextField(
                          hint: "Password",
                          obscure: true,
                        ),
                        
                        const SizedBox(height: 40),
                        
                        // Action Button
                        SizedBox(
                          width: double.infinity,
                          child: CustomButton(
                            text: "Login",
                            onTap: () {
                              Navigator.pushReplacement(
                                context,
                                MaterialPageRoute(builder: (_) => const ConductorDashboard()),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}