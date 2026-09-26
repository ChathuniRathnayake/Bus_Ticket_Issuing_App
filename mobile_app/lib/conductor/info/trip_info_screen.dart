import 'package:flutter/material.dart';

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
          stream: FirebaseFirestore.instance
              .collection('buses')
              .doc(bus?.id)
              .snapshots(),
          builder: (context, busSnapshot) {
            final busData =
                busSnapshot.data?.data() as Map<String, dynamic>?;

            // Total seats: prefer local model, then Firestore, then default 40
            final total =
                bus?.totalSeats ??
                int.tryParse(busData?['totalSeats']?.toString() ?? '0') ??
                40;

            return StreamBuilder<QuerySnapshot>(
              stream: FirebaseFirestore.instance
                  .collection('seats')
                  .where('busId', isEqualTo: bus?.id)
                  .snapshots(),
              builder: (context, seatSnapshot) {
                int bookedCount = 0;

                if (seatSnapshot.hasData) {
                  for (var doc in seatSnapshot.data!.docs) {
                    final data = doc.data() as Map<String, dynamic>;
                    final status =
                        data['status']?.toString().toLowerCase();

                    // Only count active (non-cancelled/released) seats
                    final isActive =
                        status == null ||
                        (status != 'cancelled' && status != 'released');

                    if (isActive) bookedCount++;
                  }
                }

                final availableCount =
                    (total - bookedCount).clamp(0, total);

                return SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _tripHeader(
                        route?.routeName ?? "Unknown",
                        bus?.id ?? "Unknown",
                      ),
                      const SizedBox(height: 16),

                      // -- Seat Summary Row --
                      Row(
                        children: [
                          Expanded(
                            child: _seatSummaryCard(
                              title: 'Available\nSeats',
                              count: availableCount,
                              color: Colors.green,
                              icon: Icons.event_seat,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _seatSummaryCard(
                              title: 'Booked\nSeats',
                              count: bookedCount,
                              color: Colors.red,
                              icon: Icons.airline_seat_recline_normal,
                            ),
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

  Widget _tripHeader(String routeName, String busId) {
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
        ],
      ),
    );
  }

  /// A wide horizontal card used for the seat-count summary at the top.
  Widget _seatSummaryCard({
    required String title,
    required int count,
    required Color color,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.35)),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.12),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, size: 30, color: color),
          const SizedBox(height: 8),
          Text(
            count.toString(),
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Colors.grey[700],
            ),
          ),
        ],
      ),
    );
  }
}
