import 'package:flutter/material.dart';
import '../../widgets/custom_button.dart';
import '../passenger_bottom_nav.dart';
import '../auth/passenger_login.dart';
import 'seat_booking_screen.dart';
import '../../core/services/passenger_data_service.dart';
import '../../models/halt_model.dart';
import 'dashboard_screen.dart';
import 'my_tickets_screen.dart';
import 'profile_screen.dart';
import '../../widgets/passenger_app_bar.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class BusDetailsScreen extends StatefulWidget {
  final Map<String, String> bus;
  final String from;
  final String to;
  final String date;

  const BusDetailsScreen({
    super.key,
    required this.bus,
    required this.from,
    required this.to,
    required this.date,
  });

  @override
  State<BusDetailsScreen> createState() => _BusDetailsScreenState();
}

class _BusDetailsScreenState extends State<BusDetailsScreen> {
  int _selectedIndex = 1; // Assuming 'Find' section is active
  final PassengerDataService _dataService = PassengerDataService();
  List<HaltModel> _halts = [];
  bool _isLoadingHalts = true;
  String _currentLocation = "Not Available";
  String _nextStop = "Not Available";

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await _loadHalts();
    _listenToBusLocation();
  }

  Future<void> _loadHalts() async {
    final routeId = widget.bus['routeId'];
    if (routeId == null || routeId.isEmpty) {
      setState(() => _isLoadingHalts = false);
      return;
    }

    try {
      final haltDatas = await _dataService.getHaltsForRoute(routeId);
      setState(() {
        _halts = haltDatas.map((data) => HaltModel.fromMap(data, id: data['id'])).toList();
        _isLoadingHalts = false;
        if (_halts.isNotEmpty) {
          _nextStop = _halts.first.name;
        }
      });
    } catch (e) {
      print("Error loading halts: $e");
      setState(() => _isLoadingHalts = false);
    }
  }

  void _listenToBusLocation() {
    final busId = widget.bus['id'];
    if (busId == null || busId.isEmpty) return;

    FirebaseFirestore.instance
        .collection('buses')
        .doc(busId)
        .snapshots()
        .listen((snapshot) {
      if (snapshot.exists) {
        final data = snapshot.data() as Map<String, dynamic>;
        if (mounted) {
          setState(() {
            _currentLocation = data['currentLocation'] ?? "Unknown";
            _nextStop = data['nextStop'] ?? _nextStop;
          });
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: const PassengerAppBar(
        title: 'Bus Details',
        showBackButton: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Bus Name and Status Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.bus['busName']!,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF333333),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      widget.bus['type']!,
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
                _buildTripStatus(true), // Mocking 'Departed' status
              ],
            ),
            const SizedBox(height: 24),

            // Route Information Card
            _buildSectionHeader('Route Information'),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Column(
                children: [
                  _buildRouteRow(Icons.location_on, 'From', widget.from, Colors.blue),
                  const Padding(
                    padding: EdgeInsets.only(left: 36),
                    child: Divider(height: 24),
                  ),
                  _buildRouteRow(Icons.flag, 'To', widget.to, Colors.red),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Divider(),
                  ),
                  _buildInfoRow('Current Location', _currentLocation),
                  const SizedBox(height: 8),
                  _buildInfoRow('Next Stop', _nextStop),
                  if (_halts.isNotEmpty) ...[
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      child: Divider(),
                    ),
                    const Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'Route Halts',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ),
                    const SizedBox(height: 8),
                    _buildHaltsList(),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Seat Availability Card
            _buildSectionHeader('Seat Availability'),
            Row(
              children: [
                Expanded(
                  child: _buildAvailabilityCard(
                    Icons.event_seat,
                    'Available',
                    '32',
                    Colors.green,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildAvailabilityCard(
                    Icons.event_seat_outlined,
                    'Booked',
                    '8',
                    Colors.orange,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),

            // Book a Seat Button
            CustomButton(
              text: 'Book a Seat',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => SeatBookingScreen(
                      bus: widget.bus,
                      from: widget.from,
                      to: widget.to,
                      date: widget.date,
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
      bottomNavigationBar: PassengerBottomNav(
        currentIndex: _selectedIndex,
        onTap: (index) {
          if (index == _selectedIndex) return;
          
          if (index == 0) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const PassengerDashboard()),
            );
          } else if (index == 2) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const MyTicketsScreen()),
            );
          } else if (index == 3) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const ProfileScreen()),
            );
          } else {
            setState(() {
              _selectedIndex = index;
            });
          }
        },
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Color(0xFF333333),
        ),
      ),
    );
  }

  Widget _buildTripStatus(bool isDeparted) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: isDeparted ? Colors.orange.withOpacity(0.1) : Colors.green.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDeparted ? Colors.orange : Colors.green,
          width: 1,
        ),
      ),
      child: Text(
        isDeparted ? 'Departed' : 'Not Departed',
        style: TextStyle(
          color: isDeparted ? Colors.orange[800] : Colors.green[800],
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }

  Widget _buildRouteRow(IconData icon, String label, String value, Color iconColor) {
    return Row(
      children: [
        Icon(icon, color: iconColor, size: 20),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
            Text(
              value,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(color: Colors.grey[600], fontSize: 14),
        ),
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
        ),
      ],
    );
  }

  Widget _buildAvailabilityCard(IconData icon, String label, String count, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            count,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            label,
            style: TextStyle(fontSize: 12, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }

  Widget _buildHaltsList() {
    return Column(
      children: _halts.map((halt) {
        final isNext = halt.name == _nextStop;
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(
            children: [
              Icon(
                Icons.circle,
                size: 8,
                color: isNext ? Colors.blue : Colors.grey[400],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  halt.name,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: isNext ? FontWeight.bold : FontWeight.normal,
                    color: isNext ? Colors.blue : Colors.black87,
                  ),
                ),
              ),
              if (halt.arrivalTime != null)
                Text(
                  halt.arrivalTime!,
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
