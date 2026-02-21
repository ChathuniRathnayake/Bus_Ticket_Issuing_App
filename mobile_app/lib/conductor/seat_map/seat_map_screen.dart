import 'package:flutter/material.dart';
import 'package:mobile_app/conductor/auth/conductor_login.dart';
import 'seat_widget.dart';
import 'seat_status.dart';
import '../../models/bus_model.dart';
import '../../models/conductor_model.dart';
import '../../models/route_model.dart';
import '../ticket/issue_ticket_screen.dart';
import '../dashboard/conductor_dashboard.dart';
import '../../widgets/bottom_nav.dart'; // <- import your existing bottom nav

class SeatMapScreen extends StatefulWidget {
  final Bus? bus;
  final Conductor conductor;
  final RouteModel? route;

  const SeatMapScreen({
    super.key,
    required this.conductor,
    this.bus,
    this.route,
  });

  @override
  State<SeatMapScreen> createState() => _SeatMapScreenState();
}

class _SeatMapScreenState extends State<SeatMapScreen> {
  final int totalSeats = 42; // total number of seats

  @override
  Widget build(BuildContext context) {
    // Seat status: 0 = available, booked every 3rd seat
    final List<SeatStatus> seatStatuses = List.generate(totalSeats, (index) {
      return index % 3 == 0 ? SeatStatus.booked : SeatStatus.available;
    });

    return Scaffold(
      backgroundColor: const Color(0xFFF1FAFB),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(kToolbarHeight),
        child: AppBar(
          automaticallyImplyLeading: false,
          flexibleSpace: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF1B56FD),
                  Color(0xFF4993FA),
                ],
              ),
            ),
          ),
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Back Button
              IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white, size: 28),
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ConductorDashboard(
                        conductor: widget.conductor,
                        bus: widget.bus,
                        route: widget.route,
                      ),
                    ),
                  );
                },
              ),

              // Conductor ID pill
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF00ACC1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.person, size: 16, color: Colors.white),
                    const SizedBox(width: 4),
                    Text(
                      widget.conductor.conductorId,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),

              // Logout Button
              IconButton(
                icon: const Icon(Icons.logout, color: Colors.white, size: 28),
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (_) => const ConductorLoginScreen()),
                  );
                },
              ),
            ],
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _legend(),
            const SizedBox(height: 16),
            Expanded(
              child: GridView.builder(
                itemCount: 50, // 10 rows * 5 columns (2 + aisle + 2)
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 5,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                ),
                itemBuilder: (context, index) {
                  int col = index % 5;
                  int row = index ~/ 5;

                  // Middle column is aisle
                  if (col == 2) return const SizedBox.shrink();

                  // Seat numbering: row * 4 + col (skip aisle)
                  int seatNo = (row * 4) + (col > 2 ? col - 1 : col) + 1;

                  if (seatNo > totalSeats) return const SizedBox.shrink();

                  return GestureDetector(
                    onTap: seatStatuses[seatNo - 1] == SeatStatus.available
                        ? () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => IssueTicketScreen(
                                  bus: widget.bus,
                                  seatNo: seatNo,
                                  conductor: widget.conductor,
                                  route: widget.route,
                                ),
                              ),
                            );
                          }
                        : null,
                    child: SeatWidget(
                      seatNo: seatNo,
                      status: seatStatuses[seatNo - 1],
                      bus: widget.bus,
                      conductor: widget.conductor,
                      route: widget.route,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: AppBottomNav(),
    );
  }

  Widget _legend() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: const [
        _LegendItem(color: Colors.green, label: "Available"),
        _LegendItem(color: Colors.red, label: "Booked"),
      ],
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4)),
        ),
        const SizedBox(width: 6),
        Text(label),
      ],
    );
  }
}
