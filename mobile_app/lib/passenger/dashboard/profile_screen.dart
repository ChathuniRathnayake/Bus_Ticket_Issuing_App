import 'package:flutter/material.dart';
import '../passenger_bottom_nav.dart';
import 'dashboard_screen.dart';
import 'my_tickets_screen.dart';
import '../auth/passenger_login.dart';
import '../../widgets/passenger_app_bar.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  int _selectedIndex = 3;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: const PassengerAppBar(title: 'Profile'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const CircleAvatar(
              radius: 50,
              backgroundColor: Colors.blue,
              child: Icon(Icons.person, size: 50, color: Colors.white),
            ),
            const SizedBox(height: 16),
            const Text(
              'Passenger Name',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const Text('passenger@example.com', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 32),
            _buildProfileItem(Icons.history, 'Trip History'),
            _buildProfileItem(Icons.payment, 'Payment Methods'),
            _buildProfileItem(Icons.settings, 'Settings'),
            _buildProfileItem(Icons.help_outline, 'Help & Support'),
          ],
        ),
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
          } else if (index == 2) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => const MyTicketsScreen()),
            );
          }
        },
      ),
    );
  }

  Widget _buildProfileItem(IconData icon, String title) {
    return ListTile(
      leading: Icon(icon, color: Colors.blue),
      title: Text(title),
      trailing: const Icon(Icons.chevron_right),
      onTap: () {},
    );
  }
}
