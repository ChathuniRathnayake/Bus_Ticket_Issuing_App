import 'package:flutter/material.dart';
import 'package:mobile_app/conductor/info/info_card.dart';
import '../auth/conductor_login.dart';
import '../conductor_bottom_nav.dart';

class TripInfoScreen extends StatelessWidget {
  final String conductorId;

  const TripInfoScreen({super.key, required this.conductorId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1FAFB),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(kToolbarHeight),
        child: AppBar(
          automaticallyImplyLeading: false,
          flexibleSpace: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF1B56FD), Color(0xFF4993FA)],
              ),
            ),
          ),
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
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
                      conductorId,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              // Logout
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
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _tripHeader(),
              const SizedBox(height: 12), // slightly less than 16
              GridView.count(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                children: const [
                  InfoCard(
                    title: 'Cuurently\nNot Boarded',
                    count: 5,
                    icon: Icons.hourglass_bottom,
                    color: Colors.orange,
                  ),
                  InfoCard(
                    title: 'Dropping\nNext Stop',
                    count: 8,
                    icon: Icons.arrow_downward,
                    color: Colors.red,
                  ),
                  InfoCard(
                    title: 'Boarding\nNext Stop',
                    count: 12,
                    icon: Icons.arrow_upward,
                    color: Colors.blue,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: const ConductorBottomNav(),
    );
  }

  Widget _tripHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFA0E4F1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Route: Colombo → Kandy',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 4),
          Text('Bus ID: BUS-1024'),
          Text('Next Stop: Peradeniya'),
        ],
      ),
    );
  }
}
