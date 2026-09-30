import 'package:flutter/material.dart';
import '../../models/route_model.dart';
import '../../widgets/passenger_app_bar.dart';

class RouteDetailsScreen extends StatefulWidget {
  final RouteModel route;

  const RouteDetailsScreen({super.key, required this.route});

  @override
  State<RouteDetailsScreen> createState() => _RouteDetailsScreenState();
}

class _RouteDetailsScreenState extends State<RouteDetailsScreen> {
  List<String> _allStops = [];
  List<String> _filteredStops = [];
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _initializeStops();
    _searchController.addListener(_filterStops);
  }

  void _initializeStops() {
    // Add start stop
    if (widget.route.startStop.isNotEmpty) {
      _allStops.add(widget.route.startStop);
    }
    
    // Add intermediate stops
    if (widget.route.stops != null) {
      for (var s in widget.route.stops!) {
        if (s is String) _allStops.add(s);
        else if (s is Map && s['name'] != null) _allStops.add(s['name'].toString());
      }
    }
    
    // Add end stop
    if (widget.route.endStop.isNotEmpty) {
      _allStops.add(widget.route.endStop);
    }
    
    // Remove duplicates while preserving order
    _allStops = _allStops.toSet().toList();
    _filteredStops = List.from(_allStops);
  }

  void _filterStops() {
    String query = _searchController.text.toLowerCase();
    setState(() {
      if (query.isEmpty) {
        _filteredStops = List.from(_allStops);
      } else {
        _filteredStops = _allStops.where((stop) => stop.toLowerCase().contains(query)).toList();
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      appBar: PassengerAppBar(
        title: widget.route.routeName,
        showBackButton: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Route Header Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1B56FD), Color(0xFF4993FA)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.blue.withOpacity(0.3),
                    blurRadius: 15,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                children: [
                  const Icon(Icons.directions_bus, color: Colors.white, size: 48),
                  const SizedBox(height: 12),
                  Text(
                    widget.route.routeName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'Route ID: ${widget.route.id}',
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Details Card
            _buildSectionHeader('Route Journey'),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Column(
                children: [
                  _buildDetailRow(
                    Icons.location_on,
                    'Start Stop',
                    widget.route.startStop,
                    Colors.green,
                  ),
                  const Padding(
                    padding: EdgeInsets.only(left: 40),
                    child: Divider(height: 30),
                  ),
                  _buildDetailRow(
                    Icons.flag,
                    'End Stop',
                    widget.route.endStop,
                    Colors.red,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Time and Price Card
            _buildSectionHeader('Schedule & Pricing'),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: _buildInfoBlock(
                          Icons.access_time,
                          'Departure',
                          widget.route.departureTime ?? 'N/A',
                          Colors.blue,
                        ),
                      ),
                      Container(width: 1, height: 40, color: Colors.grey[200]),
                      Expanded(
                        child: _buildInfoBlock(
                          Icons.timer_outlined,
                          'Arrival',
                          widget.route.arrivalTime ?? 'N/A',
                          Colors.orange,
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 30),
                  _buildDetailRow(
                    Icons.payments_outlined,
                    'Full Ticket Price',
                    widget.route.price ?? 'N/A',
                    Colors.blue,
                  ),
                ],
              ),
            ),
            
            if (_allStops.isNotEmpty) ...[
              const SizedBox(height: 24),
              _buildSectionHeader('All Stops'),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: 'Search stops...',
                        prefixIcon: const Icon(Icons.search),
                        filled: true,
                        fillColor: Colors.grey[100],
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                    const SizedBox(height: 16),
                    _filteredStops.isEmpty 
                      ? const Padding(
                          padding: EdgeInsets.all(16.0),
                          child: Text("No stops found", style: TextStyle(color: Colors.grey)),
                        )
                      : ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _filteredStops.length,
                          separatorBuilder: (context, index) => const Divider(),
                          itemBuilder: (context, index) {
                            final stopName = _filteredStops[index];
                            final isStart = stopName == widget.route.startStop;
                            final isEnd = stopName == widget.route.endStop;
                            
                            return ListTile(
                              leading: CircleAvatar(
                                radius: 14,
                                backgroundColor: isStart ? Colors.green.shade50 : (isEnd ? Colors.red.shade50 : Colors.blue.shade50),
                                child: Icon(
                                  isStart ? Icons.location_on : (isEnd ? Icons.flag : Icons.fiber_manual_record),
                                  size: 16,
                                  color: isStart ? Colors.green : (isEnd ? Colors.red : Colors.blue),
                                ),
                              ),
                              title: Text(
                                stopName,
                                style: TextStyle(
                                  fontWeight: (isStart || isEnd) ? FontWeight.bold : FontWeight.normal,
                                ),
                              ),
                              dense: true,
                            );
                          },
                        ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 12),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Color(0xFF333333),
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value, Color color) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
            Text(
              value,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF333333),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildInfoBlock(IconData icon, String label, String value, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}