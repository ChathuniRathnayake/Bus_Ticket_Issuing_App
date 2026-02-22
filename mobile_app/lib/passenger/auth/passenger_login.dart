import 'package:flutter/material.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_textfield.dart';
import 'passenger_signup.dart';
import 'forgot_password.dart';

class PassengerLoginScreen extends StatefulWidget {
  const PassengerLoginScreen({super.key});

  @override
  State<PassengerLoginScreen> createState() => _PassengerLoginScreenState();
}

class _PassengerLoginScreenState extends State<PassengerLoginScreen> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final bool _isLoading = false;

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
              Color(0xFF1B56FD),
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
            const Icon(Icons.directions_bus, size: 80, color: Colors.white),
            const SizedBox(height: 10),
            const Text(
              "TicketGo",
              style: TextStyle(
                color: Colors.white,
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              "Login as Passenger",
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 40),
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
                      const SizedBox(height: 20),
                      const Text(
                        "Email",
                        style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                      ),
                      const SizedBox(height: 10),
                      Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFFA6E7F0),
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: CustomTextField(
                          controller: emailController,
                          hint: "Email",
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
                          color: const Color(0xFFA6E7F0),
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: CustomTextField(
                          controller: passwordController,
                          hint: "Password",
                          obscure: true,
                        ),
                      ),
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const ForgotPasswordScreen(),
                              ),
                            );
                          },
                          child: const Text(
                            "Forgot Password?",
                            style: TextStyle(color: Color(0xFF1B56FD)),
                          ),
                        ),
                      ),
                      const SizedBox(height: 30),
                      _isLoading
                          ? const Center(child: CircularProgressIndicator())
                          : SizedBox(
                              width: double.infinity,
                              height: 55,
                              child: CustomButton(
                                text: "Login",
                                onTap: () {
                                  // Mock login
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text("Passenger Login Simulated")),
                                  );
                                },
                              ),
                            ),
                      const SizedBox(height: 20),
                      Center(
                        child: TextButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const PassengerSignUpScreen()),
                            );
                          },
                          child: const Text(
                            "Don't have an account? Sign Up",
                            style: TextStyle(color: Color(0xFF1B56FD)),
                          ),
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
}
