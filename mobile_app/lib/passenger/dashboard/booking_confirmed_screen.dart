import 'package:flutter/material.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../../widgets/custom_button.dart';
import '../passenger_bottom_nav.dart';
import '../auth/passenger_login.dart';
import 'dashboard_screen.dart';

class BookingConfirmedScreen extends StatefulWidget {
  final Map<String, String> bus;
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
                pw.Text('JOURNEY DETAILS', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                pw.SizedBox(height: 10),
                pw.Text('Bus Name: ${widget.bus['busName']}'),
                pw.Text('Bus Type: ${widget.bus['type']}'),
                pw.Text('Route: ${widget.from} to ${widget.to}'),
                pw.Text('Date: ${widget.date}'),
                pw.Text('Time: ${widget.bus['time']}'),
                pw.Text('Seats: ${widget.selectedSeats.join(", ")}'),
                pw.SizedBox(height: 20),
                pw.Text('PASSENGER INFORMATION', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                pw.SizedBox(height: 10),
                pw.Text('Name: ${widget.passengerName}'),
                pw.Text('Phone: ${widget.phone}'),
                pw.Text('NIC/Passport: ${widget.nic}'),
                pw.Text('Email: ${widget.email}'),
                pw.SizedBox(height: 30),
                pw.Divider(),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('TOTAL AMOUNT PAID:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 18)),
                    pw.Text('Rs. ${widget.totalAmount.toStringAsFixed(2)}', 
                      style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 18, color: PdfColors.blue)),
                  ],
                ),
                pw.SizedBox(height: 50),
                pw.Center(
                  child: pw.Text('Thank you for choosing our service!', style: pw.TextStyle(fontStyle: pw.FontStyle.italic)),
                ),
              ],
            ),
          );
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdf.save(),
      name: 'Bus_Ticket_${widget.passengerName.replaceAll(' ', '_')}.pdf',
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
        actions: [
          IconButton(
            icon: const Icon(Icons.account_circle, color: Colors.blue),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.red),
            onPressed: () {
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
                (route) => false,
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const Icon(
              Icons.check_circle,
              color: Colors.green,
              size: 100,
            ),
            const SizedBox(height: 24),
            const Text(
              'Thank You!',
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
            const Text(
              'Your booking has been confirmed.',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 40),
            
            // Ticket Summary Card
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
                  _buildSummaryRow('Bus', widget.bus['busName']!),
                  _buildSummaryRow('Route', '${widget.from} to ${widget.to}'),
                  _buildSummaryRow('Departure', '${widget.date} at ${widget.bus['time']}'),
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
