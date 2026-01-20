import 'package:flutter/material.dart';

class SeatMapScreen extends StatelessWidget {
  const SeatMapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Seat Map'),
        backgroundColor: const Color(0xFF4993FA),
      ),
      body: const Center(
        child: Text(
          'Seat Map will be displayed here',
          style: TextStyle(fontSize: 18),
        ),
      ),
    );
  }
}
