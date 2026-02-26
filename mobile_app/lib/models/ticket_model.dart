import 'bus_model.dart';
import 'conductor_model.dart';

class Ticket {
  final String ticketId;
  final int seatNo;
  final String passengerName;
  final String passengerType; // e.g., "Adult", "Child"
  final String boardingStop;
  final String dropStop;
  final double price;
  final Bus bus;
  final Conductor conductor;
  final DateTime issuedAt;

  Ticket({
    required this.ticketId,
    required this.seatNo,
    required this.passengerName,
    required this.passengerType,
    required this.boardingStop,
    required this.dropStop,
    required this.price,
    required this.bus,
    required this.conductor,
    required this.issuedAt,
  });

  // Convert Ticket to JSON
  Map<String, dynamic> toJson() {
    return {
      'ticketId': ticketId,
      'seatNo': seatNo,
      'passengerName': passengerName,
      'passengerType': passengerType,
      'boardingStop': boardingStop,
      'dropStop': dropStop,
      'price': price,
      'busId': bus.id,
      'conductorId': conductor.id,
      'issuedAt': issuedAt.toIso8601String(),
    };
  }

  // Create Ticket from JSON
  factory Ticket.fromJson(
    Map<String, dynamic> json,
    Bus bus,
    Conductor conductor,
  ) {
    return Ticket(
      ticketId: json['ticketId'],
      seatNo: json['seatNo'],
      passengerName: json['passengerName'],
      passengerType: json['passengerType'],
      boardingStop: json['boardingStop'],
      dropStop: json['dropStop'],
      price: (json['price'] as num).toDouble(),
      bus: bus,
      conductor: conductor,
      issuedAt: DateTime.parse(json['issuedAt']),
    );
  }
}
