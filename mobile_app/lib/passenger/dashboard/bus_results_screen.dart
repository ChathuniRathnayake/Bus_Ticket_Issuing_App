import 'package:flutter/material.dart';
import '../auth/passenger_login.dart';
import '../passenger_bottom_nav.dart';
import 'bus_details_screen.dart';
import '../../core/services/passenger_data_service.dart';
import '../../models/route_model.dart';
import '../../models/schedule_model.dart';
import 'dashboard_screen.dart';
import 'my_tickets_screen.dart';
import 'profile_screen.dart';
import '../../widgets/passenger_app_bar.dart';

class BusResultsScreen extends StatefulWidget {
  final String from;
  final String to;
  final String date;

  const BusResultsScreen({
    super.key,
    required this.from,
    required this.to,
    required this.date,
  });

  @override
  State<BusResultsScreen> createState() => _BusResultsScreenState();
}

class _BusResultsScreenState extends State<BusResultsScreen> {
  int _selectedIndex = 1; // "Find" tab active by default
  final PassengerDataService _dataService = PassengerDataService();
  List<ScheduleModel> _availableBuses = [];
  bool _isLoading = true;
  late String _queryDate;

  @override
  void initState() {
    super.initState();
    _queryDate = widget.date;
    if (_queryDate == "Today" || _queryDate.isEmpty) {
      final now = DateTime.now();
      _queryDate = "${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}";
    }
    _loadBuses();
  }

  Future<void> _loadBuses() async {
    try {
      final schedules = await _dataService.getSchedulesForRouteAndDate(widget.from, widget.to, _queryDate);

      setState(() {
        _availableBuses = schedules;
        _isLoading = false;
      });
    } catch (e) {
      print("Error loading buses: $e");
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {


    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: PassengerAppBar(
        title: '${widget.from} to ${widget.to}',
        showBackButton: true,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Row(
              children: [
                const Icon(Icons.calendar_today, size: 16, color: Colors.blue),
                const SizedBox(width: 8),
                Text(
                  'Date: $_queryDate',
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: _isLoading 
              ? const Center(child: CircularProgressIndicator())
              : _availableBuses.isEmpty
                ? const Center(child: Text("No buses available for this route"))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _availableBuses.length,
                    itemBuilder: (context, index) {
                      final bus = _availableBuses[index];
                      return _buildBusCard(context, bus);
                    },
                  ),
          ),
        ],
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
  Widget _buildBusCard(BuildContext context, ScheduleModel bus) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      bus.routeName ?? bus.busModel ?? 'Unknown Route',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF333333),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      bus.busPlateNumber ?? bus.busModel ?? '',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.access_time, size: 18, color: Colors.grey),
                  const SizedBox(width: 8),
                  Text(
                    bus.departureTime.isEmpty ? 'Scheduled' : bus.departureTime,
                    style: const TextStyle(
                      fontWeight: FontWeight.w500,
                      fontSize: 15,
                    ),
                  ),
                ],
              ),
              TextButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => BusDetailsScreen(
                        bus: bus,
                        from: widget.from,
                        to: widget.to,
                        date: _queryDate,
                      ),
                    ),
                  );
                },
                child: const Row(
                  children: [
                    Text(
                      'View Details',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.blue,
                      ),
                    ),
                    Icon(Icons.chevron_right, size: 18, color: Colors.blue),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}