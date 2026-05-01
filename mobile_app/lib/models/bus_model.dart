class Bus {
  final String id;
  final String plateNumber;
  final String model;
  final String? routeId;
  final int totalSeats;

  Bus({
    required this.id,
    required this.plateNumber,
    required this.model,
    this.routeId,
    required this.totalSeats,
  });

  factory Bus.fromMap(Map<String, dynamic> map, {String? id}) {
    return Bus(
      id: id ?? map['id'] ?? '',
      plateNumber: map['plateNumber'] ?? '',
      model: map['model'] ?? '',
      routeId: map['routeId']?.toString(),
      totalSeats: int.tryParse(map['totalSeats']?.toString() ?? '0') ?? 
                  int.tryParse(map['capacity']?.toString() ?? '0') ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'plateNumber': plateNumber,
      'model': model,
      'totalSeats': totalSeats,
    };
  }
}