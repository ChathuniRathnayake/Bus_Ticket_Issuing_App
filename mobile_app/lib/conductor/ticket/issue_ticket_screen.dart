import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../core/services/conductor_data_service.dart';
import '../../models/bus_model.dart';
import '../../models/conductor_model.dart';
import '../../models/route_model.dart';
import '../auth/conductor_login.dart';
import '../conductor_bottom_nav.dart';
import '../seat_map/seat_map_screen.dart';

class IssueTicketScreen extends StatefulWidget {
  final int? seatNo;
  final Bus? bus;
  final Conductor conductor;
  final RouteModel? route;

  const IssueTicketScreen({
    super.key,
    this.seatNo,
    this.bus,
    required this.conductor,
    this.route,
  });

  @override
  State<IssueTicketScreen> createState() => _IssueTicketScreenState();
}

class _IssueTicketScreenState extends State<IssueTicketScreen> {
  final ConductorDataService _service = ConductorDataService();

  // Route / stop data loaded from service
  List<String> _uniqueStops = [];
  List<int> _stopFares = [];
  bool _isLoadingRoute = true;
  String? _routeLoadError;

  // Selections
  String? _boardingStop;
  String? _dropStop;
  int? _selectedSeatNo;

  final TextEditingController _passengerNameController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  bool _isLoading = false;

  String get _routeId =>
      widget.route?.id ?? widget.bus?.routeId ?? widget.conductor.routeId ?? '';

  String get _busId => widget.bus?.id ?? widget.conductor.busId ?? '';

  @override
  void initState() {
    super.initState();
    _selectedSeatNo = widget.seatNo;
    _loadRouteData();
  }

  @override
  void dispose() {
    _passengerNameController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  Future<void> _loadRouteData() async {
    if (_routeId.isEmpty) {
      setState(() {
        _routeLoadError = 'No route ID found for this conductor.';
        _isLoadingRoute = false;
      });
      return;
    }

    try {
      final stops = await _service.getStopsForRoute(_routeId);
      final fares = await _service.getStopFaresForRoute(_routeId);

      if (!mounted) return;
      setState(() {
        _uniqueStops = stops;
        _stopFares = fares;
        _isLoadingRoute = false;

        if (_uniqueStops.isNotEmpty) {
          _boardingStop ??= _uniqueStops.first;
          _dropStop ??= _uniqueStops.last;
        }
      });

      // Auto-fill price after first load
      _updateFare();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _routeLoadError = 'Failed to load route: $e';
        _isLoadingRoute = false;
      });
    }
  }

  void _updateFare() {
    if (_stopFares.isEmpty || _boardingStop == null || _dropStop == null) return;
    if (_priceController.text.isNotEmpty) return; // don't overwrite manual entry

    final fromIdx = _uniqueStops.indexOf(_boardingStop!);
    final toIdx = _uniqueStops.indexOf(_dropStop!);

    if (fromIdx == -1 || toIdx == -1) return;
    if (fromIdx >= _stopFares.length || toIdx >= _stopFares.length) return;

    final fareCents = (_stopFares[toIdx] - _stopFares[fromIdx]).abs();
    final fareRupees = fareCents / 100.0;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _priceController.text = fareRupees.toStringAsFixed(2);
    });
  }

  Future<void> _issueTicket() async {
    if (_busId.isEmpty || _routeId.isEmpty) {
      _showSnack('Missing bus or route information.');
      return;
    }
    if (_selectedSeatNo == null) {
      _showSnack('Please select a seat number.');
      return;
    }
    if (_boardingStop == null || _dropStop == null) {
      _showSnack('Please select boarding and drop stops.');
      return;
    }
    final priceText = _priceController.text.trim();
    if (priceText.isEmpty) {
      _showSnack('Please enter a ticket price.');
      return;
    }

    setState(() => _isLoading = true);
    try {
      final activeSchedule = await _service.getActiveSchedule(_busId);
      final scheduleId = activeSchedule?['id']?.toString();
      
      // Fallback to today's date if no schedule is found
      final today = DateTime.now();
      final fallbackDateStr = "${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}";
      final dateStr = activeSchedule?['date']?.toString() ?? fallbackDateStr;

      await _service.issueTicket(
        busId: _busId,
        routeId: _routeId,
        seatNo: _selectedSeatNo!,
        passengerName: _passengerNameController.text.trim(),
        boardingStop: _boardingStop!,
        dropStop: _dropStop!,
        price: double.tryParse(priceText) ?? 0.0,
        conductorId: widget.conductor.id.isNotEmpty
            ? widget.conductor.id
            : widget.conductor.conductorId,
        date: dateStr,
        scheduleId: scheduleId,
      );

      if (!mounted) return;
      _showSnack('Ticket Issued Successfully!');
      Navigator.pop(context);
    } catch (e) {
      _showSnack('Failed to issue ticket: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  // ─── BUILD ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1FAFB),
      appBar: _buildAppBar(),
      body: _isLoadingRoute
          ? const Center(child: CircularProgressIndicator())
          : _routeLoadError != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text(_routeLoadError!,
                        style: const TextStyle(color: Colors.red)),
                  ),
                )
              : _uniqueStops.isEmpty
                  ? const Center(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: Text(
                          "No stops found for this route.\nPlease check your Firestore 'routes' collection.",
                          textAlign: TextAlign.center,
                        ),
                      ),
                    )
                  : _buildForm(),
      bottomNavigationBar: ConductorBottomNav(
        conductor: widget.conductor,
        bus: widget.bus,
        route: widget.route,
        initialIndex: 2,
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return PreferredSize(
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
            IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white, size: 28),
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (_) => SeatMapScreen(
                      conductor: widget.conductor,
                      bus: widget.bus,
                      route: widget.route,
                    ),
                  ),
                );
              },
            ),
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
                        widget.conductor.name,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                            color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.logout, color: Colors.white, size: 28),
              onPressed: () => Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const ConductorLoginScreen()),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildForm() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _infoCard('Bus ID', _busId.isNotEmpty ? _busId : 'Unknown'),
          _buildSeatSelector(),
          _buildTextInputRow('Passenger Name', _passengerNameController,
              hint: 'Enter Name'),

          // Boarding stop
          _buildDropdownRow('Boarding Stop', _uniqueStops, _boardingStop,
              (val) {
            setState(() {
              _boardingStop = val!;
              _priceController.clear();
            });
            _updateFare();
          }),

          // Drop stop
          _buildDropdownRow('Drop Stop', _uniqueStops, _dropStop, (val) {
            setState(() {
              _dropStop = val!;
              _priceController.clear();
            });
            _updateFare();
          }),

          _buildTextInputRow('Ticket Price (Rs)', _priceController,
              hint: '0.00', keyboardType: TextInputType.number),

          const Spacer(),
          SizedBox(
            width: double.infinity,
            height: 55,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4993FA),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: _isLoading ? null : _issueTicket,
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('ISSUE TICKET',
                      style: TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  // ─── SEAT SELECTOR ─────────────────────────────────────────────────────────

  Widget _buildSeatSelector() {
    if (_busId.isEmpty) return _buildSeatDropdownRow(const []);

    return StreamBuilder<DocumentSnapshot>(
      stream: FirebaseFirestore.instance
          .collection('buses')
          .doc(_busId)
          .snapshots(),
      builder: (context, busSnap) {
        int totalSeats = widget.bus?.totalSeats ?? 42;
        if (busSnap.hasData && busSnap.data!.exists) {
          final d = busSnap.data!.data() as Map<String, dynamic>;
          totalSeats = int.tryParse(d['totalSeats']?.toString() ?? '0') ??
              int.tryParse(d['capacity']?.toString() ?? '0') ??
              totalSeats;
        }
        if (totalSeats <= 0) totalSeats = 42;

        return FutureBuilder<Map<String, dynamic>?>(
          future: _service.getActiveSchedule(_busId),
          builder: (context, scheduleSnap) {
            if (scheduleSnap.connectionState == ConnectionState.waiting) {
              return _buildSeatDropdownRow([]);
            }
            final today = DateTime.now();
            final fallbackDateStr = "${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}";
            final activeDate = scheduleSnap.data?['date']?.toString() ?? fallbackDateStr;

            return StreamBuilder<QuerySnapshot>(
              stream: FirebaseFirestore.instance
                  .collection('seats')
                  .where('busId', isEqualTo: _busId)
                  .where('date', isEqualTo: activeDate)
                  .snapshots(),
              builder: (context, seatsSnap) {
            final Set<int> booked = {};
            if (seatsSnap.hasData) {
              for (var doc in seatsSnap.data!.docs) {
                final d = doc.data() as Map<String, dynamic>;
                final raw = d['seatNo'];
                final n = raw is int
                    ? raw
                    : int.tryParse(raw?.toString() ?? '');
                if (n != null) booked.add(n);
              }
            }

            final available = [
              for (int i = 1; i <= totalSeats; i++)
                if (!booked.contains(i) || i == _selectedSeatNo) i,
            ];

            if (_selectedSeatNo != null &&
                !available.contains(_selectedSeatNo)) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (mounted) setState(() => _selectedSeatNo = null);
              });
            }

            return _buildSeatDropdownRow(available);
          },
        );
          },
        );
      },
    );
  }

  // ─── REUSABLE WIDGETS ──────────────────────────────────────────────────────

  Widget _buildSeatDropdownRow(List<int> seats) {
    final value = seats.contains(_selectedSeatNo) ? _selectedSeatNo : null;
    return _card(
      Row(
        children: [
          const Expanded(
            flex: 1,
            child: Text('Seat Number',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
          ),
          const SizedBox(width: 8),
          Expanded(
            flex: 2,
            child: Align(
              alignment: Alignment.centerRight,
              child: DropdownButton<int>(
                isExpanded: true,
                value: value,
                underline: const SizedBox(),
                hint: const Align(
                  alignment: Alignment.centerRight,
                  child: Text('Select',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                ),
                items: seats
                    .map((s) => DropdownMenuItem(
                        value: s,
                        child: Align(
                          alignment: Alignment.centerRight,
                          child: Text(s.toString(),
                              style: const TextStyle(fontWeight: FontWeight.bold)),
                        )))
                    .toList(),
                onChanged: seats.isEmpty
                    ? null
                    : (val) => setState(() => _selectedSeatNo = val),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDropdownRow(String title, List<String> items,
      String? currentValue, ValueChanged<String?> onChanged) {
    return _card(
      Row(
        children: [
          Expanded(
            flex: 1,
            child: Text(title,
                style: const TextStyle(
                    fontSize: 16, fontWeight: FontWeight.w500)),
          ),
          const SizedBox(width: 8),
          Expanded(
            flex: 2,
            child: Align(
              alignment: Alignment.centerRight,
              child: DropdownButton<String>(
                isExpanded: true,
                value: currentValue,
                underline: const SizedBox(),
                items: items
                    .map((e) => DropdownMenuItem(
                        value: e,
                        child: Align(
                          alignment: Alignment.centerRight,
                          child: Text(e,
                              style:
                                  const TextStyle(fontWeight: FontWeight.bold),
                              overflow: TextOverflow.ellipsis),
                        )))
                    .toList(),
                onChanged: onChanged,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextInputRow(String title, TextEditingController controller,
      {String? hint,
      TextInputType keyboardType = TextInputType.text}) {
    return _card(
      Row(
        children: [
          Expanded(
            flex: 1,
            child: Text(title,
                style: const TextStyle(
                    fontSize: 16, fontWeight: FontWeight.w500)),
          ),
          const SizedBox(width: 8),
          Expanded(
            flex: 2,
            child: TextField(
              controller: controller,
              keyboardType: keyboardType,
              textAlign: TextAlign.right,
              style: const TextStyle(fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                  border: InputBorder.none, hintText: hint),
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoCard(String title, String value) {
    return _card(
      Row(
        children: [
          Expanded(
            flex: 1,
            child: Text(title,
                style: const TextStyle(
                    fontSize: 16, fontWeight: FontWeight.w500)),
          ),
          const SizedBox(width: 8),
          Expanded(
            flex: 2,
            child: Text(value,
                textAlign: TextAlign.right,
                style: const TextStyle(
                    fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _card(Widget child) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFA0E4F1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: child,
    );
  }
}