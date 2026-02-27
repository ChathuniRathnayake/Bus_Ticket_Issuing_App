import 'package:flutter/material.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_textfield.dart';
import '../../core/services/passenger_auth_service.dart';
import 'reset_password.dart';

class VerifyAccountScreen extends StatefulWidget {
  const VerifyAccountScreen({super.key});

  @override
  State<VerifyAccountScreen> createState() => _VerifyAccountScreenState();
}

class _VerifyAccountScreenState extends State<VerifyAccountScreen> {
  final otpController = TextEditingController();
  final PassengerAuthService _authService = PassengerAuthService();
  bool _isLoading = false;

  void _verifyOtp() async {
    final otp = otpController.text.trim();
    if (otp.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter OTP"), backgroundColor: Colors.red),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _authService.verifyOtp(otp);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("OTP verified!")));
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const ResetPasswordScreen()));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: Colors.red));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _resendOtp() async {
    setState(() => _isLoading = true);
    try {
      await _authService.resendOtp();
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("OTP resent successfully!")));
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
          const Icon(Icons.verified_user, size: 80, color: Colors.white),
          const SizedBox(height: 10),
          Image.asset('assets/images/logo.png', height: 100, fit: BoxFit.contain),
          const SizedBox(height: 10),
          const Text("Verify Account", style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white)),
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
                    const Text("Enter the 6-digit code sent to your email", style: TextStyle(fontSize: 16, color: Colors.grey)),
                    const SizedBox(height: 30),
                    const Text("Verification Code", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                    const SizedBox(height: 10),
                    CustomTextField(controller: otpController, hint: "Enter Code", keyboardType: TextInputType.number),
                    const SizedBox(height: 40),
                    _isLoading
                        ? const Center(child: CircularProgressIndicator())
                        : SizedBox(width: double.infinity, height: 55, child: CustomButton(text: "Verify", onTap: _verifyOtp)),
                    const SizedBox(height: 20),
                    Center(
                      child: TextButton(onPressed: _resendOtp, child: const Text("Didn't receive code? Resend", style: TextStyle(color: Color(0xFF1B56FD)))),
                    ),
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