import 'package:flutter/material.dart';
import 'package:mobile_app/models/bus_model.dart';
import 'package:mobile_app/models/conductor_model.dart';
import 'package:mobile_app/models/route_model.dart';
import '../../widgets/app_card.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/bottom_nav.dart';
import '../seat_map/seat_map_screen.dart';

class ConductorDashboard extends StatelessWidget {
  final Conductor conductor;
  final Bus? bus;
  final RouteModel? route;

  const ConductorDashboard({
    super.key,
    required this.conductor,
    this.bus,
    this.route,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Dashboard - ${conductor.conductorId}"),
      ),
      bottomNavigationBar: const AppBottomNav(),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            AppCard(title: "Route", value: route?.name ?? "N/A"),
            AppCard(title: "Bus ID", value: bus?.busId ?? "N/A"),
            AppCard(title: "Next Stop", value: route?.nextStop ?? "N/A"),
            AppCard(title: "Seats Available", value: bus?.totalSeats.toString() ?? "0"),
            const SizedBox(height: 20),
            CustomButton(
              text: "View Seat Map",
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => SeatMapScreen()),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
