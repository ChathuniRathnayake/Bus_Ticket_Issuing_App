import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:mobile_app/conductor/auth/conductor_login.dart';
import 'package:mobile_app/models/bus_model.dart';
import 'package:mobile_app/models/conductor_model.dart';
import 'package:mobile_app/models/route_model.dart';
import '../../widgets/custom_button.dart';
import '../conductor_bottom_nav.dart';
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
      backgroundColor: Colors.white,
      // Gradient AppBar with Back, Conductor ID, and Logout
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(kToolbarHeight),
        child: AppBar(
          automaticallyImplyLeading: false,
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
        child: bus == null
            ? _buildStaticDashboard(context)
            : StreamBuilder<DocumentSnapshot>(
                stream: FirebaseFirestore.instance
                    .collection('buses')
                    .doc(bus!.id)
                    .snapshots(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  if (snapshot.hasError) {
                    return Center(child: Text('Error: ${snapshot.error}'));
                  }

                  Map<String, dynamic>? busData;
                  if (snapshot.hasData && snapshot.data!.exists) {
                    busData = snapshot.data!.data() as Map<String, dynamic>?;
                  }

                  return StreamBuilder<QuerySnapshot>(
                    stream: FirebaseFirestore.instance
                        .collection('seats')
                        .where('busId', isEqualTo: bus!.id)
                        .snapshots(),
                    builder: (context, seatsSnapshot) {
                      final bookedCount = seatsSnapshot.hasData ? seatsSnapshot.data!.docs.length : 0;
                      final total = bus?.totalSeats ?? int.tryParse(busData?['totalSeats']?.toString() ?? '0') ?? 40;
                      final availableCount = (total - bookedCount).clamp(0, total);

                      final currentLocation = busData?['currentLocation'] ?? "Unknown";
                      final availableSeats = availableCount.toString();
                      final bookedSeats = bookedCount.toString();

                      final String? activeRouteId = busData?['routeId'] ?? bus?.routeId ?? route?.id ?? conductor.routeId;

                      if (activeRouteId != null && activeRouteId.isNotEmpty) {
                        return StreamBuilder<QuerySnapshot>(
                          stream: FirebaseFirestore.instance
                              .collection('routes')
                              .where('routeId', isEqualTo: activeRouteId)
                              .limit(1)
                              .snapshots(),
                          builder: (context, routeSnapshot) {
                        String routeName = route?.routeName ?? "Unknown";
                        String nextStop = busData?['nextStop'] ??
                            (route?.stops?.isNotEmpty == true
                                ? route!.stops!.first
                                : route?.endStop ?? "Unknown");

                        if (routeSnapshot.hasData && routeSnapshot.data!.docs.isNotEmpty) {
                          final routeDoc = routeSnapshot.data!.docs.first;
                          final routeData = routeDoc.data() as Map<String, dynamic>?;
                          routeName = routeData?['routeName'] ?? 
                                      routeData?['routeId']?.toString() ?? 
                                      routeName;

                          if (busData?['nextStop'] == null) {
                            final List<dynamic>? stops = routeData?['stops'];
                            if (stops != null && stops.isNotEmpty) {
                              nextStop = stops.first.toString();
                            } else {
                              nextStop = routeData?['endStop'] ?? routeData?['endPoint'] ?? nextStop;
                            }
                          }
                        }

                        return _buildDashboardContent(
                          context: context,
                          currentLocation: currentLocation,
                          nextStop: nextStop,
                          availableSeats: availableSeats,
                          bookedSeats: bookedSeats,
                          routeName: routeName,
                          routeId: activeRouteId,
                        );
                      },
                    );
                  }

                  // Fallback if no route ID is found
                  final nextStop = busData?['nextStop'] ??
                      (route?.stops?.isNotEmpty == true
                          ? route!.stops!.first
                          : route?.endStop ?? "Unknown");
                  final routeName = route?.routeName ?? "Unknown";

                  return _buildDashboardContent(
                    context: context,
                    currentLocation: currentLocation,
                    nextStop: nextStop,
                    availableSeats: availableSeats,
                    bookedSeats: bookedSeats,
                    routeName: routeName,
                    routeId: activeRouteId ?? "Unknown",
                  );
                    },
                  );
                },
              ),
      ),
      // Bottom Navigation
      bottomNavigationBar: ConductorBottomNav(
        conductor: conductor,
        bus: bus,
        route: route,
        initialIndex: 0,
      ),
    );
  }

  Widget _buildStaticDashboard(BuildContext context) {
    return _buildDashboardContent(
      context: context,
      currentLocation: "Unknown",
      nextStop: route?.stops?.isNotEmpty == true
          ? route!.stops!.first
          : route?.endStop ?? "Unknown",
      availableSeats: "0",
      bookedSeats: "0",
      routeName: route?.routeName ?? "Unknown",
      routeId: route?.id ?? "Unknown",
    );
  }

  Widget _buildDashboardContent({
    required BuildContext context,
    required String currentLocation,
    required String nextStop,
    required String availableSeats,
    required String bookedSeats,
    required String routeName,
    required String routeId,
  }) {
    return Column(
      children: [
        const SizedBox(height: 12),
        // Dashboard title
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 4),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text(
              "Conductor Dashboard",
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
          ),
        ),
        const SizedBox(height: 10),

        // Main Content Area
        Expanded(
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: const BorderRadius.only(
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
                      "Bus ID": bus?.id ?? "Unknown",
                      "Route ID": routeId,
                      "Route Name": routeName,
                    },
                  ),
                  _buildInfoCard(
                    icon: Icons.location_on,
                    title: "Location Status",
                    details: {
                      "Current Location": currentLocation,
                      "Next Stop": nextStop,
                    },
                  ),
                  _buildInfoCard(
                    icon: Icons.airline_seat_recline_normal,
                    title: "Seat Availability",
                    details: {"Available": availableSeats, "Booked": bookedSeats},
                    isAvailability: true,
                  ),
                  const SizedBox(height: 20),
                  // Navigate to Seat Map
                  CustomButton(
                    text: "View Seat Map",
                    onTap: () {
                      Navigator.push(
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
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  // Info card helper
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
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF00ACC1).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: const Color(0xFF00ACC1), size: 20),
              ),
              const SizedBox(width: 12),
              Text(
                title,
                style: const TextStyle(
                  color: Colors.black87,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 15),
          ...details.entries.map(
            (entry) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    entry.key,
                    style: TextStyle(color: Colors.grey[600], fontSize: 14),
                  ),
                  Text(
                    entry.value,
                    style: TextStyle(
                      color: isAvailability
                          ? (entry.key == "Available"
                                ? Colors.green[700]
                                : Colors.red[700])
                          : Colors.black87,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
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
