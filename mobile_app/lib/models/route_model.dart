class RouteModel {
  final String id;
  final String name;
  final String startPoint;
  final String endPoint;
  final List<String>? stops;

  RouteModel({
    required this.id,
    required this.name,
    required this.startPoint,
    required this.endPoint,
    this.stops,
  });

  factory RouteModel.fromMap(Map<String, dynamic> map, {String? id}) {
    return RouteModel(
      id: id ?? map['id'] ?? '',
      name: map['name'] ?? '',
      startPoint: map['startPoint'] ?? '',
      endPoint: map['endPoint'] ?? '',
      stops: map['stops'] != null ? List<String>.from(map['stops']) : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'startPoint': startPoint,
      'endPoint': endPoint,
      'stops': stops,
    };
  }
}