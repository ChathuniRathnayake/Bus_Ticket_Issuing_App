import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';

class LocationService {
  Future<Position> getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Check GPS service
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception("Location services are disabled");
    }

    // Check permission
    permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception("Location permission denied");
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw Exception("Permission permanently denied");
    }

    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }

  /// Returns a live position stream after ensuring the GPS service is enabled
  /// and the necessary permissions have been granted. Throws a descriptive
  /// [Exception] if either check fails so callers can handle it gracefully.
  Stream<Position> getLiveLocation() async* {
    // ── 1. Ensure the device GPS / location service is turned on ──────────
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception("Location services are disabled. Please enable GPS.");
    }

    // ── 2. Ensure the app has location permission ──────────────────────────
    LocationPermission permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception("Location permission denied.");
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw Exception(
        "Location permission permanently denied. "
        "Please enable it in app settings.",
      );
    }

    // ── 3. All good – start streaming positions ────────────────────────────
    yield* Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
      ),
    );
  }

  Future<String> getPlaceName(double lat, double lng) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(lat, lng);
      if (placemarks.isNotEmpty) {
        Placemark place = placemarks.first;
        // Construct a readable name: "Locality, City" or "Name, Locality"
        return "${place.locality ?? ''}${place.locality != null && place.subAdministrativeArea != null ? ', ' : ''}${place.subAdministrativeArea ?? ''}".trim();
      }
    } catch (e) {
      debugPrint("Geocoding Error: $e");
    }
    return "$lat, $lng";
  }
}