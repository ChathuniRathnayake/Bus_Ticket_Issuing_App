import 'package:flutter/material.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_textfield.dart';

class PassengerSignUpScreen extends StatefulWidget {
  const PassengerSignUpScreen({super.key});

  @override
  State<PassengerSignUpScreen> createState() => _PassengerSignUpScreenState();
}

class _PassengerSignUpScreenState extends State<PassengerSignUpScreen> {
  final TextEditingController nameController = TextEditingController();
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
            stops: [0.05, 0.12, 0.34, 0.37, 0.73, 0.74],
            colors: [
              Color(0xFF1B56FD),
              Color(0xFF1B56FD),
              Color(0xFF60B5FF),
              Color(0xFF70BDFF),
              Color(0xFFE3F2FD), // Light blue transition
              Color(0xFFF5F7FB), // Matches Scaffold background
            ],
          ),
        ),
        child: Column(
          children: [
            const SizedBox(height: 50),
            Row(
              children: [
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                ),
              ],
            ),
            Image.asset(
              'assets/images/bus1.png',
              height: 100, // Slightly smaller for signup layout
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) => const Icon(
                Icons.directions_bus,
                color: Colors.white,
                size: 60,
              ),
            ),
            const SizedBox(height: 8),
            Image.asset(
              'assets/images/logo.png',
              height: 100,
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) => const Text(
                "TicketGo",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 15),
            const Text(
              "Create Account",
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 30),
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
                padding: const EdgeInsets.symmetric(horizontal: 35, vertical: 40),
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Full Name",
                        style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                      ),
                      const SizedBox(height: 10),
                      Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFFA6E7F0),
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: CustomTextField(
                          controller: nameController,
                          hint: "Full Name",
                        ),
                      ),
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
                      const SizedBox(height: 20),
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
                      const SizedBox(height: 40),
                      _isLoading
                          ? const Center(child: CircularProgressIndicator())
                          : SizedBox(
                              width: double.infinity,
                              height: 55,
                              child: CustomButton(
                                text: "Sign Up",
                                onTap: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text("Account Created Simulated")),
                                  );
                                  Navigator.pop(context);
                                },
                              ),
                            ),
                      const SizedBox(height: 20),
                      Center(
                        child: TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text(
                            "Already have an account? Login",
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
