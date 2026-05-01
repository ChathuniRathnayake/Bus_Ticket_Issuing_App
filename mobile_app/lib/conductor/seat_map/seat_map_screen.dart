import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:mobile_app/models/bus_model.dart';
import 'package:mobile_app/models/conductor_model.dart';
import 'package:mobile_app/models/route_model.dart';
import 'package:mobile_app/core/models/seat_status.dart';
import 'package:mobile_app/conductor/conductor_bottom_nav.dart';
import '../auth/conductor_login.dart';
import 'seat_widget.dart';

class SeatMapScreen extends StatelessWidget {
  final Conductor conductor;
  final Bus? bus;
  final RouteModel? route;

  const SeatMapScreen({
    super.key,
    required this.conductor,
    this.bus,
    this.route,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1FAFB),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(kToolbarHeight),
        child: AppBar(
          automaticallyImplyLeading: false,
          flexibleSpace: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF1B56FD), Color(0xFF4993FA)],
              ),
            ),
          ),
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Back Button
              IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white, size: 28),
                onPressed: () {
                  if (Navigator.canPop(context)) {
                    Navigator.pop(context);
                  }
                },
              ),
              // Conductor Name pill
              Expanded(
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF00ACC1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.person, size: 16, color: Colors.white),
                      const SizedBox(width: 4),
                      Flexible(
                        child: Text(
                          conductor.name,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              // Logout Button
              IconButton(
                icon: const Icon(Icons.logout, color: Colors.white, size: 28),
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (_) => const ConductorLoginScreen()),
                  );
                },
              ),
            ],
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _legend(),
            const SizedBox(height: 16),
            Expanded(
              child: LayoutBuilder(builder: (context, constraints) {
                final seatWidth = (constraints.maxWidth - 32) / 5; // 5 columns width
                
                return StreamBuilder<DocumentSnapshot>(
                  stream: FirebaseFirestore.instance.collection('buses').doc(bus?.id).snapshots(),
                  builder: (context, busSnapshot) {
                    int totalSeats = (bus != null && bus!.totalSeats > 0) ? bus!.totalSeats : 42;
                    if (busSnapshot.hasData && busSnapshot.data!.exists) {
                      final data = busSnapshot.data!.data() as Map<String, dynamic>;
                      totalSeats = int.tryParse(data['totalSeats']?.toString() ?? '0') ?? 
                                   int.tryParse(data['capacity']?.toString() ?? '0') ?? 
                                   totalSeats;
                    }
                    if (totalSeats <= 0) totalSeats = 42;

                    return StreamBuilder<QuerySnapshot>(
                      stream: FirebaseFirestore.instance
                          .collection('seats')
                          .where('busId', isEqualTo: bus?.id)
                          .snapshots(),
                      builder: (context, snapshot) {
                        if (snapshot.hasError) {
                          return Center(child: Text("Error fetching seats: ${snapshot.error}"));
                        }
                        if (snapshot.connectionState == ConnectionState.waiting) {
                          return const Center(child: CircularProgressIndicator());
                        }
                        
                        Map<int, Map<String, dynamic>> bookedSeatsData = {};
                        if (snapshot.hasData) {
                          for (var doc in snapshot.data!.docs) {
                            final data = doc.data() as Map<String, dynamic>;
                            final int seatNo = int.tryParse(data['seatNo']?.toString() ?? '0') ?? 0;
                            bookedSeatsData[seatNo] = data;
                          }
                        }

                        // Determine rows. Usually rows have 4 seats, but last row might have 5.
                        // We check if (totalSeats - 5) is divisible by 4.
                        bool hasFiveSeatLastRow = (totalSeats % 4 == 1) || (totalSeats == 5);
                        int seatsForStandardRows = hasFiveSeatLastRow ? totalSeats - 5 : totalSeats;
                        int numStandardRows = (seatsForStandardRows / 4).ceil();
                        int totalRows = hasFiveSeatLastRow ? numStandardRows + 1 : numStandardRows;

                        return SingleChildScrollView(
                          child: Column(
                            children: List.generate(totalRows, (rowIndex) {
                              bool isLastRow = rowIndex == totalRows - 1;
                              
                              if (isLastRow && hasFiveSeatLastRow) {
                                int startingSeat = seatsForStandardRows + 1;
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: List.generate(5, (i) {
                                      return _buildSeat(startingSeat + i, bookedSeatsData, seatWidth);
                                    }),
                                  ),
                                );
                              }

                              int startingSeat = rowIndex * 4 + 1;
                              int remainingSeatsInStandard = seatsForStandardRows - startingSeat + 1;
                              int seatsInThisRow = remainingSeatsInStandard > 4 ? 4 : remainingSeatsInStandard;
                              
                              if (seatsInThisRow <= 0) return const SizedBox.shrink();

                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    // Left side (2 seats)
                                    Row(
                                      children: List.generate(2, (i) {
                                        if (i >= seatsInThisRow) return SizedBox(width: seatWidth);
                                        return Padding(
                                          padding: const EdgeInsets.only(right: 8),
                                          child: _buildSeat(startingSeat + i, bookedSeatsData, seatWidth),
                                        );
                                      }),
                                    ),
                                    // Aisle gap in middle
                                    // Right side (2 seats)
                                    Row(
                                      children: List.generate(2, (i) {
                                        if (i + 2 >= seatsInThisRow) return SizedBox(width: seatWidth);
                                        return Padding(
                                          padding: const EdgeInsets.only(left: 8),
                                          child: _buildSeat(startingSeat + 2 + i, bookedSeatsData, seatWidth),
                                        );
                                      }),
                                    ),
                                  ],
                                ),
                              );
                            }),
                          ),
                        );
                      },
                    );
                  }
                );
              }),
            ),
          ],
        ),
      ),
      bottomNavigationBar: ConductorBottomNav(
        conductor: conductor,
        bus: bus,
        route: route,
        initialIndex: 1,
      ),
    );
  }

  Widget _buildSeat(int seatNo, Map<int, Map<String, dynamic>> bookedSeatsData, double seatWidth) {
    SeatStatus status = SeatStatus.available;
    if (bookedSeatsData.containsKey(seatNo)) {
      status = SeatStatus.booked;
      // You can add logic for 'droppingNext' if your data model supports it later
    }
    
    return SizedBox(
      width: seatWidth - 8,
      height: 55,
      child: SeatWidget(
        seatNo: seatNo,
        status: status,
        bus: bus,
        conductor: conductor,
        route: route,
      ),
    );
  }

  Widget _legend() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: const [
        _LegendItem(color: Colors.green, label: "Available"),
        _LegendItem(color: Colors.red, label: "Booked"),
        _LegendItem(color: Colors.orange, label: "Dropping Next"),
      ],
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}