import 'package:flutter/material.dart';
import 'package:mobile_app/models/bus_model.dart';
import 'package:mobile_app/models/conductor_model.dart';
import 'package:mobile_app/models/route_model.dart';
import 'package:mobile_app/core/models/seat_status.dart';
import 'package:mobile_app/conductor/conductor_bottom_nav.dart';
import 'seat_widget.dart';

class SeatMapScreen extends StatelessWidget {
  final Conductor conductor;
  final Bus? bus;
  final RouteModel? route;

  const SeatMapScreen({
    super.key,
    required this.conductor,
    this.bus,
    this.route,
  });

  @override
  Widget build(BuildContext context) {
    // Total seats in bus
    final int totalSeats = 42;
    final List<SeatStatus> seatStatuses = List.generate(totalSeats, (index) {
      if (index % 7 == 0) return SeatStatus.booked;
      if (index % 5 == 0) return SeatStatus.droppingNext;
      return SeatStatus.available;
    });

    return Scaffold(
      backgroundColor: const Color(0xFFF1FAFB),
      appBar: AppBar(
        title: const Text('Seat Map'),
        backgroundColor: const Color(0xFF4993FA),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _legend(),
            const SizedBox(height: 16),
            Expanded(
              child: LayoutBuilder(builder: (context, constraints) {
                final seatWidth = (constraints.maxWidth - 32) / 5; // 5 columns width
                return SingleChildScrollView(
                  child: Column(
                    children: List.generate(8, (rowIndex) {
                      // Last row is 5 seats
                      if (rowIndex == 7) {
                        return Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: List.generate(5, (i) {
                            final seatNo = 36 + i + 1;
                            return SizedBox(
                              width: seatWidth - 8,
                              height: 55,
                              child: SeatWidget(
                                seatNo: seatNo,
                                status: seatStatuses[seatNo - 1],
                                bus: bus,
                                conductor: conductor,
                                route: route,
                              ),
                            );
                          }),
                        );
                      }

                      // Other rows: 2 left + 2 right
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            // Left 2 seats
                            Row(
                              children: List.generate(2, (i) {
                                final seatNo = rowIndex * 4 + i + 1;
                                return Padding(
                                  padding: const EdgeInsets.only(right: 8),
                                  child: SizedBox(
                                    width: seatWidth - 8,
                                    height: 55,
                                    child: SeatWidget(
                                      seatNo: seatNo,
                                      status: seatStatuses[seatNo - 1],
                                      bus: bus,
                                      conductor: conductor,
                                      route: route,
                                    ),
                                  ),
                                );
                              }),
                            ),
                            // Right 2 seats
                            Row(
                              children: List.generate(2, (i) {
                                final seatNo = rowIndex * 4 + i + 3;
                                return Padding(
                                  padding: const EdgeInsets.only(left: 8),
                                  child: SizedBox(
                                    width: seatWidth - 8,
                                    height: 55,
                                    child: SeatWidget(
                                      seatNo: seatNo,
                                      status: seatStatuses[seatNo - 1],
                                      bus: bus,
                                      conductor: conductor,
                                      route: route,
                                    ),
                                  ),
                                );
                              }),
                            ),
                          ],
                        ),
                      );
                    }),
                  ),
                );
              }),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const ConductorBottomNav(),
    );
  }

  Widget _legend() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: const [
        _LegendItem(color: Colors.green, label: "Available"),
        _LegendItem(color: Colors.red, label: "Booked"),
        _LegendItem(color: Colors.orange, label: "Dropping Next"),
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
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}