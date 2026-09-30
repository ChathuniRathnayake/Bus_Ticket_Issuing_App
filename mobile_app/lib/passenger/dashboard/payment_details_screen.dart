import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_textfield.dart';
import '../passenger_bottom_nav.dart';
import '../auth/passenger_login.dart';
import '../../models/schedule_model.dart';
import 'booking_confirmed_screen.dart';

class PaymentDetailsScreen extends StatefulWidget {
  final ScheduleModel bus;
  final String from;
  final String to;
  final String date;
  final List<int> selectedSeats;
  final double totalAmount;

  const PaymentDetailsScreen({
    super.key,
    required this.bus,
    required this.from,
    required this.to,
    required this.date,
    required this.selectedSeats,
    required this.totalAmount,
  });

  @override
  State<PaymentDetailsScreen> createState() => _PaymentDetailsScreenState();
}

class _PaymentDetailsScreenState extends State<PaymentDetailsScreen> {
  int _selectedIndex = 1;
  final _formKey = GlobalKey<FormState>();
  
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _nicController = TextEditingController();
  final _emailController = TextEditingController();

  bool _isProcessing = false;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _nicController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _processPaymentAndBooking() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _isProcessing = true;
    });

    try {
      final user = FirebaseAuth.instance.currentUser;
      final userId = user?.uid ?? 'guest';

      // Save booking to Firestore
      final bookingRef = await FirebaseFirestore.instance.collection('bookings').add({
        'userId': userId,
        'scheduleId': widget.bus.id,
        'routeId': widget.bus.routeId,
        'busId': widget.bus.busId,
        'from': widget.from,
        'to': widget.to,
        'date': widget.date,
        'departureTime': widget.bus.departureTime,
        'passengerName': _nameController.text.trim(),
        'phone': _phoneController.text.trim(),
        'nic': _nicController.text.trim(),
        'email': _emailController.text.trim(),
        'selectedSeats': widget.selectedSeats,
        'totalAmount': widget.totalAmount,
        'bookingDate': FieldValue.serverTimestamp(),
        'status': 'confirmed'
      });

      // Save each individual seat to the 'seats' collection so they appear as booked
      final batch = FirebaseFirestore.instance.batch();
      for (var seat in widget.selectedSeats) {
        final seatDoc = FirebaseFirestore.instance.collection('seats').doc();
        batch.set(seatDoc, {
          'busId': widget.bus.busId,
          'routeId': widget.bus.routeId,
          'scheduleId': widget.bus.id,
          'bookingId': bookingRef.id,
          'seatNo': seat.toString(),
          'userId': userId,
          'passengerName': _nameController.text.trim(),
          'date': widget.date,
          'status': 'booked',
          'issuedAt': FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();

      if (!mounted) return;

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => BookingConfirmedScreen(
            bus: widget.bus,
            from: widget.from,
            to: widget.to,
            date: widget.date,
            passengerName: _nameController.text,
            phone: _phoneController.text,
            nic: _nicController.text,
            email: _emailController.text,
            selectedSeats: widget.selectedSeats,
            totalAmount: widget.totalAmount,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Booking failed: $e')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Passenger Details',
          style: TextStyle(color: Colors.black, fontSize: 18),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Payment Summary Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.blue,
                  borderRadius: BorderRadius.circular(16),
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1B56FD), Color(0xFF4993FA)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Total Amount',
                          style: TextStyle(color: Colors.white70, fontSize: 16),
                        ),
                        Text(
                          'Rs. ${widget.totalAmount.toStringAsFixed(2)}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const Divider(color: Colors.white30, height: 30),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Selected Seats',
                          style: TextStyle(color: Colors.white70, fontSize: 14),
                        ),
                        Text(
                          widget.selectedSeats.join(', '),
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),

              const Text(
                'Enter Contact Information',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF333333),
                ),
              ),
              const SizedBox(height: 20),

              CustomTextField(
                label: 'Full Name',
                hint: 'Enter your full name',
                controller: _nameController,
                prefixIcon: Icons.person_outline,
                validator: (value) => 
                  value == null || value.isEmpty ? 'Please enter your name' : null,
              ),
              const SizedBox(height: 16),

              CustomTextField(
                label: 'Phone Number',
                hint: 'Enter mobile number',
                controller: _phoneController,
                prefixIcon: Icons.phone_android_outlined,
                keyboardType: TextInputType.phone,
                validator: (value) => 
                  value == null || value.isEmpty ? 'Please enter phone number' : null,
              ),
              const SizedBox(height: 16),

              CustomTextField(
                label: 'NIC / Passport No',
                hint: 'Enter identification number',
                controller: _nicController,
                prefixIcon: Icons.badge_outlined,
                validator: (value) => 
                  value == null || value.isEmpty ? 'Please enter identification' : null,
              ),
              const SizedBox(height: 16),

              CustomTextField(
                label: 'Email Address',
                hint: 'Enter your email',
                controller: _emailController,
                prefixIcon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.isEmpty) return 'Please enter email';
                  if (!value.contains('@')) return 'Please enter a valid email';
                  return null;
                },
              ),
              const SizedBox(height: 40),

              _isProcessing 
                ? const Center(child: CircularProgressIndicator())
                : CustomButton(
                    text: 'Pay Now',
                    onTap: _processPaymentAndBooking,
                  ),
              const SizedBox(height: 20),
            ],
          ),
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
}