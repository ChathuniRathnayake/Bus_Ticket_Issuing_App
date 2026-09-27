import 'package:flutter/material.dart';

class CustomTextField extends StatefulWidget {
  final String hint;
  final String? label;
  final bool obscure;
  final TextEditingController? controller;
  final TextInputType? keyboardType;
  final IconData? prefixIcon;
  final String? Function(String?)? validator;

  const CustomTextField({
    super.key,
    required this.hint,
    this.label,
    this.obscure = false,
    this.controller,
    this.keyboardType,
    this.prefixIcon,
    this.validator,
  });

  @override
  State<CustomTextField> createState() => _CustomTextFieldState();
}

class _CustomTextFieldState extends State<CustomTextField> {
  bool _obscureText = true;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.label != null) ...[
          Text(
            widget.label!,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 10),
        ],

        TextFormField(
          controller: widget.controller,

          // Hide/show password
          obscureText: widget.obscure ? _obscureText : false,

          keyboardType: widget.keyboardType,
          validator: widget.validator,

          decoration: InputDecoration(
            hintText: widget.hint,

            prefixIcon: widget.prefixIcon != null
                ? Icon(
                    widget.prefixIcon,
                    color: const Color(0xFF4993FA),
                  )
                : null,

            // 👁 Show/Hide password button
            suffixIcon: widget.obscure
                ? Padding(
                    padding: const EdgeInsets.only(right: 8.0), // Adds the missing indentation
                    child: IconButton(
                      icon: Icon(
                        _obscureText
                            ? Icons.visibility_off
                            : Icons.visibility,
                        color: const Color(0xFF4993FA),
                      ),
                      onPressed: () {
                        setState(() {
                          _obscureText = !_obscureText;
                        });
                      },
                    ),
                  )
                : null,

            filled: true,
            fillColor: Colors.white,

            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(15),
              borderSide: const BorderSide(
                color: Color(0xFF4993FA),
                width: 1.5,
              ),
            ),

            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(15),
              borderSide: const BorderSide(
                color: Color(0xFF4993FA),
                width: 2.0,
              ),
            ),

            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(15),
            ),

            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 18,
            ),
          ),
        ),
      ],
    );
  }
}
