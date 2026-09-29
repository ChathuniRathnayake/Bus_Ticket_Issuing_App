import 'package:flutter/material.dart';
import '../../widgets/custom_button.dart';
import '../passenger_bottom_nav.dart';
import '../auth/passenger_login.dart';
import '../../core/models/seat_status.dart';
import '../../core/services/passenger_data_service.dart';
import 'payment_details_screen.dart';

class SeatBookingScreen extends StatefulWidget {
  final Map<String, String> bus;
  final String from;
  final String to;
  final String date;

  const SeatBookingScreen({
    super.key,
    required this.bus,
    required this.from,
    required this.to,
    required this.date,
  });

  @override
  State<SeatBookingScreen> createState() => _SeatBookingScreenState();
}

class _SeatBookingScreenState extends State<SeatBookingScreen> {
  int _selectedIndex = 1;
  final Set<int> _selectedSeatsByUser = {};
  final PassengerDataService _dataService = PassengerDataService();

  double _getSeatPrice() {
    final priceStr = widget.bus['price'] ?? '0';
    final numericStr = priceStr.replaceAll(RegExp(r'[^0-9.]'), '');
    return double.tryParse(numericStr) ?? 0.0;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Select Seats',
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
      body: Column(
        children: [
          // Seat Legend
          Container(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
            color: Colors.white,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildLegendItem('Available', Colors.green),
                _buildLegendItem('Booked', Colors.red),
                _buildLegendItem('Selected', Colors.blue),
              ],
            ),
          ),
          const Divider(height: 1),
          
          // Seat Map
          Expanded(
            child: StreamBuilder<List<int>>(
              stream: _dataService.getBookedSeatsStream(widget.bus['id'] ?? '', widget.date),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                final bookedSeats = snapshot.data ?? [];

                return SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      // Seat Grid (2-way aisle)
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 5, // 2 seats - gap - 2 seats
                          mainAxisSpacing: 15,
                          crossAxisSpacing: 10,
                          childAspectRatio: 1,
                        ),
                        itemCount: 40, // 8 rows of 5 slots
                        itemBuilder: (context, index) {
                          int row = index ~/ 5;
                          int col = index % 5;
                          
                          // If it's the 3rd column (index 2), it's the aisle
                          if (col == 2) {
                            return const SizedBox.shrink();
                          }
                          
                          // Map grid index to seat number
                          int seatIndex = (row * 4) + (col > 2 ? col - 1 : col) + 1;
                          
                          if (seatIndex > 32) return const SizedBox.shrink();
                          
                          return _buildSeat(seatIndex, bookedSeats);
                        },
                      ),
                    ],
                  ),
                );
              }
            ),
          ),
          
          // Bottom Payment Section
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Selected: ${_selectedSeatsByUser.length} Seats',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    Text(
                      'Total: Rs. ${(_selectedSeatsByUser.length * _getSeatPrice()).toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: Colors.blue,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                CustomButton(
                  text: 'Proceed to Payment',
                  onTap: () {
                    if (_selectedSeatsByUser.isNotEmpty) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => PaymentDetailsScreen(
                            bus: widget.bus,
                            from: widget.from,
                            to: widget.to,
                            date: widget.date,
                            selectedSeats: _selectedSeatsByUser.toList()..sort(),
                            totalAmount: _selectedSeatsByUser.length * _getSeatPrice(),
                          ),
                        ),
                      );
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please select at least one seat')),
                      );
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: PassengerBottomNav(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() => _selectedIndex = index);
        },
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(3),
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }

  Widget _buildSeat(int seatNo, List<int> bookedSeats) {
    SeatStatus status = bookedSeats.contains(seatNo) ? SeatStatus.booked : SeatStatus.available;
    bool isSelected = _selectedSeatsByUser.contains(seatNo);
    
    Color color;
    if (isSelected) {
      color = Colors.blue;
    } else {
      switch (status) {
        case SeatStatus.available:
          color = Colors.green;
          break;
        case SeatStatus.booked:
          color = Colors.red;
          break;
        case SeatStatus.droppingNext:
          // TODO: Handle this case.
          throw UnimplementedError();
      }
    }

    return GestureDetector(
      onTap: (status == SeatStatus.available)
          ? () {
              setState(() {
                if (_selectedSeatsByUser.contains(seatNo)) {
                  _selectedSeatsByUser.remove(seatNo);
                } else {
                  _selectedSeatsByUser.add(seatNo);
                }
              });
            }
          : null,
      child: Container(
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(8),
        ),
        alignment: Alignment.center,
        child: Text(
          seatNo.toString(),
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
      ),
    );
  }
}