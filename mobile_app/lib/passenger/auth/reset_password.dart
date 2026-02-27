import 'package:flutter/material.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_textfield.dart';
import '../../core/services/passenger_auth_service.dart';

class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final passwordController = TextEditingController();
  final confirmController = TextEditingController();
  final PassengerAuthService _authService = PassengerAuthService();
  bool _isLoading = false;

  void _resetPassword() async {
    final password = passwordController.text;
    final confirm = confirmController.text;

    if (password.isEmpty || confirm.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Enter both fields"), backgroundColor: Colors.red),
      );
      return;
    }

    if (password != confirm) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Passwords do not match"), backgroundColor: Colors.red),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _authService.updatePassword(password);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Password updated successfully")),
      );
      Navigator.of(context).popUntil((route) => route.isFirst);
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
          const Icon(Icons.vpn_key, size: 80, color: Colors.white),
          const SizedBox(height: 10),
          Image.asset('assets/images/logo.png', height: 100, fit: BoxFit.contain),
          const SizedBox(height: 10),
          const Text("Reset Password", style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white)),
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
                    const Text("Enter your new password below", style: TextStyle(fontSize: 16, color: Colors.grey)),
                    const SizedBox(height: 30),
                    const Text("New Password", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                    const SizedBox(height: 10),
                    CustomTextField(controller: passwordController, hint: "New Password", obscure: true),
                    const SizedBox(height: 25),
                    const Text("Confirm Password", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                    const SizedBox(height: 10),
                    CustomTextField(controller: confirmController, hint: "Confirm Password", obscure: true),
                    const SizedBox(height: 40),
                    _isLoading
                        ? const Center(child: CircularProgressIndicator())
                        : SizedBox(width: double.infinity, height: 55, child: CustomButton(text: "Reset Password", onTap: _resetPassword)),
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