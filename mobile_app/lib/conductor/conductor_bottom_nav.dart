import 'package:flutter/material.dart';
import 'package:mobile_app/conductor/info/trip_info_screen.dart';
import 'package:mobile_app/conductor/seat_map/seat_map_screen.dart';
import 'package:mobile_app/conductor/ticket/issue_ticket_screen.dart';
import 'dashboard/conductor_dashboard.dart';
import '../models/conductor_model.dart';
import '../models/bus_model.dart';
import '../models/route_model.dart';

class ConductorBottomNav extends StatefulWidget {
  const ConductorBottomNav({super.key});

  @override
  State<ConductorBottomNav> createState() => _ConductorBottomNavState();
}

class _ConductorBottomNavState extends State<ConductorBottomNav> {
  int _selectedIndex = 0;

  void _onItemTapped(int index) {
    if (_selectedIndex == index) return; // avoid reloading the same tab
    setState(() => _selectedIndex = index);

    Widget screen;

    // Dummy objects just for testing
    final dummyConductor = Conductor(
      id: "C001",
      userId: "TEST123",
      email: "test@company.com",
      name: "kamal",
      busId: "B001",
      routeId: "R001",
    );
    final dummyBus = Bus(
      id: "BUS-001",
      plateNumber: "ABC-1234",
      model: "Volvo",
      capacity: 50,
    );
    final dummyRoute = RouteModel(
      id: "R001",
      name: "Test Route",
      startPoint: "Origin",
      endPoint: "Destination",
      stops: ["Stop 1", "Stop 2", "Stop 3"],
    );

    switch (index) {
      case 0:
        screen = ConductorDashboard(
          conductor: dummyConductor,
          bus: dummyBus,
          route: dummyRoute,
        );
        break;
      case 1:
        screen = SeatMapScreen(
          conductor: dummyConductor,
          bus: dummyBus,
          route: dummyRoute,
        );
        break;
      case 2:
        // directly open the issue ticket screen with a placeholder seat
        screen = IssueTicketScreen(
          seatNo: 1,
          bus: dummyBus,
          conductor: dummyConductor,
          route: dummyRoute,
        );
        break;
      case 3:
        screen = TripInfoScreen(conductorId: dummyConductor.userId);
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
