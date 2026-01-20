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
      body: Stack(
        children: [
          Container(
            width: double.infinity,
            height: double.infinity,
            color: Colors.blue.shade50,
          ),
          Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CustomTextField(
                    controller: userIdController,
                    hint: "User ID",
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    controller: passwordController,
                    hint: "Password",
                    obscure: true,
                  ),
                  const SizedBox(height: 24),
                  _isLoading
                      ? const CircularProgressIndicator()
                      : CustomButton(
                          text: "Login",
                          onTap: () async {
                            setState(() => _isLoading = true);
                            final authService = ConductorAuthService();
                            final data = await authService.login(
                              userIdController.text.trim(),
                              passwordController.text.trim(),
                            );
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
                                ),
                              );
                            }
                          },
                        ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
