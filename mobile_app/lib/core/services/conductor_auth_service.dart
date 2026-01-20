import 'package:mobile_app/models/bus_model.dart';
import 'package:mobile_app/models/conductor_model.dart';
import 'package:mobile_app/models/route_model.dart';

class ConductorAuthService {
  /// Hardcoded login
  Future<Map<String, dynamic>?> login(String conductorId, String password) async {
    // simulate network delay
    await Future.delayed(const Duration(seconds: 1));

    // Hardcoded credentials
    const hardcodedId = 'C001';
    const hardcodedPassword = '123456';

    if (conductorId.trim() != hardcodedId || password.trim() != hardcodedPassword) {
      print("Incorrect UserID or Password");
      return null;
    }

    // Hardcoded conductor
    final conductor = Conductor(
      conductorId: hardcodedId,
      name: 'John Doe',
      busId: 'B001',
      password: hardcodedPassword,
    );

    // Hardcoded bus
    final bus = Bus(
      busId: 'B001',
      routeId: 'R001',
      totalSeats: 40,
    );

    // Hardcoded route
    final route = RouteModel(
      routeId: 'R001',
      name: 'City A to City B',
      nextStop: 'Stop 1',
      stops: ['Stop 1', 'Stop 2', 'Stop 3'],
    );

    return {
      'conductor': conductor,
      'bus': bus,
      'route': route,
    };
  }
}
