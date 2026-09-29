import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../widgets/custom_button.dart';
import '../passenger_bottom_nav.dart';
import 'bus_results_screen.dart';
import '../../core/services/passenger_data_service.dart';
import '../../models/route_model.dart';
import 'my_tickets_screen.dart';
import 'profile_screen.dart';
import 'route_details_screen.dart';
import '../../widgets/passenger_app_bar.dart';

class PassengerDashboard extends StatefulWidget {
  const PassengerDashboard({super.key});

  @override
  State<PassengerDashboard> createState() => _PassengerDashboardState();
}

class _PassengerDashboardState extends State<PassengerDashboard>
    with SingleTickerProviderStateMixin {
  int _selectedIndex = 0; // 0=Home, 1=Find, 2=Tickets, 3=Profile

  // Find tab state
  DateTime? _selectedDate;
  String? _fromStop;
  String? _toStop;
  List<String> _busStops = [];

  final PassengerDataService _dataService = PassengerDataService();
  List<RouteModel> _popularRoutes = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final results = await Future.wait([
        _dataService.getPopularRoutes(),
        _dataService.getBusStops(),
      ]);
      if (!mounted) return;
      setState(() {
        _popularRoutes = results[0] as List<RouteModel>;
        _busStops = results[1] as List<String>;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2101),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() => _selectedDate = picked);
    }
  }

  void _onItemTapped(int index) {
    if (index == _selectedIndex) return;
    if (index == 2) {
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
      setState(() => _selectedIndex = index);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      appBar: const PassengerAppBar(title: 'TicketGo'),
      body: _selectedIndex == 0 ? _buildHomePage() : _buildFindPage(),
      bottomNavigationBar: PassengerBottomNav(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
      ),
    );
  }

  // ─── HOME PAGE ───────────────────────────────────────────────────────────────
  Widget _buildHomePage() {
    final user = FirebaseAuth.instance.currentUser;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1B56FD), Color(0xFF4993FA)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Welcome back! 👋',
                  style: TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                      fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 4),
                FutureBuilder<DocumentSnapshot>(
                  future: user != null
                      ? FirebaseFirestore.instance
                          .collection('passengers')
                          .doc(user.uid)
                          .get()
                      : null,
                  builder: (context, snapshot) {
                    final name =
                        snapshot.data?.get('name') as String? ?? 'Passenger';
                    return Text(
                      name,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.bold),
                    );
                  },
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: () => setState(() => _selectedIndex = 1),
                  icon: const Icon(Icons.search, size: 18),
                  label: const Text('Search Buses'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF1B56FD),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20)),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // ── Upcoming Booked Tickets ──
          const Text(
            'Your Upcoming Tickets',
            style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF333333)),
          ),
          const SizedBox(height: 12),
          _buildUpcomingTickets(user),

          const SizedBox(height: 24),

          // ── Available Routes ──
          const Text(
            'Available Routes',
            style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF333333)),
          ),
          const SizedBox(height: 12),
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _popularRoutes.isEmpty
                  ? const Center(child: Text("No routes available"))
                  : ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _popularRoutes.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final route = _popularRoutes[index];
                        return _buildRouteCard(route);
                      },
                    ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildUpcomingTickets(User? user) {
    if (user == null || user.email == null) {
      return const Center(child: Text('Login to see your tickets'));
    }
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance
          .collection('bookings')
          .where('email', isEqualTo: user.email)
          .snapshots(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        final docs = (snapshot.data?.docs ?? []).toList();
        // Only show upcoming (today or future) if date field exists
        final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
        final upcoming = docs.where((d) {
          final data = d.data() as Map<String, dynamic>;
          final date = data['date'] as String? ?? '';
          return date.compareTo(today) >= 0;
        }).toList();

        if (upcoming.isEmpty) {
          return Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.blue.withOpacity(0.2)),
            ),
            child: const Center(
              child: Column(
                children: [
                  Icon(Icons.confirmation_num_outlined,
                      size: 40, color: Colors.grey),
                  SizedBox(height: 8),
                  Text('No upcoming trips',
                      style: TextStyle(color: Colors.grey)),
                ],
              ),
            ),
          );
        }

        return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: upcoming.length > 3 ? 3 : upcoming.length,
          itemBuilder: (context, index) {
            final data = upcoming[index].data() as Map<String, dynamic>;
            return _buildTicketCard(data, upcoming[index].id);
          },
        );
      },
    );
  }

  Widget _buildTicketCard(Map<String, dynamic> data, String id) {
    final from = data['from'] ?? '';
    final to = data['to'] ?? '';
    final date = data['date'] ?? '';
    final seats = (data['selectedSeats'] as List?)?.join(', ') ?? '';
    final amount = (data['totalAmount'] ?? 0).toDouble();

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 3))
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFE8F0FE),
              borderRadius: BorderRadius.circular(10),
            ),
            child:
                const Icon(Icons.directions_bus, color: Color(0xFF1B56FD), size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('$from → $to',
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 4),
                Text('Date: $date  |  Seats: $seats',
                    style: TextStyle(color: Colors.grey[600], fontSize: 12)),
              ],
            ),
          ),
          Text('Rs. ${amount.toStringAsFixed(0)}',
              style: const TextStyle(
                  color: Color(0xFF1B56FD),
                  fontWeight: FontWeight.bold,
                  fontSize: 14)),
        ],
      ),
    );
  }

  Widget _buildRouteCard(RouteModel route) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 3))
        ],
      ),
      child: Row(
        children: [
          const Icon(Icons.route, color: Color(0xFF1B56FD), size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(route.routeName,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 15)),
                const SizedBox(height: 4),
                Text('${route.startStop} → ${route.endStop}',
                    style: TextStyle(color: Colors.grey[600], fontSize: 12)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(route.price ?? 'N/A',
                  style: const TextStyle(
                      color: Color(0xFF1B56FD),
                      fontWeight: FontWeight.bold,
                      fontSize: 15)),
              TextButton(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => RouteDetailsScreen(route: route)),
                ),
                style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                child: const Text('Details',
                    style: TextStyle(fontSize: 12, color: Color(0xFF1B56FD))),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ─── FIND PAGE ───────────────────────────────────────────────────────────────
  Widget _buildFindPage() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Find Your Bus',
            style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Color(0xFF333333)),
          ),
          const SizedBox(height: 4),
          const Text(
            'Select a date to see all schedules, or filter by route.',
            style: TextStyle(color: Colors.grey, fontSize: 13),
          ),
          const SizedBox(height: 16),
          Container(
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
                // Date picker (required)
                GestureDetector(
                  onTap: () => _selectDate(context),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: _selectedDate != null
                          ? const Color(0xFFE8F0FE)
                          : const Color(0xFFF0F7FF),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: _selectedDate != null
                              ? const Color(0xFF1B56FD).withOpacity(0.5)
                              : Colors.transparent),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today,
                            color: Color(0xFF1B56FD)),
                        const SizedBox(width: 12),
                        Text(
                          _selectedDate == null
                              ? 'Select Date *'
                              : DateFormat('EEE, dd MMM yyyy')
                                  .format(_selectedDate!),
                          style: TextStyle(
                            color: _selectedDate == null
                                ? Colors.grey
                                : const Color(0xFF1B56FD),
                            fontSize: 15,
                            fontWeight: _selectedDate != null
                                ? FontWeight.bold
                                : FontWeight.normal,
                          ),
                        ),
                        if (_selectedDate != null) ...[
                          const Spacer(),
                          GestureDetector(
                            onTap: () => setState(() => _selectedDate = null),
                            child: const Icon(Icons.close,
                                size: 18, color: Colors.grey),
                          )
                        ],
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // From / To filters
                _buildDropdown(
                  hint: 'From',
                  value: _busStops.contains(_fromStop) ? _fromStop : null,
                  stops: _busStops,
                  onChanged: (v) => setState(() => _fromStop = v),
                  onClear: _fromStop != null
                      ? () => setState(() => _fromStop = null)
                      : null,
                ),
                const SizedBox(height: 12),
                _buildDropdown(
                  hint: 'To',
                  value: _busStops.contains(_toStop) ? _toStop : null,
                  stops: _busStops,
                  onChanged: (v) => setState(() => _toStop = v),
                  onClear: _toStop != null
                      ? () => setState(() => _toStop = null)
                      : null,
                ),

                const SizedBox(height: 20),

                CustomButton(
                  text: 'Search Buses',
                  onTap: () {
                    if (_selectedDate == null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Please select a date first')),
                      );
                      return;
                    }
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => BusResultsScreen(
                          from: _fromStop ?? '',
                          to: _toStop ?? '',
                          date: DateFormat('yyyy-MM-dd').format(_selectedDate!),
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDropdown({
    required String hint,
    required String? value,
    required List<String> stops,
    required ValueChanged<String?> onChanged,
    VoidCallback? onClear,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFFF0F7FF),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: value != null
                ? const Color(0xFF1B56FD).withOpacity(0.4)
                : Colors.transparent),
      ),
      child: Row(
        children: [
          Expanded(
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: value,
                hint: Text(hint, style: const TextStyle(color: Colors.grey)),
                isExpanded: true,
                items: stops
                    .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                    .toList(),
                onChanged: onChanged,
              ),
            ),
          ),
          if (onClear != null)
            GestureDetector(
              onTap: onClear,
              child: const Icon(Icons.close, size: 18, color: Colors.grey),
            ),
        ],
      ),
    );
  }
}