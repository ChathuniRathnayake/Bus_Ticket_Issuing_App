import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../widgets/custom_button.dart';
import '../passenger_bottom_nav.dart';
import '../auth/passenger_login.dart';
import 'dashboard_screen.dart';
import '../../models/schedule_model.dart';

class BookingConfirmedScreen extends StatefulWidget {
  final ScheduleModel bus;
  final String from;
  final String to;
  final String date;
  final String passengerName;
  final String phone;
  final String nic;
  final String email;
  final List<int> selectedSeats;
  final double totalAmount;

  const BookingConfirmedScreen({
    super.key,
    required this.bus,
    required this.from,
    required this.to,
    required this.date,
    required this.passengerName,
    required this.phone,
    required this.nic,
    required this.email,
    required this.selectedSeats,
    required this.totalAmount,
  });

  @override
  State<BookingConfirmedScreen> createState() => _BookingConfirmedScreenState();
}

class _BookingConfirmedScreenState extends State<BookingConfirmedScreen> {
  int _selectedIndex = 2; // "Tickets" or "Home"

  String get _qrData {
    return jsonEncode({
      "busId": widget.bus.busPlateNumber ?? widget.bus.busModel ?? '',
      "route": "${widget.from} - ${widget.to}",
      "date": widget.date,
      "time": widget.bus.departureTime,
      "seats": widget.selectedSeats,
      "price": widget.totalAmount,
      "timestamp": DateTime.now().toIso8601String()
    });
  }

  Future<void> _generatePdf() async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return pw.Padding(
            padding: const pw.EdgeInsets.all(40),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Header(
                  level: 0,
                  child: pw.Text('BUS TICKET - BOOKING CONFIRMATION', 
                    style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold)),
                ),
                pw.SizedBox(height: 20),
                pw.Text('Booking ID: BT-${DateTime.now().millisecondsSinceEpoch}', 
                  style: pw.TextStyle(fontSize: 12, color: PdfColors.grey700)),
                pw.Divider(),
                pw.SizedBox(height: 20),
                pw.Row(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('JOURNEY DETAILS', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.SizedBox(height: 10),
                        pw.Text('Bus Name: ${widget.bus.routeName ?? widget.bus.busModel ?? 'Unknown Route'}'),
                        pw.Text('Bus Type: ${widget.bus.busPlateNumber ?? widget.bus.busModel ?? ''}'),
                        pw.Text('Route: ${widget.from} to ${widget.to}'),
                        pw.Text('Date: ${widget.date}'),
                        pw.Text('Time: ${widget.bus.departureTime}'),
                        pw.Text('Seats: ${widget.selectedSeats.join(", ")}'),
                        pw.SizedBox(height: 20),
                        pw.Text('PASSENGER INFORMATION', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.SizedBox(height: 10),
                        pw.Text('Name: ${widget.passengerName}'),
                        pw.Text('NIC/Passport: ${widget.nic}'),
                        pw.Text('Phone: ${widget.phone}'),
                        pw.Text('Email: ${widget.email}'),
                      ]
                    ),
                    pw.Column(
                      children: [
                        pw.Text('E-TICKET QR', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10)),
                        pw.SizedBox(height: 8),
                        pw.BarcodeWidget(
                          barcode: pw.Barcode.qrCode(),
                          data: _qrData,
                          width: 100,
                          height: 100,
                        ),
                      ]
                    )
                  ]
                ),
                pw.SizedBox(height: 40),
                pw.Divider(),
                pw.SizedBox(height: 20),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('TOTAL PAID', style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold)),
                    pw.Text('Rs. ${widget.totalAmount.toStringAsFixed(2)}', 
                      style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold, color: PdfColors.blue)),
                  ],
                ),
                pw.Spacer(),
                pw.Center(
                  child: pw.Text('Thank you for choosing TicketGo!', 
                    style: pw.TextStyle(color: PdfColors.grey600, fontStyle: pw.FontStyle.italic)),
                ),
              ],
            ),
          );
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdf.save(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Booking Confirmed',
          style: TextStyle(color: Colors.black, fontSize: 18),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const Icon(
              Icons.check_circle,
              color: Colors.green,
              size: 80,
            ),
            const SizedBox(height: 16),
            const Text(
              'Thank You!',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const Text(
              'Your booking has been confirmed.',
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
            const SizedBox(height: 30),
            
            // Ticket Summary Card with QR Code
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFFF8F9FF),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.blue.withOpacity(0.1)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: QrImageView(
                      data: _qrData,
                      version: QrVersions.auto,
                      size: 150.0,
                      backgroundColor: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 24),
                  _buildSummaryRow('Bus', widget.bus.routeName ?? widget.bus.busModel ?? 'Unknown Route'),
                  _buildSummaryRow('Route', '${widget.from} to ${widget.to}'),
                  _buildSummaryRow('Departure', '${widget.date} at ${widget.bus.departureTime.isEmpty ? 'Scheduled' : widget.bus.departureTime}'),
                  _buildSummaryRow('Seats', widget.selectedSeats.join(', ')),
                  const Divider(height: 32),
                  _buildSummaryRow('Passenger', widget.passengerName),
                  _buildSummaryRow('NIC/Passport', widget.nic),
                  const Divider(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total Paid',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'Rs. ${widget.totalAmount.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
            
            CustomButton(
              text: 'Save Ticket as PDF',
              onTap: _generatePdf,
            ),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const PassengerDashboard()),
                  (route) => false,
                );
              },
              child: const Text('Back to Home'),
            ),
          ],
        ),
      ),
      bottomNavigationBar: PassengerBottomNav(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(color: Colors.grey, fontSize: 14),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }
}