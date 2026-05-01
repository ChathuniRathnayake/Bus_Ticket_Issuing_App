class RouteModel {
  final String id;
  final String routeName;
  final String startStop;
  final String endStop;
  final List<String>? stops;
  final String? price;

  RouteModel({
    required this.id,
    required this.routeName,
    required this.startStop,
    required this.endStop,
    this.stops,
    this.price,
  });

  factory RouteModel.fromMap(Map<String, dynamic> map, {String? id}) {
    return RouteModel(
      id: id ?? map['routeId']?.toString() ?? map['id']?.toString() ?? '',
      routeName: map['routeName'] ?? map['name'] ?? '',
      startStop: map['startStop'] ?? map['startPoint'] ?? '',
      endStop: map['endStop'] ?? map['endPoint'] ?? '',
      stops: map['stops'] != null ? List<String>.from(map['stops']) : null,
      price: map['price']?.toString(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'routeName': routeName,
      'startStop': startStop,
      'endStop': endStop,
      'stops': stops,
      'price': price,
    };
  }
}