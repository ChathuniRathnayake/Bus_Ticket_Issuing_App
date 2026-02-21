import 'package:flutter/material.dart';
import 'seat_status.dart';
import '../ticket/issue_ticket_screen.dart';
import '../../models/bus_model.dart';
import '../../models/conductor_model.dart';
import '../../models/route_model.dart';

class SeatWidget extends StatelessWidget {
  final int seatNo;
  final SeatStatus status;
  final Bus? bus;
  final Conductor? conductor;
  final RouteModel? route;

  const SeatWidget({
    super.key,
    required this.seatNo,
    required this.status,
    this.bus,
    this.conductor,
    this.route,
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
                  builder: (_) => IssueTicketScreen(
                    seatNo: seatNo,
                    bus: bus,
                    conductor: conductor!,
                    route: route,
                  ),
                ),
              );
            }
          : null,
      child: Container(
        width: 55,
        height: 55,
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
