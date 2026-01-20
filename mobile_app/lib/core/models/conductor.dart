class Conductor {
  final String id;
  final String name;
  final String busId;
  final String routeName;

  Conductor({
    required this.id,
    required this.name,
    required this.busId,
    required this.routeName,
  });

  factory Conductor.fromMap(Map<String, dynamic> data) {
    return Conductor(
      id: data['id'],
      name: data['name'],
      busId: data['busId'],
      routeName: data['routeName'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'busId': busId,
      'routeName': routeName,
    };
  }
}
