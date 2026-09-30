import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../widgets/custom_button.dart';
import '../passenger_bottom_nav.dart';
import '../auth/passenger_login.dart';
import 'bus_results_screen.dart';
import '../../core/services/passenger_data_service.dart';
import '../../models/route_model.dart';
import 'my_tickets_screen.dart';
import 'profile_screen.dart';
import 'route_details_screen.dart';
import '../../core/services/passenger_auth_service.dart';
import '../../models/halt_model.dart';
import '../../models/schedule_model.dart';
import '../../widgets/passenger_app_bar.dart';

class PassengerDashboard extends StatefulWidget {
  const PassengerDashboard({super.key});

  @override
  State<PassengerDashboard> createState() => _PassengerDashboardState();
}

class _PassengerDashboardState extends State<PassengerDashboard> {
  DateTime? _selectedDate;
  String? _fromStop;
  String? _toStop;
  int _selectedIndex = 0;

  final PassengerDataService _dataService = PassengerDataService();
  List<ScheduleModel> _availableSchedules = [];
  bool _isLoadingSchedules = true;

  @override
  void initState() {
    super.initState();
    _loadSchedules();
  }

  Future<void> _loadSchedules() async {
    try {
      final schedules = await _dataService.getAvailableSchedules();
      setState(() {
        _availableSchedules = schedules;
        _isLoadingSchedules = false;
      });
    } catch (e) {
      print("Error loading schedules: $e");
      setState(() => _isLoadingSchedules = false);
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2101),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Widget _buildLoadingDropdown(String hint) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF0F7FF),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(hint, style: const TextStyle(color: Colors.grey)),
          const SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
        ],
      ),
    );
  }

  void _onItemTapped(int index) {
    if (index == _selectedIndex) return;
    
    if (index == 2) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const MyTicketsScreen()),
      );
    } else if (index == 3) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const ProfileScreen()),
      );
    } else {
      setState(() {
        _selectedIndex = index;
      });
    }
  }

  Widget _buildSearchSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Find Your Bus',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Color(0xFF333333),
          ),
        ),
        const SizedBox(height: 20),
        
        // Search Section
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
              // Date Picker
              GestureDetector(
                onTap: () => _selectDate(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0F7FF),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.calendar_today, color: Colors.blue),
                      const SizedBox(width: 12),
                      Text(
                        _selectedDate == null
                            ? 'Choose Date'
                            : DateFormat('yyyy-MM-dd').format(_selectedDate!),
                        style: TextStyle(
                          color: _selectedDate == null ? Colors.grey : Colors.black,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              
              // From Dropdown
              StreamBuilder<List<String>>(
                stream: _dataService.getBusStopsStream(),
                builder: (context, snapshot) {
                  final stops = snapshot.data ?? [];
                  if (snapshot.connectionState == ConnectionState.waiting && stops.isEmpty) {
                    return _buildLoadingDropdown('From');
                  }
                  
                  final List<String> dropdownItems = ['All Starting Points', ...stops];
                  
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0F7FF),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _fromStop == "Not Selected" || _fromStop == null ? 'All Starting Points' : (dropdownItems.contains(_fromStop) ? _fromStop : 'All Starting Points'),
                        isExpanded: true,
                        items: dropdownItems.map((String stop) {
                          return DropdownMenuItem<String>(
                            value: stop,
                            child: Text(stop),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() => _fromStop = (value == 'All Starting Points' ? "Not Selected" : value));
                        },
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 16),
              
              // To Dropdown
              StreamBuilder<List<String>>(
                stream: _dataService.getBusStopsStream(),
                builder: (context, snapshot) {
                  final stops = snapshot.data ?? [];
                  if (snapshot.connectionState == ConnectionState.waiting && stops.isEmpty) {
                    return _buildLoadingDropdown('To');
                  }

                  final List<String> dropdownItems = ['All Destinations', ...stops];

                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0F7FF),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _toStop == "Not Selected" || _toStop == null ? 'All Destinations' : (dropdownItems.contains(_toStop) ? _toStop : 'All Destinations'),
                        isExpanded: true,
                        items: dropdownItems.map((String stop) {
                          return DropdownMenuItem<String>(
                            value: stop,
                            child: Text(stop),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() => _toStop = (value == 'All Destinations' ? "Not Selected" : value));
                        },
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 24),
              
              // Search Button
              CustomButton(
                text: 'Search Buses',
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => BusResultsScreen(
                        from: _fromStop ?? "Not Selected",
                        to: _toStop ?? "Not Selected",
                        date: _selectedDate != null
                            ? DateFormat('yyyy-MM-dd').format(_selectedDate!)
                            : "Today",
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHomeTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSearchSection(),
          const SizedBox(height: 32),
          const Text(
            'Available Bus Schedules',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF333333),
            ),
          ),
          const SizedBox(height: 16),
          _isLoadingSchedules
              ? const Center(child: CircularProgressIndicator())
              : _availableSchedules.isEmpty
                  ? const Center(child: Text("No upcoming schedules found for today."))
                  : ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _availableSchedules.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final schedule = _availableSchedules[index];
                        return Container(
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
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      schedule.routeName ?? 'Unknown Route',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                    ),
                                  ),
                                  Text(
                                    schedule.departureTime,
                                    style: const TextStyle(
                                      color: Colors.blue,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                                  const SizedBox(width: 4),
                                  Text(
                                    schedule.date,
                                    style: TextStyle(color: Colors.grey[600], fontSize: 12),
                                  ),
                                  const Spacer(),
                                  const Icon(Icons.directions_bus, size: 14, color: Colors.grey),
                                  const SizedBox(width: 4),
                                  Text(
                                    schedule.busPlateNumber ?? 'Unknown Bus',
                                    style: TextStyle(color: Colors.grey[600], fontSize: 12),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildFindTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSearchSection(),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        if (_selectedIndex == 1) {
          setState(() {
            _selectedIndex = 0;
          });
          return false;
        } else if (_selectedIndex == 0) {
          final PassengerAuthService authService = PassengerAuthService();
          await authService.logout();
          if (mounted) {
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (_) => const LoginScreen()),
              (route) => false,
            );
          }
          return false;
        }
        return true;
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF5F7FB),
        appBar: const PassengerAppBar(title: 'TicketGo', showBackButton: false),
        body: _selectedIndex == 0 ? _buildHomeTab() : _buildFindTab(),
        bottomNavigationBar: PassengerBottomNav(
          currentIndex: _selectedIndex,
          onTap: _onItemTapped,
        ),
      ),
    );
  }
}