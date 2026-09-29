import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import '../passenger_bottom_nav.dart';
import 'dashboard_screen.dart';
import 'profile_screen.dart';
import '../../widgets/passenger_app_bar.dart';

class MyTicketsScreen extends StatefulWidget {
  const MyTicketsScreen({super.key});

  @override
  State<MyTicketsScreen> createState() => _MyTicketsScreenState();
}

class _MyTicketsScreenState extends State<MyTicketsScreen>
    with SingleTickerProviderStateMixin {
  int _selectedIndex = 2;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Stream<List<QueryDocumentSnapshot>> _getUserTickets() {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null || user.email == null) {
      return const Stream.empty();
    }
    return FirebaseFirestore.instance
        .collection('bookings')
        .where('email', isEqualTo: user.email)
        .snapshots()
        .map((snap) {
      final docs = snap.docs.toList();
      docs.sort((a, b) {
        final aTime = (a.data()['createdAt'] as Timestamp?);
        final bTime = (b.data()['createdAt'] as Timestamp?);
        if (aTime == null) return 1;
        if (bTime == null) return -1;
        return bTime.compareTo(aTime);
      });
      return docs;
    });
  }

  @override
  Widget build(BuildContext context) {
    final today = DateTime.now();
    final todayStr =
        '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      appBar: const PassengerAppBar(title: 'My Tickets'),
      body: Column(
        children: [
          // Tab Bar
          Container(
            color: Colors.white,
            child: TabBar(
              controller: _tabController,
              indicatorColor: const Color(0xFF1B56FD),
              labelColor: const Color(0xFF1B56FD),
              unselectedLabelColor: Colors.grey,
              labelStyle: const TextStyle(fontWeight: FontWeight.bold),
              tabs: const [
                Tab(text: 'Upcoming'),
                Tab(text: 'History'),
              ],
            ),
          ),
          Expanded(
            child: StreamBuilder<List<QueryDocumentSnapshot>>(
              stream: _getUserTickets(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(
                      child: Text('Error: ${snapshot.error}'));
                }

                final all = snapshot.data ?? [];
                final upcoming = all.where((d) {
                  final date =
                      (d.data() as Map<String, dynamic>)['date'] as String? ??
                          '';
                  return date.compareTo(todayStr) >= 0;
                }).toList();
                final history = all.where((d) {
                  final date =
                      (d.data() as Map<String, dynamic>)['date'] as String? ??
                          '';
                  return date.compareTo(todayStr) < 0;
                }).toList();

                return TabBarView(
                  controller: _tabController,
                  children: [
                    _buildTicketList(upcoming, isUpcoming: true),
                    _buildTicketList(history, isUpcoming: false),
                  ],
                );
              },
            ),
          ),
        ],
      ),
      bottomNavigationBar: PassengerBottomNav(
        currentIndex: _selectedIndex,
        onTap: (index) {
          if (index == _selectedIndex) return;
          if (index == 0 || index == 1) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const PassengerDashboard()),
            );
          } else if (index == 3) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const ProfileScreen()),
            );
          }
        },
      ),
    );
  }

  Widget _buildTicketList(List<QueryDocumentSnapshot> docs,
      {required bool isUpcoming}) {
    if (docs.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isUpcoming
                  ? Icons.confirmation_num_outlined
                  : Icons.history_outlined,
              size: 64,
              color: Colors.grey[300],
            ),
            const SizedBox(height: 16),
            Text(
              isUpcoming ? 'No upcoming trips' : 'No past trips yet',
              style: const TextStyle(color: Colors.grey, fontSize: 16),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: docs.length,
      itemBuilder: (context, index) {
        final data = docs[index].data() as Map<String, dynamic>;
        final bookingId = docs[index].id;
        return _buildTicketCard(data, bookingId, isUpcoming: isUpcoming);
      },
    );
  }

  Widget _buildTicketCard(Map<String, dynamic> data, String bookingId,
      {required bool isUpcoming}) {
    final from = data['from'] ?? '';
    final to = data['to'] ?? '';
    final date = data['date'] ?? '';
    final seats = (data['selectedSeats'] as List?)?.join(', ') ?? '';
    final amount = (data['totalAmount'] ?? 0).toDouble();
    final name = data['passengerName'] ?? '';

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 3))
        ],
      ),
      child: Column(
        children: [
          // Top header strip
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: isUpcoming
                  ? const Color(0xFF1B56FD)
                  : Colors.grey.shade600,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'ID: ${bookingId.substring(0, bookingId.length > 8 ? 8 : bookingId.length)}...',
                  style: const TextStyle(
                      color: Colors.white70, fontSize: 12),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    isUpcoming ? 'UPCOMING' : 'COMPLETED',
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Route row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(from,
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 16)),
                          const Icon(Icons.arrow_downward,
                              size: 16, color: Colors.grey),
                          Text(to,
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 16)),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          'Rs. ${amount.toStringAsFixed(2)}',
                          style: const TextStyle(
                              color: Color(0xFF1B56FD),
                              fontWeight: FontWeight.bold,
                              fontSize: 18),
                        ),
                        Text(date,
                            style: const TextStyle(
                                color: Colors.grey, fontSize: 12)),
                      ],
                    ),
                  ],
                ),

                const Divider(height: 20),

                // Details row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _infoChip(Icons.person, name),
                    _infoChip(Icons.event_seat, 'Seats: $seats'),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoChip(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 14, color: Colors.grey),
        const SizedBox(width: 4),
        Text(text, style: const TextStyle(color: Colors.grey, fontSize: 12)),
      ],
    );
  }
}