import 'package:flutter/material.dart';
import '../passenger_bottom_nav.dart';
import 'bus_details_screen.dart';
import '../../core/services/passenger_data_service.dart';
import 'dashboard_screen.dart';
import 'my_tickets_screen.dart';
import 'profile_screen.dart';
import '../../widgets/passenger_app_bar.dart';

class BusResultsScreen extends StatefulWidget {
  final String from; // empty = date-only search
  final String to;   // empty = date-only search
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
  int _selectedIndex = 1;
  final PassengerDataService _dataService = PassengerDataService();
  List<Map<String, String>> _availableBuses = [];
  bool _isLoading = true;

  bool get _isDateOnly => widget.from.isEmpty && widget.to.isEmpty;

  @override
  void initState() {
    super.initState();
    _loadBuses();
  }

  Future<void> _loadBuses() async {
    try {
      List<Map<String, dynamic>> buses;

      if (_isDateOnly) {
        buses = await _dataService.getAllBusesForDate(widget.date);
      } else {
        buses = await _dataService.getBusesForRoute(
            widget.from, widget.to, widget.date);
      }

      setState(() {
        _availableBuses = buses.map((bus) {
          final dep = bus['departureTime']?.toString() ?? '';
          final arr = bus['arrivalTime']?.toString() ?? '';
          final time = dep.isNotEmpty && arr.isNotEmpty
              ? '$dep – $arr'
              : dep.isNotEmpty
                  ? dep
                  : 'Scheduled';

          return <String, String>{
            'busName': (bus['routeName'] ?? bus['model'] ?? 'Unknown Route')
                .toString(),
            'from': (bus['startStop'] ?? widget.from).toString(),
            'to': (bus['endStop'] ?? widget.to).toString(),
            'time': time,
            'price': (bus['price'] ?? 'N/A').toString(),
            'type': (bus['plateNumber'] ?? bus['model'] ?? '').toString(),
            'id': (bus['id'] ?? '').toString(),
            'routeId': (bus['routeId'] ?? '').toString(),
          };
        }).toList();
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error loading buses: $e');
      setState(() => _isLoading = false);
    }
  }

  String get _appBarTitle {
    if (_isDateOnly) return 'All Buses';
    return '${widget.from} → ${widget.to}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: PassengerAppBar(
          title: _appBarTitle, showBackButton: true, showTitle: true),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: Colors.white,
            child: Row(
              children: [
                const Icon(Icons.calendar_today, size: 16, color: Colors.blue),
                const SizedBox(width: 8),
                Text('Date: ${widget.date}',
                    style: const TextStyle(fontWeight: FontWeight.w500)),
                if (!_isDateOnly) ...[
                  const Spacer(),
                  const Icon(Icons.route, size: 16, color: Colors.blue),
                  const SizedBox(width: 6),
                  Text('${widget.from} → ${widget.to}',
                      style: const TextStyle(fontWeight: FontWeight.w500)),
                ],
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _availableBuses.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.directions_bus,
                                size: 64, color: Colors.grey),
                            const SizedBox(height: 12),
                            Text(
                              _isDateOnly
                                  ? 'No buses scheduled for this date'
                                  : 'No buses available for this route',
                              style: const TextStyle(
                                  color: Colors.grey, fontSize: 16),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _availableBuses.length,
                        itemBuilder: (context, index) =>
                            _buildBusCard(_availableBuses[index]),
                      ),
          ),
        ],
      ),
      bottomNavigationBar: PassengerBottomNav(
        currentIndex: _selectedIndex,
        onTap: (index) {
          if (index == _selectedIndex) return;
          if (index == 0) {
            Navigator.pushReplacement(context,
                MaterialPageRoute(builder: (_) => const PassengerDashboard()));
          } else if (index == 2) {
            Navigator.pushReplacement(context,
                MaterialPageRoute(builder: (_) => const MyTicketsScreen()));
          } else if (index == 3) {
            Navigator.pushReplacement(context,
                MaterialPageRoute(builder: (_) => const ProfileScreen()));
          } else {
            setState(() => _selectedIndex = index);
          }
        },
      ),
    );
  }

  Widget _buildBusCard(Map<String, String> bus) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 5))
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
                    Text(bus['busName']!,
                        style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF333333))),
                    const SizedBox(height: 2),
                    Text(
                      _isDateOnly
                          ? '${bus['from']} → ${bus['to']}'
                          : bus['type']!,
                      style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
              Text(bus['price']!,
                  style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue)),
            ],
          ),
          const Divider(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.access_time, size: 16, color: Colors.grey),
                  const SizedBox(width: 6),
                  Text(bus['time']!,
                      style: const TextStyle(
                          fontWeight: FontWeight.w500, fontSize: 14)),
                ],
              ),
              TextButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => BusDetailsScreen(
                        bus: bus,
                        from: bus['from'] ?? widget.from,
                        to: bus['to'] ?? widget.to,
                        date: widget.date,
                      ),
                    ),
                  );
                },
                icon: const Icon(Icons.chevron_right,
                    size: 18, color: Colors.blue),
                label: const Text('View Details',
                    style: TextStyle(
                        fontWeight: FontWeight.bold, color: Colors.blue)),
                style:
                    TextButton.styleFrom(padding: EdgeInsets.zero),
              ),
            ],
          ),
        ],
      ),
    );
  }
}