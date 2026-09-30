import 'package:flutter/material.dart';
import '../../widgets/custom_button.dart';
import '../passenger_bottom_nav.dart';
import '../auth/passenger_login.dart';
import 'seat_booking_screen.dart';
import '../../core/services/passenger_data_service.dart';
import '../../models/schedule_model.dart';
import 'dashboard_screen.dart';
import 'my_tickets_screen.dart';
import 'profile_screen.dart';
import '../../widgets/passenger_app_bar.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class BusDetailsScreen extends StatefulWidget {
  final ScheduleModel bus;
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
  int _selectedIndex = 1;
  final PassengerDataService _dataService = PassengerDataService();
  
  List<String> _uniqueStops = [];
  String? _selectedFrom;
  String? _selectedTo;
  
  bool _isLoadingRoute = true;
  String _currentLocation = "Not Available";
  String _nextStop = "Not Available";
  String _fullTicketPrice = "N/A";
  
  int _bookedSeatsCount = 0;
  bool _isLoadingSeats = true;
  int get _totalSeats => 40;

  @override
  void initState() {
    super.initState();
    _loadData();
    _loadSeatsCount();
  }

  Future<void> _loadSeatsCount() async {
    try {
      final snapshot = await FirebaseFirestore.instance
          .collection('bookings')
          .where('scheduleId', isEqualTo: widget.bus.id)
          .get();

      int count = 0;
      for (var doc in snapshot.docs) {
        final data = doc.data();
        if (data['selectedSeats'] != null) {
          final List<dynamic> seats = data['selectedSeats'];
          count += seats.length;
        }
      }

      if (mounted) {
        setState(() {
          _bookedSeatsCount = count;
          _isLoadingSeats = false;
        });
      }
    } catch (e) {
      print("Error loading seat count: $e");
      if (mounted) {
        setState(() {
          _isLoadingSeats = false;
        });
      }
    }
  }

  Future<void> _loadData() async {
    await _loadRouteDetails();
    _listenToBusLocation();
  }

  Future<void> _loadRouteDetails() async {
    final routeId = widget.bus.routeId;
    if (routeId.isEmpty) {
      setState(() => _isLoadingRoute = false);
      return;
    }

    try {
      final doc = await FirebaseFirestore.instance.collection('routes').doc(routeId).get();
      if (doc.exists) {
        final data = doc.data()!;
        List<String> stops = [];
        
        if (data['startStop'] != null) stops.add(data['startStop'].toString());
        if (data['stops'] != null) {
          for (var s in data['stops']) {
            if (s is String) stops.add(s);
            else if (s is Map && s['name'] != null) stops.add(s['name'].toString());
          }
        }
        if (data['endStop'] != null) stops.add(data['endStop'].toString());

        // Extract full price
        String price = data['price']?.toString() ?? "N/A";
        if (price == "N/A" && data['stopFareCents'] != null) {
           final fares = List<dynamic>.from(data['stopFareCents']);
           if (fares.isNotEmpty) {
             final maxFare = int.tryParse(fares.last.toString()) ?? 0;
             if (maxFare > 0) price = (maxFare / 100.0).toStringAsFixed(2);
           }
        }
        
        _uniqueStops = stops.toSet().toList();
        
        // Try to match initial selections
        if (_uniqueStops.contains(widget.from)) _selectedFrom = widget.from;
        if (_uniqueStops.contains(widget.to)) _selectedTo = widget.to;
        
        // Fallback
        if (_selectedFrom == null || _selectedFrom == "Not Selected") _selectedFrom = _uniqueStops.isNotEmpty ? _uniqueStops.first : null;
        if (_selectedTo == null || _selectedTo == "Not Selected") _selectedTo = _uniqueStops.isNotEmpty ? _uniqueStops.last : null;

        setState(() {
          _fullTicketPrice = price;
          _isLoadingRoute = false;
        });
      } else {
        setState(() => _isLoadingRoute = false);
      }
    } catch (e) {
      print("Error loading route details: $e");
      setState(() => _isLoadingRoute = false);
    }
  }

  void _listenToBusLocation() {
    final busId = widget.bus.busId;
    if (busId.isEmpty) return;

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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.bus.routeName ?? widget.bus.busModel ?? 'Unknown Route',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF333333),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.bus.busPlateNumber ?? widget.bus.busModel ?? '',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
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
                  _isLoadingRoute 
                    ? const Center(child: CircularProgressIndicator())
                    : Column(
                        children: [
                          _buildDropdownRow(Icons.location_on, 'From', _uniqueStops, _selectedFrom, Colors.green, (val) {
                            setState(() => _selectedFrom = val);
                          }),
                          const Padding(
                            padding: EdgeInsets.only(left: 36),
                            child: Divider(height: 24),
                          ),
                          _buildDropdownRow(Icons.flag, 'To', _uniqueStops, _selectedTo, Colors.red, (val) {
                            setState(() => _selectedTo = val);
                          }),
                        ],
                      ),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Divider(),
                  ),
                  _buildInfoRow('Current Location', _currentLocation),
                  const SizedBox(height: 8),
                  _buildInfoRow('Next Stop', _nextStop),
                  if (_uniqueStops.isNotEmpty) ...[
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      child: Divider(),
                    ),
                    const Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'All Route Stops',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildHaltsList(),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Seat Availability Card
            _buildSectionHeader('Seat Availability'),
            _isLoadingSeats 
              ? const Center(child: CircularProgressIndicator())
              : Row(
                  children: [
                    Expanded(
                      child: _buildAvailabilityCard(
                        Icons.event_seat,
                        'Available',
                        '${_totalSeats - _bookedSeatsCount}',
                        Colors.green,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildAvailabilityCard(
                        Icons.event_seat_outlined,
                        'Booked',
                        '$_bookedSeatsCount',
                        Colors.orange,
                      ),
                    ),
                  ],
                ),
            const SizedBox(height: 32),

            // Book a Seat Button
            CustomButton(
              text: 'Book Seats',
              onTap: () {
                if (_selectedFrom == null || _selectedTo == null) {
                   ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select From and To stops')));
                   return;
                }
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => SeatBookingScreen(
                      bus: widget.bus,
                      from: _selectedFrom!,
                      to: _selectedTo!,
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

  Widget _buildDropdownRow(IconData icon, String label, List<String> items, String? currentValue, Color iconColor, ValueChanged<String?> onChanged) {
    return Row(
      children: [
        Icon(icon, color: iconColor, size: 24),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
              DropdownButton<String>(
                isExpanded: true,
                value: currentValue,
                underline: const SizedBox(),
                hint: const Text("Select Stop", style: TextStyle(fontWeight: FontWeight.bold)),
                items: items.map((e) => DropdownMenuItem(value: e, child: Text(e, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)))).toList(),
                onChanged: onChanged,
              ),
            ],
          ),
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
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        children: _uniqueStops.asMap().entries.map((entry) {
          final index = entry.key;
          final stop = entry.value;
          final isNext = stop == _nextStop;
          
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Row(
              children: [
                Container(
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    color: isNext ? Colors.blue.withOpacity(0.2) : Colors.transparent,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Icon(
                      Icons.circle,
                      size: isNext ? 12 : 8,
                      color: isNext ? Colors.blue : Colors.grey[400],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    stop,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: isNext ? FontWeight.bold : FontWeight.normal,
                      color: isNext ? Colors.blue : Colors.black87,
                    ),
                  ),
                ),
                if (index == 0)
                  Text("Start", style: TextStyle(fontSize: 11, color: Colors.green[700], fontWeight: FontWeight.bold))
                else if (index == _uniqueStops.length - 1)
                  Text("End", style: TextStyle(fontSize: 11, color: Colors.red[700], fontWeight: FontWeight.bold))
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}