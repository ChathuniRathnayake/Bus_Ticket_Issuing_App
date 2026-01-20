import 'package:flutter/material.dart';
import 'package:mobile_app/conductor/ticket/issue_ticket_screen.dart';
import 'package:mobile_app/core/constants/colors.dart';

class SeatWidget extends StatelessWidget {
  final bool isAvailable;
  final int seatNo;

  const SeatWidget({required this.isAvailable, required this.seatNo});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isAvailable
          ? () {
              Navigator.push(context,
                MaterialPageRoute(builder: (_) => IssueTicketScreen(seatNo: seatNo)));
            }
          : null,
      child: Container(
        decoration: BoxDecoration(
          color: isAvailable ? AppColors.secondary : Colors.grey,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Center(child: Text(seatNo.toString())),
      ),
    );
  }
}
