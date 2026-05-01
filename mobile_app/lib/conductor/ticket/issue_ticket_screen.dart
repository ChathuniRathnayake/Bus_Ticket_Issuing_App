import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:mobile_app/conductor/seat_map/seat_map_screen.dart';
import '../../models/bus_model.dart';
import '../../models/conductor_model.dart';
import '../../models/route_model.dart';
import '../auth/conductor_login.dart';
import '../conductor_bottom_nav.dart';

class IssueTicketScreen extends StatefulWidget {
  final int seatNo;
  final Bus? bus;
  final Conductor conductor;
  final RouteModel? route;

  const IssueTicketScreen({
    super.key,
    required this.seatNo,
    this.bus,
    required this.conductor,
    this.route,
  });

  @override
  State<IssueTicketScreen> createState() => _IssueTicketScreenState();
}

class _IssueTicketScreenState extends State<IssueTicketScreen> {
  String _passengerType = 'Adult';
  String? _boardingStop;
  String? _dropStop;
  final TextEditingController _passengerNameController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  bool _isLoading = false;



  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    _passengerNameController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1FAFB),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(kToolbarHeight),
        child: AppBar(
          automaticallyImplyLeading: false, // remove default back button
          flexibleSpace: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF1B56FD), // Bright blue
                  Color(0xFF4993FA), // Slightly lighter blue
                ],
              ),
            ),
          ),
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Back Button
              IconButton(
                icon: const Icon(
                  Icons.arrow_back,
                  color: Colors.white,
                  size: 28,
                ),
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
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 6,
                  ),
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
                          widget.conductor.name,
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
                    MaterialPageRoute(
                      builder: (_) => const ConductorLoginScreen(),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),

      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance
            .collection('routes')
            .where('routeId', isEqualTo: widget.route?.id ?? widget.bus?.routeId ?? widget.conductor.routeId)
            .limit(1)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Center(child: Text("Error: ${snapshot.error}", style: const TextStyle(color: Colors.red)));
          }

          String start = "";
          String end = "";

          // 1. Initial fallback from passed widget.route object
          if (widget.route != null) {
            start = widget.route!.startStop;
            end = widget.route!.endStop;
          }

          // 2. Override with live Firestore data if available
          if (snapshot.hasData && snapshot.data!.docs.isNotEmpty) {
            final doc = snapshot.data!.docs.first;
            final data = doc.data() as Map<String, dynamic>;
            start = data['startStop']?.toString() ?? data['startPoint']?.toString() ?? start;
            end = data['endStop']?.toString() ?? data['endPoint']?.toString() ?? end;
          }

          // 3. Collect stops (only start and end as requested)
          final List<String> stops = [];
          if (start.isNotEmpty) stops.add(start);
          if (end.isNotEmpty) stops.add(end);
          
          // Remove duplicates and ensure list isn't empty for dropdowns
          final uniqueStops = stops.toSet().toList();

          if (snapshot.connectionState == ConnectionState.waiting && uniqueStops.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (uniqueStops.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Text("No stops found for this route. Please check your Firestore 'routes' collection for 'startStop' and 'endStop' fields."),
              ),
            );
          }

          // Initialize selection if not set
          _boardingStop ??= uniqueStops.first;
          _dropStop ??= uniqueStops.last;
          
          // Safety check: ensure selection is still valid in the current list
          if (!uniqueStops.contains(_boardingStop)) _boardingStop = uniqueStops.first;
          if (!uniqueStops.contains(_dropStop)) _dropStop = uniqueStops.last;

          return Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _infoCard("Bus ID", widget.bus?.id ?? "BUS-101"),
                _infoCard("Seat Number", widget.seatNo.toString()),
                _buildTextInputRow("Passenger Name", _passengerNameController, hint: "Enter Name"),
                _buildDropdownRow("Passenger Type", ['Adult', 'Half', 'Free'], _passengerType, (val) {
                  setState(() => _passengerType = val!);
                }),
                
                // ✅ Boarding & Drop Stop selection using only start/end stops
                _buildDropdownRow("Boarding Stop", uniqueStops, _boardingStop, (val) {
                  setState(() => _boardingStop = val!);
                }),
                _buildDropdownRow("Drop Stop", uniqueStops, _dropStop, (val) {
                  setState(() => _dropStop = val!);
                }),
                
                _buildPriceInputRow(),
                const Spacer(),
                SizedBox(
                  width: double.infinity,
                  height: 55,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4993FA),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    onPressed: _isLoading ? null : _issueTicket,
                    child: _isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text(
                            "ISSUE TICKET",
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: ConductorBottomNav(
        conductor: widget.conductor,
        bus: widget.bus,
        route: widget.route,
        initialIndex: 2,
      ),
    );
  }
  Widget _buildDropdownRow(String title, List<String> items, String? currentValue, ValueChanged<String?> onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFA0E4F1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
          ),
          DropdownButton<String>(
            value: currentValue,
            underline: const SizedBox(),
            items: items.map((e) => DropdownMenuItem(value: e, child: Text(e, style: const TextStyle(fontWeight: FontWeight.bold)))).toList(),
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }

  Widget _buildPriceInputRow() {
    return _buildTextInputRow("Ticket Price (Rs)", _priceController, hint: "0.00", keyboardType: TextInputType.number);
  }

  Widget _buildTextInputRow(String title, TextEditingController controller, {String? hint, TextInputType keyboardType = TextInputType.text}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFA0E4F1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
          ),
          SizedBox(
            width: 150,
            child: TextField(
              controller: controller,
              keyboardType: keyboardType,
              textAlign: TextAlign.right,
              style: const TextStyle(fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                border: InputBorder.none,
                hintText: hint,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _issueTicket() async {
    final String? busId = widget.bus?.id ?? widget.conductor.busId;
    final String? routeId = widget.route?.id ?? widget.bus?.routeId ?? widget.conductor.routeId;

    if (busId == null || routeId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Missing Bus or Route Information for this Conductor")));
      return;
    }

    final priceText = _priceController.text.trim();
    if (priceText.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Please enter a ticket price")));
      return;
    }

    setState(() => _isLoading = true);

    try {
      final db = FirebaseFirestore.instance;
      
      // Save the ticket to seats collection
      await db.collection('seats').add({
        'busId': busId,
        'routeId': routeId,
        'seatNo': widget.seatNo,
        'passengerName': _passengerNameController.text.trim(),
        'passengerType': _passengerType,
        'boardingStop': _boardingStop,
        'dropStop': _dropStop,
        'price': double.tryParse(priceText) ?? 0.0,
        'issuedBy': widget.conductor.conductorId,
        'issuedAt': FieldValue.serverTimestamp(),
      });

      // Optionally update buses collection to increment bookedSeats and decrement availableSeats
      final busRef = db.collection('buses').doc(busId);
      
      db.runTransaction((transaction) async {
        final snapshot = await transaction.get(busRef);
        if (snapshot.exists) {
          final data = snapshot.data()!;
          int booked = int.tryParse(data['bookedSeats']?.toString() ?? '0') ?? 0;
          int available = int.tryParse(data['availableSeats']?.toString() ?? '0') ?? 0;
          
          transaction.update(busRef, {
            'bookedSeats': (booked + 1).toString(),
            'availableSeats': (available > 0 ? available - 1 : 0).toString(),
          });
        }
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Ticket Issued Successfully")));
      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Failed to issue ticket: $e")));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Widget _infoCard(String title, String value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFA0E4F1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
          ),
          Text(
            value,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}
