class Ticket {
  final String ticketId;
  final int seatNo;
  final String passengerName;
  final String from;
  final String to;
  final DateTime issuedAt;

  Ticket({
    required this.ticketId,
    required this.seatNo,
    required this.passengerName,
    required this.from,
    required this.to,
    required this.issuedAt,
  });

  factory Ticket.fromMap(Map<String, dynamic> data) {
    return Ticket(
      ticketId: data['ticketId'],
      seatNo: data['seatNo'],
      passengerName: data['passengerName'],
      from: data['from'],
      to: data['to'],
      issuedAt: DateTime.parse(data['issuedAt']),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'ticketId': ticketId,
      'seatNo': seatNo,
      'passengerName': passengerName,
      'from': from,
      'to': to,
      'issuedAt': issuedAt.toIso8601String(),
    };
  }
}
