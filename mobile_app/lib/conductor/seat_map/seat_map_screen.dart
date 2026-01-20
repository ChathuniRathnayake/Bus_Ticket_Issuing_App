import 'package:flutter/material.dart';
import 'seat_widget.dart';
import '../../core/models/seat_status.dart';

class SeatMapScreen extends StatelessWidget {
  const SeatMapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Total seats in the bus (e.g., 40 seats)
    const int totalSeats = 40;
    
    // Generate dummy statuses for the seats
    final List<SeatStatus> seatStatuses = List.generate(
      totalSeats,
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
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _legend(),
            const SizedBox(height: 24),
            // Header to represent the Front of the Bus
            Container(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 20),
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text("FRONT / DRIVER", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black54)),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: GridView.builder(
                // We use 5 columns (2 seats + 1 aisle + 2 seats)
                // To get 40 seats, we need 10 rows. 10 rows * 5 columns = 50 total items in grid
                itemCount: 50, 
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 5,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                ),
                itemBuilder: (context, index) {
                  int col = index % 5;
                  int row = index ~/ 5;

                  // 1. Identify the Aisle (Middle column index 2)
                  if (col == 2) {
                    return const SizedBox.shrink(); 
                  }

                  // 2. Calculate Seat Numbering
                  // If we are in the right-side columns (3 and 4), we subtract 1 from the count
                  // because the aisle column (index 2) doesn't consume a seat number.
                  int seatNo = (row * 4) + (col > 2 ? col : col + 1);

                  if (seatNo > totalSeats) return const SizedBox.shrink();

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
    );
  }

  Widget _legend() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: const [
        _LegendItem(color: Colors.green, label: "Available"),
        _LegendItem(color: Colors.red, label: "Booked"),
        _LegendItem(color: Colors.orange, label: "Dropping"),
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
          width: 14,
          height: 14,
          decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3)),
        ),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}