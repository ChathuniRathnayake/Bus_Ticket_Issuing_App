import 'package:flutter/material.dart';
import 'package:mobile_app/conductor/seat_map/seat_map_screen.dart';
import '../../models/bus_model.dart';
import '../../models/conductor_model.dart';
import '../../models/route_model.dart';
import '../auth/conductor_login.dart';
import '../conductor_bottom_nav.dart'; // <- import your existing bottom nav

class IssueTicketScreen extends StatelessWidget {
  final int seatNo;
  final Bus? bus;
  final Conductor conductor;
  final RouteModel? route;

  const IssueTicketScreen({
    super.key,
    required this.seatNo,
    this.bus,
    required this.conductor,
    this.route,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1FAFB),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(kToolbarHeight),
        child: AppBar(
          automaticallyImplyLeading: false, // remove default back button
          flexibleSpace: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF1B56FD), // Bright blue
                  Color(0xFF4993FA), // Slightly lighter blue
                ],
              ),
            ),
          ),
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Back Button
              IconButton(
                icon: const Icon(
                  Icons.arrow_back,
                  color: Colors.white,
                  size: 28,
                ),
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => SeatMapScreen(
                        conductor: conductor,
                        bus: bus,
                        route: route,
                      ),
                    ),
                  );
                },
              ),

              // Conductor ID pill
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFF00ACC1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.person, size: 16, color: Colors.white),
                    const SizedBox(width: 4),
                    Text(
                      conductor.conductorId,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),

              // Logout Button
              IconButton(
                icon: const Icon(Icons.logout, color: Colors.white, size: 28),
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const ConductorLoginScreen(),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),

      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _infoCard("Bus ID", bus?.busId ?? "BUS-101"),
            _infoCard("Seat Number", seatNo.toString()),
            _infoCard("Passenger Type", "Adult"),
            _infoCard("Boarding Stop", "Kandy"),
            _infoCard("Drop Stop", "Colombo"),
            _infoCard("Ticket Price", "Rs. 350"),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4993FA),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Ticket Issued Successfully")),
                  );
                  // Go back to seat map after issuing
                  Navigator.pop(context);
                },
                child: const Text(
                  "ISSUE TICKET",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const ConductorBottomNav(), // <- use your bottom nav here
    );
  }

  Widget _infoCard(String title, String value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFA0E4F1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
          ),
          Text(
            value,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
