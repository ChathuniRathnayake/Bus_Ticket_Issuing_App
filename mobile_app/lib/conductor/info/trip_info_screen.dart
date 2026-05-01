import 'package:flutter/material.dart';
import 'package:mobile_app/conductor/info/info_card.dart';
import '../auth/conductor_login.dart';
import '../conductor_bottom_nav.dart';

import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/bus_model.dart';
import '../../models/conductor_model.dart';
import '../../models/route_model.dart';

class TripInfoScreen extends StatelessWidget {
  final Conductor conductor;
  final Bus? bus;
  final RouteModel? route;

  const TripInfoScreen({
    super.key,
    required this.conductor,
    this.bus,
    this.route,
  });

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
              // Back Button
              IconButton(
                icon: const Icon(
                  Icons.arrow_back,
                  color: Colors.white,
                  size: 28,
                ),
                onPressed: () {
                  if (Navigator.canPop(context)) {
                    Navigator.pop(context);
                  }
                },
              ),

              // Conductor Name pill
              Expanded(
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 8),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF00ACC1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.person, size: 16, color: Colors.white),
                      const SizedBox(width: 4),
                      Flexible(
                        child: Text(
                          conductor.name,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
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
      body: SafeArea(
        child: StreamBuilder<DocumentSnapshot>(
          stream: FirebaseFirestore.instance.collection('buses').doc(bus?.id).snapshots(),
          builder: (context, busSnapshot) {
            final busData = busSnapshot.data?.data() as Map<String, dynamic>?;
            final nextStop = busData?['nextStop'] ?? "Unknown";

            return StreamBuilder<QuerySnapshot>(
              stream: FirebaseFirestore.instance.collection('seats').where('busId', isEqualTo: bus?.id).snapshots(),
              builder: (context, seatSnapshot) {
                int droppingNext = 0;
                int boardingNext = 0;
                int notBoarded = 0;

                if (seatSnapshot.hasData) {
                  for (var doc in seatSnapshot.data!.docs) {
                    final data = doc.data() as Map<String, dynamic>;
                    if (data['dropStop'] == nextStop) droppingNext++;
                    if (data['boardingStop'] == nextStop) boardingNext++;
                  }
                }

                return SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _tripHeader(route?.routeName ?? "Unknown", bus?.id ?? "Unknown", nextStop),
                      const SizedBox(height: 12),
                      GridView.count(
                        crossAxisCount: 2,
                        mainAxisSpacing: 12,
                        crossAxisSpacing: 12,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        children: [
                          InfoCard(
                            title: 'Currently\nNot Boarded',
                            count: notBoarded,
                            icon: Icons.hourglass_bottom,
                            color: Colors.orange,
                          ),
                          InfoCard(
                            title: 'Dropping\nNext Stop',
                            count: droppingNext,
                            icon: Icons.arrow_downward,
                            color: Colors.red,
                          ),
                          InfoCard(
                            title: 'Boarding\nNext Stop',
                            count: boardingNext,
                            icon: Icons.arrow_upward,
                            color: Colors.blue,
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            );
          },
        ),
      ),
      bottomNavigationBar: ConductorBottomNav(
        conductor: conductor,
        bus: bus,
        route: route,
        initialIndex: 3,
      ),
    );
  }

  Widget _tripHeader(String routeName, String busId, String nextStop) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFA0E4F1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Route: $routeName',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text('Bus ID: $busId'),
          Text('Next Stop: $nextStop'),
        ],
      ),
    );
  }
}
