import 'package:flutter/material.dart';

class PassengerBottomNav extends StatefulWidget {
  final int currentIndex;
  final Function(int) onTap;

  const PassengerBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  State<PassengerBottomNav> createState() => _PassengerBottomNavState();
}

class _PassengerBottomNavState extends State<PassengerBottomNav> {
  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: widget.currentIndex,
      onTap: widget.onTap,
      type: BottomNavigationBarType.fixed,
      backgroundColor: const Color(0xFF121212),
      selectedItemColor: const Color(0xFF4993FA),
      unselectedItemColor: Colors.grey,
      showSelectedLabels: true,
      showUnselectedLabels: true,
      items: const [
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Home',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.search),
          label: 'Find',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.confirmation_num),
          label: 'My Tickets',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person),
          label: 'Profile',
        ),
      ],
    );
  }
}
