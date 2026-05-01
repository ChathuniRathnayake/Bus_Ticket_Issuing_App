import 'package:flutter/material.dart';
import 'package:mobile_app/conductor/info/trip_info_screen.dart';
import 'package:mobile_app/conductor/seat_map/seat_map_screen.dart';
import 'package:mobile_app/conductor/ticket/issue_ticket_screen.dart';
import 'dashboard/conductor_dashboard.dart';
import '../models/conductor_model.dart';
import '../models/bus_model.dart';
import '../models/route_model.dart';

class ConductorBottomNav extends StatefulWidget {
  final Conductor conductor;
  final Bus? bus;
  final RouteModel? route;
  final int initialIndex;

  const ConductorBottomNav({
    super.key,
    required this.conductor,
    this.bus,
    this.route,
    this.initialIndex = 0,
  });

  @override
  State<ConductorBottomNav> createState() => _ConductorBottomNavState();
}

class _ConductorBottomNavState extends State<ConductorBottomNav> {
  late int _selectedIndex;

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.initialIndex;
  }

  void _onItemTapped(int index) {
    if (_selectedIndex == index) return; // avoid reloading the same tab
    setState(() => _selectedIndex = index);

    Widget screen;

    switch (index) {
      case 0:
        screen = ConductorDashboard(
          conductor: widget.conductor,
          bus: widget.bus,
          route: widget.route,
        );
        break;
      case 1:
        screen = SeatMapScreen(
          conductor: widget.conductor,
          bus: widget.bus,
          route: widget.route,
        );
        break;
      case 2:
        screen = IssueTicketScreen(
          seatNo: 1, // Default seat if navigating directly from navbar
          bus: widget.bus,
          conductor: widget.conductor,
          route: widget.route,
        );
        break;
      case 3:
        screen = TripInfoScreen(
          conductor: widget.conductor,
          bus: widget.bus,
          route: widget.route,
        );
        break;
      default:
        return;
    }

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => screen),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: _selectedIndex,
      onTap: _onItemTapped,
      type: BottomNavigationBarType.fixed,
      backgroundColor: const Color(0xFF121212),
      selectedItemColor: const Color(0xFF4993FA),
      unselectedItemColor: Colors.grey,
      showSelectedLabels: true,
      showUnselectedLabels: true,
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
        BottomNavigationBarItem(
          icon: Icon(Icons.event_seat),
          label: 'Seat Map',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.confirmation_num),
          label: 'Issue Ticket',
        ),
        BottomNavigationBarItem(icon: Icon(Icons.info), label: 'Trip Info'),
      ],
    );
  }
}
