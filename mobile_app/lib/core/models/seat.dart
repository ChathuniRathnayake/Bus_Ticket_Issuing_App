import 'seat_status.dart';

class Seat {
  final int seatNo;
  final SeatStatus status;

  Seat({
    required this.seatNo,
    required this.status,
  });

  factory Seat.fromMap(Map<String, dynamic> data) {
    return Seat(
      seatNo: data['seatNo'],
      status: SeatStatus.values[data['status']],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'seatNo': seatNo,
      'status': status.index,
    };
  }
}
