import 'package:flutter/material.dart';
import 'seat_status.dart';
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
        return Colors.orange; // better visibility than yellow
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
        width: 55,     // ✅ FIXED WIDTH
        height: 55,    // ✅ FIXED HEIGHT
        decoration: BoxDecoration(
          color: seatColor,
          borderRadius: BorderRadius.circular(8),
        ),
        alignment: Alignment.center,
        child: Text(
          seatNo.toString(),
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
      ),
    );
  }
}
