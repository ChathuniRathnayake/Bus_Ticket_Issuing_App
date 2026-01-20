class Conductor {
  final String conductorId;
  final String name;
  final String busId;
  final String password;

  Conductor({
    required this.conductorId,
    required this.name,
    required this.busId,
    required this.password,
  });

  factory Conductor.fromMap(Map<String, dynamic> map) {
    return Conductor(
      conductorId: map['conductorId'] ?? '',
      name: map['name'] ?? '',
      busId: map['busId'] ?? '',
      password: map['password'] ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'conductorId': conductorId,
      'name': name,
      'busId': busId,
      'password': password,
    };
  }
}
