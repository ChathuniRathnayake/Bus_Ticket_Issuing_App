class Bus {
  final String id;
  final String plateNumber;
  final String model;
  final int capacity;

  Bus({
    required this.id,
    required this.plateNumber,
    required this.model,
    required this.capacity,
  });

  factory Bus.fromMap(Map<String, dynamic> map, {String? id}) {
    return Bus(
      id: id ?? map['id'] ?? '',
      plateNumber: map['plateNumber'] ?? '',
      model: map['model'] ?? '',
      capacity: map['capacity'] ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'plateNumber': plateNumber,
      'model': model,
      'capacity': capacity,
    };
  }
}