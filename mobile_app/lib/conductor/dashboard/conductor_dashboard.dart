import 'package:flutter/material.dart';
import '../../widgets/app_card.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/bottom_nav.dart';
import '../seat_map/seat_map_screen.dart';

class ConductorDashboard extends StatelessWidget {
  const ConductorDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1FAFB),
      appBar: AppBar(
        title: const Text("Dashboard"),
        backgroundColor: const Color(0xFF4993FA),
      ),
      bottomNavigationBar: const AppBottomNav(),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            AppCard(title: "Route", value: "Colombo - Kandy"),
            AppCard(title: "Bus ID", value: "NB-4523"),
            AppCard(title: "Next Stop", value: "Kurunegala"),
            AppCard(title: "Seats Available", value: "18"),

            const SizedBox(height: 20),

            CustomButton(
              text: "View Seat Map",
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => const SeatMapScreen()),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
