import 'package:flutter/material.dart';

class CustomTextField extends StatelessWidget {
  final String hint;
  final bool obscure;
  final TextEditingController? controller; // Added controller

  const CustomTextField({
    super.key,
    required this.hint,
    this.obscure = false,
    this.controller, // Accept controller as optional
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller, // Use the controller here
      obscureText: obscure,
      decoration: InputDecoration(
        hintText: hint,
        filled: true,
        fillColor: const Color(0xFFA0E4F1), // light accent
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
      ),
    );
  }
}
