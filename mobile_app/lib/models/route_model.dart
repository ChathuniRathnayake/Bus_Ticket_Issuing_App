class RouteModel {
  final String routeId;
  final String name;
  final String nextStop;
  final List<String> stops;

  RouteModel({
    required this.routeId,
    required this.name,
    required this.nextStop,
    required this.stops,
  });

  factory RouteModel.fromMap(Map<String, dynamic> map) {
    return RouteModel(
      routeId: map['routeId'] ?? '',
      name: map['name'] ?? '',
      nextStop: map['nextStop'] ?? '',
      stops: List<String>.from(map['stops'] ?? []),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'routeId': routeId,
      'name': name,
      'nextStop': nextStop,
      'stops': stops,
    };
  }
}
