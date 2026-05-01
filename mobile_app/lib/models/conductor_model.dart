class Conductor {
  final String id;        // Firestore document ID
  final String conductorId;    // custom user identifier
  final String email;
  final String name;
  final String? busId;
  final String? routeId;

  Conductor({
    required this.id,
    required this.conductorId,
    required this.email,
    required this.name,
    this.busId,
    this.routeId,
  });

  factory Conductor.fromMap(Map<String, dynamic> map, {String? id}) {
    return Conductor(
      id: id ?? map['id'] ?? '',
      conductorId: map['conductorId'] ?? '',
      email: map['email'] ?? '',
      name: map['name'] ?? '',
      busId: map['busId'],
      routeId: map['routeId'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'conductorId': conductorId,
      'email': email,
      'name': name,
      'busId': busId,
      'routeId': routeId,
    };
  }
}