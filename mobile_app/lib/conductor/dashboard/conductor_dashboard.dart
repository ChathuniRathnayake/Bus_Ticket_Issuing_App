import 'package:flutter/material.dart';
import 'package:mobile_app/conductor/auth/conductor_login.dart';
import 'package:mobile_app/models/bus_model.dart';
import 'package:mobile_app/models/conductor_model.dart';
import 'package:mobile_app/models/route_model.dart';
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
      // Using the same blue gradient background as the login screen
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0118D8),
              Color(0xFF1B56FD),
              Color(0xFF60B5FF),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Custom Header with ID Badge and Logout
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Conductor ID Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF00ACC1), // Cyan from design
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.person, size: 16, color: Colors.white),
                          const SizedBox(width: 4),
                          Text(
                            conductor.conductorId,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                    // Back/Logout Button
                    IconButton(
                      icon: const Icon(Icons.logout, color: Colors.white),
                      onPressed: () {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (_) => const ConductorLoginScreen()),
                        );
                      },
                    ),
                  ],
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    "Conductor Dashboard",
                    style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              // Main Content Area with Dark Theme Cards
              Expanded(
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: const BoxDecoration(
                    color: Color(0xFF121212), // Dark background from dashboard screenshot
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(30),
                      topRight: Radius.circular(30),
                    ),
                  ),
                  child: SingleChildScrollView(
                    child: Column(
                      children: [
                        _buildInfoCard(
                          icon: Icons.directions_bus,
                          title: "Bus Information",
                          details: {
                            "Bus ID": bus?.busId ?? "BUS-101",
                            "Route": route?.name ?? "Downtown Express",
                          },
                        ),
                        _buildInfoCard(
                          icon: Icons.location_on,
                          title: "Location Status",
                          details: {
                            "Current Location": "Market Square",
                            "Next Stop": route?.nextStop ?? "University Campus",
                          },
                        ),
                        _buildInfoCard(
                          icon: Icons.airline_seat_recline_normal,
                          title: "Seat Availability",
                          details: {
                            "Available": "31",
                            "Booked": "9",
                          },
                          isAvailability: true,
                        ),
                        const SizedBox(height: 20),
                        CustomButton(
                          text: "View Seat Map",
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const SeatMapScreen()),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: const AppBottomNav(),
    );
  }

  // Helper to build the dark themed cards seen in your screenshot
  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required Map<String, String> details,
    bool isAvailability = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E), // Slightly lighter dark for cards
        borderRadius: BorderRadius.circular(15),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF00ACC1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: Colors.white, size: 20),
              ),
              const SizedBox(width: 12),
              Text(
                title,
                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 15),
          ...details.entries.map((entry) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(entry.key, style: const TextStyle(color: Colors.grey, fontSize: 14)),
                    Text(
                      entry.value,
                      style: TextStyle(
                        color: isAvailability 
                            ? (entry.key == "Available" ? Colors.green : Colors.redAccent)
                            : Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}