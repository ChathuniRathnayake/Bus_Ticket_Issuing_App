class HaltModel {
  final String id;
  final String name;
  final String routeId;
  final int order;
  final String? arrivalTime;

  HaltModel({
    required this.id,
    required this.name,
    required this.routeId,
    required this.order,
    this.arrivalTime,
  });

  factory HaltModel.fromMap(Map<String, dynamic> map, {String? id}) {
    return HaltModel(
      id: id ?? map['id'] ?? '',
      name: map['name'] ?? '',
      routeId: map['routeId'] ?? '',
      order: map['order'] is int ? map['order'] : int.tryParse(map['order']?.toString() ?? '0') ?? 0,
      arrivalTime: map['arrivalTime'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'routeId': routeId,
      'order': order,
      'arrivalTime': arrivalTime,
    };
  }
}
