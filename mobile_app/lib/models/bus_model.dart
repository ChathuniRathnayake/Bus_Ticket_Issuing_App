class Bus {
  final String busId;
  final String routeId;
  final int totalSeats;

  Bus({
    required this.busId,
    required this.routeId,
    required this.totalSeats,
  });

  factory Bus.fromMap(Map<String, dynamic> map) {
    return Bus(
      busId: map['busId'] ?? '',
      routeId: map['routeId'] ?? '',
      totalSeats: map['totalSeats'] ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'busId': busId,
      'routeId': routeId,
      'totalSeats': totalSeats,
    };
  }
}
