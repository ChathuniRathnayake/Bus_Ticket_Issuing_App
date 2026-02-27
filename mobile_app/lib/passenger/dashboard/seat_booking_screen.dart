import 'package:flutter/material.dart';
import '../../widgets/custom_button.dart';
import '../passenger_bottom_nav.dart';
import '../auth/passenger_login.dart';
import '../../core/models/seat_status.dart';
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

  // Mock seat status data
  final Map<int, SeatStatus> _seatStatuses = {
    1: SeatStatus.booked,
    2: SeatStatus.booked,
    3: SeatStatus.available,
    4: SeatStatus.available,
    5: SeatStatus.droppingNext,
    6: SeatStatus.available,
    7: SeatStatus.booked,
    8: SeatStatus.available,
    9: SeatStatus.available,
    10: SeatStatus.droppingNext,
    11: SeatStatus.available,
    12: SeatStatus.available,
    13: SeatStatus.booked,
    14: SeatStatus.booked,
    15: SeatStatus.available,
    16: SeatStatus.available,
    17: SeatStatus.available,
    18: SeatStatus.available,
    19: SeatStatus.droppingNext,
    20: SeatStatus.available,
    21: SeatStatus.available,
    22: SeatStatus.available,
    23: SeatStatus.booked,
    24: SeatStatus.available,
    25: SeatStatus.available,
    26: SeatStatus.available,
    27: SeatStatus.available,
    28: SeatStatus.available,
    29: SeatStatus.available,
    30: SeatStatus.available,
    31: SeatStatus.available,
    32: SeatStatus.available,
  };

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
                _buildLegendItem('Next Stop', Colors.orange),
                _buildLegendItem('Selected', Colors.blue),
              ],
            ),
          ),
          const Divider(height: 1),
          
          // Seat Map
          Expanded(
            child: SingleChildScrollView(
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
                      
                      return _buildSeat(seatIndex);
                    },
                  ),
                ],
              ),
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
                      'Total: Rs. ${(_selectedSeatsByUser.length * 450).toStringAsFixed(2)}',
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
                            totalAmount: _selectedSeatsByUser.length * 450.0,
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

  Widget _buildSeat(int seatNo) {
    SeatStatus status = _seatStatuses[seatNo] ?? SeatStatus.available;
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
          color = Colors.orange;
          break;
      }
    }

    return GestureDetector(
      onTap: (status == SeatStatus.available || status == SeatStatus.droppingNext)
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
