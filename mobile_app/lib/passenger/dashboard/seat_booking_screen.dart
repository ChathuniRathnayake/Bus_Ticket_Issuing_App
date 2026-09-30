import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../widgets/custom_button.dart';
import '../passenger_bottom_nav.dart';
import '../auth/passenger_login.dart';
import '../../core/models/seat_status.dart';
import '../../models/schedule_model.dart';
import 'payment_details_screen.dart';

class SeatBookingScreen extends StatefulWidget {
  final ScheduleModel bus;
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
  Map<int, SeatStatus> _seatStatuses = {};
  bool _isLoadingSeats = true;
  double _pricePerSeat = 0.0;
  
  int get totalSeats => int.tryParse(widget.bus.totalSeats ?? '42') ?? 42;
  int get bookedSeatsCount => _seatStatuses.values.where((s) => s == SeatStatus.booked).length;
  int get availableSeatsCount => totalSeats - bookedSeatsCount;

  @override
  void initState() {
    super.initState();
    _initializeData();
  }

  Future<void> _initializeData() async {
    await Future.wait([
      _fetchBookedSeats(),
      _calculateTicketPrice(),
    ]);
  }

  Future<void> _calculateTicketPrice() async {
    double basePrice = double.tryParse(widget.bus.price ?? '450') ?? 450.0;

    if (widget.from == "Not Selected" || widget.to == "Not Selected") {
      setState(() {
        _pricePerSeat = basePrice;
      });
      return;
    }

    try {
      final snapshot = await FirebaseFirestore.instance
          .collection('halts')
          .where('routeId', isEqualTo: widget.bus.routeId)
          .get();

      int fromOrder = -1;
      int toOrder = -1;
      int totalSegments = 1;

      if (snapshot.docs.isNotEmpty) {
        final halts = snapshot.docs.map((doc) => doc.data()).toList();
        halts.sort((a, b) => (int.tryParse(a['order']?.toString() ?? '0') ?? 0)
            .compareTo(int.tryParse(b['order']?.toString() ?? '0') ?? 0));

        for (var halt in halts) {
          final name = (halt['name'] ?? halt['haltName'] ?? halt['stopName'] ?? '').toString();
          final order = int.tryParse(halt['order']?.toString() ?? '0') ?? 0;
          
          if (name == widget.from && fromOrder == -1) fromOrder = order;
          if (name == widget.to && toOrder == -1) toOrder = order;
        }

        if (fromOrder == -1 && widget.from == widget.bus.startStop) fromOrder = 0;
        if (toOrder == -1 && widget.to == widget.bus.endStop) toOrder = (int.tryParse(halts.last['order']?.toString() ?? '0') ?? 0) + 1;

        int firstOrder = int.tryParse(halts.first['order']?.toString() ?? '0') ?? 0;
        int lastOrder = int.tryParse(halts.last['order']?.toString() ?? '0') ?? 0;
        totalSegments = (lastOrder - firstOrder).abs();
        if (widget.bus.endStop != null && widget.bus.endStop!.isNotEmpty) totalSegments += 1; // Account for end stop if not in halts

      } else {
        // Fallback to route document's stops array
        final routeDoc = await FirebaseFirestore.instance.collection('routes').doc(widget.bus.routeId).get();
        if (routeDoc.exists) {
          final routeData = routeDoc.data()!;
          
          // 1. Try to use exact stopFareCents if available
          if (routeData['stops'] != null && routeData['stopFareCents'] != null) {
            List<String> rawStops = [];
            for (var s in routeData['stops']) {
              if (s is String) rawStops.add(s);
              else if (s is Map && s['name'] != null) rawStops.add(s['name'].toString());
            }
            
            List<int> rawFares = [];
            for (var f in routeData['stopFareCents']) {
              rawFares.add(int.tryParse(f.toString()) ?? 0);
            }
            
            int fromIdx = rawStops.indexOf(widget.from);
            int toIdx = rawStops.indexOf(widget.to);
            
            if (fromIdx != -1 && toIdx != -1 && fromIdx < rawFares.length && toIdx < rawFares.length) {
              int fareCents = (rawFares[toIdx] - rawFares[fromIdx]).abs();
              setState(() {
                _pricePerSeat = fareCents / 100.0;
              });
              return; // We are done, exact fare used!
            }
          }

          // 2. Proportional pricing fallback
          List<String> allStops = [];
          if (routeData['startStop'] != null) allStops.add(routeData['startStop'].toString());
          if (routeData['stops'] != null) {
            final stopsList = List<dynamic>.from(routeData['stops']);
            for (var s in stopsList) {
              if (s is String) allStops.add(s);
              else if (s is Map && s['name'] != null) allStops.add(s['name'].toString());
            }
          }
          if (routeData['endStop'] != null) allStops.add(routeData['endStop'].toString());
          
          allStops = allStops.toSet().toList();
          fromOrder = allStops.indexOf(widget.from);
          toOrder = allStops.indexOf(widget.to);
          totalSegments = allStops.length > 1 ? allStops.length - 1 : 1;
        }
      }

      if (totalSegments <= 0) totalSegments = 1;

      if (fromOrder != -1 && toOrder != -1) {
        int stopsTravelled = (toOrder - fromOrder).abs();
        
        double pricePerStop = basePrice / totalSegments;
        double calculatedPrice = stopsTravelled * pricePerStop;
        
        setState(() {
          _pricePerSeat = calculatedPrice > 0 ? calculatedPrice : basePrice;
        });
      } else {
        setState(() => _pricePerSeat = basePrice);
      }
    } catch (e) {
      print("Error calculating price: $e");
      setState(() => _pricePerSeat = basePrice);
    }
  }

  Future<void> _fetchBookedSeats() async {
    try {
      final bookingsSnapshot = await FirebaseFirestore.instance
          .collection('bookings')
          .where('scheduleId', isEqualTo: widget.bus.id)
          .where('date', isEqualTo: widget.date)
          .get();

      final seatsSnapshot = await FirebaseFirestore.instance
          .collection('seats')
          .where('busId', isEqualTo: widget.bus.busId)
          .where('date', isEqualTo: widget.date)
          .get();

      Map<int, SeatStatus> fetchedStatuses = {};
      
      // Initialize all seats as available
      for (int i = 1; i <= totalSeats; i++) {
        fetchedStatuses[i] = SeatStatus.available;
      }

      for (var doc in bookingsSnapshot.docs) {
        final data = doc.data();
        if (data['selectedSeats'] != null) {
          final List<dynamic> seats = data['selectedSeats'];
          for (var seat in seats) {
            fetchedStatuses[int.parse(seat.toString())] = SeatStatus.booked;
          }
        }
      }

      for (var doc in seatsSnapshot.docs) {
        final data = doc.data();
        final status = data['status']?.toString().toLowerCase();
        final isActive = status == null || (status != 'cancelled' && status != 'released');
        if (isActive && data['seatNo'] != null) {
           final seatNo = int.tryParse(data['seatNo'].toString());
           if (seatNo != null) {
             fetchedStatuses[seatNo] = SeatStatus.booked;
           }
        }
      }

      if (mounted) {
        setState(() {
          _seatStatuses = fetchedStatuses;
          _isLoadingSeats = false;
        });
      }
    } catch (e) {
      print("Error fetching seats: $e");
      if (mounted) {
        setState(() {
          _isLoadingSeats = false;
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
          'Select Seats',
          style: TextStyle(color: Colors.black, fontSize: 18),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: _isLoadingSeats 
        ? const Center(child: CircularProgressIndicator())
        : Column(
        children: [
          // Seat Legend
          Container(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
            color: Colors.white,
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildLegendItem('Available', Colors.green),
                    _buildLegendItem('Booked', Colors.red),
                    _buildLegendItem('Selected', Colors.blue),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text("Total Available: $availableSeatsCount", style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                    const SizedBox(width: 24),
                    Text("Total Booked: $bookedSeatsCount", style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
                  ],
                ),
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
                    itemCount: (totalSeats / 4).ceil() * 5, // Dynamically calculate rows
                    itemBuilder: (context, index) {
                      int row = index ~/ 5;
                      int col = index % 5;
                      
                      // If it's the 3rd column (index 2), it's the aisle
                      if (col == 2) {
                        return const SizedBox.shrink();
                      }
                      
                      // Map grid index to seat number
                      int seatIndex = (row * 4) + (col > 2 ? col - 1 : col) + 1;
                      
                      if (seatIndex > totalSeats) return const SizedBox.shrink();
                      
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
                      'Total: Rs. ${(_selectedSeatsByUser.length * _pricePerSeat).toStringAsFixed(2)}',
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
                            totalAmount: _selectedSeatsByUser.length * _pricePerSeat,
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