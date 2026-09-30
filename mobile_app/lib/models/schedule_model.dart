import 'package:cloud_firestore/cloud_firestore.dart';

class ScheduleModel {
  final String id;
  final String busId;
  final String routeId;
  final String date;
  final String departureTime;
  final String status;
  
  // These fields are optionally populated when joining with routes and buses
  final String? routeName;
  final String? startStop;
  final String? endStop;
  final String? price;
  final String? busModel;
  final String? busPlateNumber;
  final String? totalSeats;

  ScheduleModel({
    required this.id,
    required this.busId,
    required this.routeId,
    required this.date,
    required this.departureTime,
    required this.status,
    this.routeName,
    this.startStop,
    this.endStop,
    this.price,
    this.busModel,
    this.busPlateNumber,
    this.totalSeats,
  });

  factory ScheduleModel.fromMap(Map<String, dynamic> map, {String? id}) {
    String parseDate(dynamic val) {
      if (val == null) return '';
      if (val is String) return val;
      if (val is Timestamp) {
        final dt = val.toDate();
        return "${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}";
      }
      if (val is Map && val.containsKey('seconds')) {
        final dt = Timestamp(val['seconds'] as int, val['nanoseconds'] as int? ?? 0).toDate();
        return "${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}";
      }
      return val.toString();
    }

    String parseTime(dynamic val) {
      if (val == null) return '';
      if (val is String) return val;
      if (val is Timestamp) {
        final dt = val.toDate();
        return "${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}";
      }
      if (val is Map && val.containsKey('seconds')) {
        final dt = Timestamp(val['seconds'] as int, val['nanoseconds'] as int? ?? 0).toDate();
        return "${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}";
      }
      if (val is Map && val.containsKey('hour') && val.containsKey('minute')) {
        return "${val['hour'].toString().padLeft(2, '0')}:${val['minute'].toString().padLeft(2, '0')}";
      }
      return val.toString();
    }

    return ScheduleModel(
      id: id ?? map['scheduleId']?.toString() ?? map['id']?.toString() ?? '',
      busId: map['busId']?.toString() ?? '',
      routeId: map['routeId']?.toString() ?? '',
      date: parseDate(map['date']),
      departureTime: parseTime(map['departureTime']),
      status: map['status']?.toString() ?? 'Active',
      routeName: map['routeName']?.toString(),
      startStop: map['startStop']?.toString(),
      endStop: map['endStop']?.toString(),
      price: map['price']?.toString(),
      busModel: map['busModel']?.toString(),
      busPlateNumber: map['busPlateNumber']?.toString(),
      totalSeats: map['totalSeats']?.toString(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'scheduleId': id, // Using scheduleId to match backend DB naming conventions
      'busId': busId,
      'routeId': routeId,
      'date': date,
      'departureTime': departureTime,
      'status': status,
    };
  }
}