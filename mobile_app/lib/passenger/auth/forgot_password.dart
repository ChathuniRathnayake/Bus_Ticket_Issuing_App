import 'package:flutter/material.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_textfield.dart';
import '../../core/services/passenger_auth_service.dart';
import 'reset_password.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final emailController = TextEditingController();
  final PassengerAuthService _authService = PassengerAuthService();
  bool _isLoading = false;

  void _sendResetEmail() async {
    final email = emailController.text.trim();
    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Enter your email"), backgroundColor: Colors.red),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _authService.sendPasswordResetEmail(email);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Password reset email sent!")));
      Navigator.push(context, MaterialPageRoute(builder: (_) => const ResetPasswordScreen()));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: Colors.red));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      body: Column(
        children: [
          const SizedBox(height: 50),
          Row(children: [IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.arrow_back, color: Colors.white))]),
          const Icon(Icons.lock_reset, size: 80, color: Colors.white),
          const SizedBox(height: 10),
          Image.asset('assets/images/logo.png', height: 100, fit: BoxFit.contain),
          const SizedBox(height: 10),
          const Text("Forgot Password", style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 30),
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.only(topLeft: Radius.circular(50), topRight: Radius.circular(50))),
              padding: const EdgeInsets.symmetric(horizontal: 35, vertical: 50),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Enter your email to receive a verification code", style: TextStyle(fontSize: 16, color: Colors.grey)),
                    const SizedBox(height: 30),
                    const Text("Email", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                    const SizedBox(height: 10),
                    CustomTextField(controller: emailController, hint: "Email"),
                    const SizedBox(height: 40),
                    _isLoading
                        ? const Center(child: CircularProgressIndicator())
                        : SizedBox(width: double.infinity, height: 55, child: CustomButton(text: "Send Code", onTap: _sendResetEmail)),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}