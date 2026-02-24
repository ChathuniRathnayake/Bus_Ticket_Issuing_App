import 'package:flutter/material.dart';
import '../auth/passenger_login.dart';
import '../passenger_bottom_nav.dart';
import 'bus_details_screen.dart';

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

  @override
  Widget build(BuildContext context) {
    // Mock data for display
    final List<Map<String, String>> availableBuses = [
      {
        'busName': 'Express Line 502',
        'time': '08:30 AM',
        'price': 'Rs. 450.00',
        'type': 'Luxury A/C',
      },
      {
        'busName': 'Intercity 104',
        'time': '10:15 AM',
        'price': 'Rs. 380.00',
        'type': 'Semi-Luxury',
      },
      {
        'busName': 'Super Line 205',
        'time': '01:45 PM',
        'price': 'Rs. 500.00',
        'type': 'Luxury A/C',
      },
      {
        'busName': 'Night Express 301',
        'time': '08:00 PM',
        'price': 'Rs. 650.00',
        'type': 'Super Luxury',
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          '${widget.from} to ${widget.to}',
          style: const TextStyle(color: Colors.black, fontSize: 18),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.red),
            onPressed: () {
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const PassengerLoginScreen()),
                (route) => false,
              );
            },
          ),
        ],
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
                  'Date: ${widget.date}',
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: availableBuses.length,
              itemBuilder: (context, index) {
                final bus = availableBuses[index];
                return _buildBusCard(context, bus);
              },
            ),
          ),
        ],
      ),
      bottomNavigationBar: PassengerBottomNav(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
      ),
    );
  }

  Widget _buildBusCard(BuildContext context, Map<String, String> bus) {
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    bus['busName']!,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF333333),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    bus['type']!,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
              Text(
                bus['price']!,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue,
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
                    bus['time']!,
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
                        date: widget.date,
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
