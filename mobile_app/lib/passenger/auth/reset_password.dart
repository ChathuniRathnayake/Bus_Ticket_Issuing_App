import 'package:flutter/material.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_textfield.dart';

class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController = TextEditingController();
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
            stops: [0.05, 0.12, 0.34, 0.37, 0.65, 0.66],
            colors: [
              Color(0xFF1B56FD),
              Color(0xFF1B56FD),
              Color(0xFF60B5FF),
              Color(0xFF70BDFF),
              Color(0xFFE3F2FD),
              Color(0xFFF5F7FB),
            ],
          ),
        ),
        child: Column(
          children: [
            const SizedBox(height: 50),
            const Icon(Icons.vpn_key, size: 80, color: Colors.white),
            const SizedBox(height: 10),
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
            const SizedBox(height: 10),
            const Text(
              "Reset Password",
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
                padding: const EdgeInsets.symmetric(horizontal: 35, vertical: 50),
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Enter your new password below",
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 30),
                      const Text(
                        "New Password",
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
                          hint: "New Password",
                          obscure: true,
                        ),
                      ),
                      const SizedBox(height: 25),
                      const Text(
                        "Confirm Password",
                        style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                      ),
                      const SizedBox(height: 10),
                      Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFFA6E7F0),
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: CustomTextField(
                          controller: confirmPasswordController,
                          hint: "Confirm Password",
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
                                text: "Reset Password",
                                onTap: () {
                                  // In a real app, update password logic here
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text("Password Reset Successful")),
                                  );
                                  // Pop until login screen
                                  Navigator.of(context).popUntil((route) => route.isFirst);
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
      ),
    );
  }
}
