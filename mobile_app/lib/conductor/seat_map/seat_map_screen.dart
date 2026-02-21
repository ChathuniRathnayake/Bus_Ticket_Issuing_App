import 'package:flutter/material.dart';
import 'package:mobile_app/conductor/auth/conductor_login.dart';
import 'package:mobile_app/models/bus_model.dart';
import 'package:mobile_app/models/conductor_model.dart';
import 'package:mobile_app/models/route_model.dart';
import 'package:mobile_app/core/models/seat_status.dart';
import 'package:mobile_app/widgets/bottom_nav.dart';
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
    final List<SeatStatus> seatStatuses = List.generate(
      42,
      (index) {
        if (index % 7 == 0) return SeatStatus.booked;
        if (index % 5 == 0) return SeatStatus.droppingNext;
        return SeatStatus.available;
      },
    );

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
              child: GridView.builder(
                itemCount: 42,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 5,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                ),
                itemBuilder: (context, index) {
                  int col = index % 5;
                  int row = index ~/ 5;

                  int seatNo;
                  if (col < 2) {
                    seatNo = row * 4 + col + 1;
                  } else {
                    seatNo = row * 4 + col;
                  }

                  if (seatNo > 42) return const SizedBox.shrink();

                  return SeatWidget(
                    seatNo: seatNo,
                    status: seatStatuses[seatNo - 1],
                  );
                },
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const AppBottomNav(),
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

  const _LegendItem({
    required this.color,
    required this.label,
  });

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