
import 'package:flutter/material.dart';
import 'package:mobile_app/conductor/info/info_card.dart';

class TripInfoScreen extends StatelessWidget {
  const TripInfoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1FAFB),
      appBar: AppBar(
        title: const Text('Trip Information'),
        backgroundColor: const Color(0xFF4993FA),
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _tripHeader(),
            const SizedBox(height: 16),
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                children: const [
                  InfoCard(
                    title: 'Boarded',
                    count: 32,
                    icon: Icons.check_circle,
                    color: Colors.green,
                  ),
                  InfoCard(
                    title: 'Not Boarded',
                    count: 5,
                    icon: Icons.hourglass_bottom,
                    color: Colors.orange,
                  ),
                  InfoCard(
                    title: 'Dropping\nNext Stop',
                    count: 8,
                    icon: Icons.arrow_downward,
                    color: Colors.red,
                  ),
                  InfoCard(
                    title: 'Boarding\nNext Stop',
                    count: 12,
                    icon: Icons.arrow_upward,
                    color: Colors.blue,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _tripHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFA0E4F1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Route: Colombo → Kandy',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 4),
          Text('Bus ID: BUS-1024'),
          Text('Next Stop: Peradeniya'),
        ],
      ),
    );
  }
}
