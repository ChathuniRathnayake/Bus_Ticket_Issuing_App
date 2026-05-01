import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:mobile_app/conductor/auth/conductor_login.dart';
import 'package:mobile_app/models/bus_model.dart';
import 'package:mobile_app/models/conductor_model.dart';
import 'package:mobile_app/models/route_model.dart';
import 'package:mobile_app/core/services/location_service.dart';
import '../../widgets/custom_button.dart';
import '../conductor_bottom_nav.dart';
import '../seat_map/seat_map_screen.dart';

class ConductorDashboard extends StatefulWidget {
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
  State<ConductorDashboard> createState() => _ConductorDashboardState();
}

class _ConductorDashboardState extends State<ConductorDashboard> {
  final LocationService _locationService = LocationService();
  StreamSubscription? _locationSubscription;
  String _currentCoords = "Fetching GPS...";

  @override
  void initState() {
    super.initState();
    _startLocationTracking();
  }

  @override
  void dispose() {
    _locationSubscription?.cancel();
    super.dispose();
  }

  void _startLocationTracking() {
    _locationSubscription = _locationService.getLiveLocation().listen(
      (position) async {
        // Resolve coordinates to place name (e.g. Hapugala, Kandy)
        final placeName = await _locationService.getPlaceName(position.latitude, position.longitude);
        
        if (mounted) {
          setState(() {
            _currentCoords = placeName;
          });
        }
        
        // Update Firestore so passengers can track the bus
        if (widget.bus?.id != null) {
          FirebaseFirestore.instance
              .collection('buses')
              .doc(widget.bus!.id)
              .update({
            'currentLocation': placeName,
            'lastUpdated': FieldValue.serverTimestamp(),
          }).catchError((e) => print("Location Update Error: $e"));
        }
      },
      onError: (e) {
        if (mounted) {
          setState(() {
            _currentCoords = "GPS Error: $e";
          });
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
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
                  Color(0xFF1B56FD),
                  Color(0xFF4993FA),
                ],
              ),
            ),
          ),
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white, size: 28),
                onPressed: () {
                  if (Navigator.canPop(context)) Navigator.pop(context);
                },
              ),
              Expanded(
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
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
                          widget.conductor.name,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.logout, color: Colors.white, size: 28),
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
      ),
      body: SafeArea(
        child: widget.bus == null
            ? _buildStaticDashboard(context)
            : StreamBuilder<DocumentSnapshot>(
                stream: FirebaseFirestore.instance
                    .collection('buses')
                    .doc(widget.bus!.id)
                    .snapshots(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  Map<String, dynamic>? busData;
                  if (snapshot.hasData && snapshot.data!.exists) {
                    busData = snapshot.data!.data() as Map<String, dynamic>?;
                  }

                  return StreamBuilder<QuerySnapshot>(
                    stream: FirebaseFirestore.instance
                        .collection('seats')
                        .where('busId', isEqualTo: widget.bus!.id)
                        .snapshots(),
                    builder: (context, seatsSnapshot) {
                      final bookedCount = seatsSnapshot.hasData ? seatsSnapshot.data!.docs.length : 0;
                      final total = widget.bus?.totalSeats ?? int.tryParse(busData?['totalSeats']?.toString() ?? '0') ?? 40;
                      final availableCount = (total - bookedCount).clamp(0, total);

                      // Use live GPS coordinates as the primary location display
                      final locationDisplay = _currentCoords.startsWith("Fetching") 
                          ? (busData?['currentLocation'] ?? _currentCoords)
                          : _currentCoords;

                      final String? activeRouteId = busData?['routeId'] ?? widget.bus?.routeId ?? widget.route?.id ?? widget.conductor.routeId;

                      if (activeRouteId != null && activeRouteId.isNotEmpty) {
                        return StreamBuilder<QuerySnapshot>(
                          stream: FirebaseFirestore.instance
                              .collection('routes')
                              .where('routeId', isEqualTo: activeRouteId)
                              .limit(1)
                              .snapshots(),
                          builder: (context, routeSnapshot) {
                            String routeName = widget.route?.routeName ?? "Unknown";
                            String nextStop = busData?['nextStop'] ??
                                (widget.route?.stops?.isNotEmpty == true
                                    ? widget.route!.stops!.first
                                    : widget.route?.endStop ?? "Unknown");

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
                                }
                              }
                            }

                            return _buildDashboardContent(
                              context: context,
                              currentLocation: locationDisplay,
                              nextStop: nextStop,
                              availableSeats: availableCount.toString(),
                              bookedSeats: bookedCount.toString(),
                              routeName: routeName,
                              routeId: activeRouteId,
                            );
                          },
                        );
                      }

                      return _buildDashboardContent(
                        context: context,
                        currentLocation: locationDisplay,
                        nextStop: "Unknown",
                        availableSeats: availableCount.toString(),
                        bookedSeats: bookedCount.toString(),
                        routeName: widget.route?.routeName ?? "Unknown",
                        routeId: activeRouteId ?? "Unknown",
                      );
                    },
                  );
                },
              ),
      ),
      bottomNavigationBar: ConductorBottomNav(
        conductor: widget.conductor,
        bus: widget.bus,
        route: widget.route,
        initialIndex: 0,
      ),
    );
  }

  Widget _buildStaticDashboard(BuildContext context) {
    return _buildDashboardContent(
      context: context,
      currentLocation: _currentCoords,
      nextStop: widget.route?.stops?.isNotEmpty == true
          ? widget.route!.stops!.first
          : widget.route?.endStop ?? "Unknown",
      availableSeats: "0",
      bookedSeats: "0",
      routeName: widget.route?.routeName ?? "Unknown",
      routeId: widget.route?.id ?? "Unknown",
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
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 4),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text(
              "Dashboard",
              style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Color(0xFF1B56FD)),
            ),
          ),
        ),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              _infoCard("Bus ID", widget.bus?.id ?? "Unknown", Icons.directions_bus, const Color(0xFFE3F2FD)),
              _infoCard("Route", "$routeId - $routeName", Icons.route, const Color(0xFFE8F5E9)),
              
              // LIVE GPS LOCATION CARD
              _infoCard("Current Location", currentLocation, Icons.location_on, const Color(0xFFFFF3E0), isHighlight: true),
              
              _infoCard("Next Stop", nextStop, Icons.next_plan, const Color(0xFFF3E5F5)),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(child: _statusCard("Available Seats", availableSeats, const Color(0xFF4CAF50))),
                  const SizedBox(width: 16),
                  Expanded(child: _statusCard("Booked Seats", bookedSeats, const Color(0xFFF44336))),
                ],
              ),
              const SizedBox(height: 30),
              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => SeatMapScreen(
                          conductor: widget.conductor,
                          bus: widget.bus,
                          route: widget.route,
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.event_seat, color: Colors.white),
                  label: const Text("VIEW SEAT MAP", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1B56FD),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 4,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _infoCard(String title, String value, IconData icon, Color bgColor, {bool isHighlight = false}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: isHighlight ? Border.all(color: Colors.orange.withOpacity(0.5), width: 2) : null,
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        children: [
          Icon(icon, color: isHighlight ? Colors.orange : Colors.blue, size: 28),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(fontSize: 14, color: Colors.grey[700], fontWeight: FontWeight.w500)),
                const SizedBox(height: 4),
                Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _statusCard(String title, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(color: color.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        children: [
          Text(title, style: TextStyle(fontSize: 14, color: Colors.grey[600], fontWeight: FontWeight.w500)),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }
}
