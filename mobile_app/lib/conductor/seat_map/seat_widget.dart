import 'package:flutter/material.dart';
import '../../core/models/seat_status.dart';
import '../ticket/issue_ticket_screen.dart';

class SeatWidget extends StatelessWidget {
  final int seatNo;
  final SeatStatus status;

  const SeatWidget({
    super.key,
    required this.seatNo,
    required this.status,
  });

  Color get seatColor {
    switch (status) {
      case SeatStatus.available:
        return Colors.green;
      case SeatStatus.booked:
        return Colors.red;
      case SeatStatus.droppingNext:
        return Colors.orange;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: status == SeatStatus.available
          ? () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => IssueTicketScreen(seatNo: seatNo),
                ),
              );
            }
          : null,
      child: Container(
        // Remove fixed width/height so it fills the Grid cell properly
        decoration: BoxDecoration(
          color: seatColor,
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            )
          ],
        ),
        alignment: Alignment.center,
        child: Text(
          seatNo.toString(),
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white, // White looks better on Red/Green/Orange
          ),
        ),
      ),
    );
  }
}