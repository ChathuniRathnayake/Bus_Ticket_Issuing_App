import 'package:flutter/foundation.dart';
import 'ticket_model.dart';

enum SeatStatus {
  available,
  booked,
  droppingNext,
}

class Seat {
  final int seatNo;
  SeatStatus status;
  Ticket? ticket; // assigned ticket if booked

  Seat({
    required this.seatNo,
    this.status = SeatStatus.available,
    this.ticket,
  });

  // Convert Seat to JSON
  Map<String, dynamic> toJson() {
    return {
      'seatNo': seatNo,
      'status': describeEnum(status), // saves as string
      'ticketId': ticket?.ticketId, // only ticket ID to avoid full object
    };
  }

  // Create Seat from JSON
  factory Seat.fromJson(Map<String, dynamic> json, Ticket? ticket) {
    return Seat(
      seatNo: json['seatNo'],
      status: SeatStatus.values.firstWhere(
        (e) => describeEnum(e) == json['status'],
        orElse: () => SeatStatus.available,
      ),
      ticket: ticket,
    );
  }

  // Book a seat and assign a ticket
  void book(Ticket ticket) {
    this.ticket = ticket;
    status = SeatStatus.booked;
  }

  // Mark seat as dropping next
  void markDroppingNext() {
    ticket = null;
    status = SeatStatus.droppingNext;
  }

  // Free the seat
  void free() {
    ticket = null;
    status = SeatStatus.available;
  }
}
