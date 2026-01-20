import 'package:flutter/material.dart';
import 'package:mobile_app/widgets/custom_button.dart';
import 'package:mobile_app/widgets/custom_textfield.dart';

class IssueTicketScreen extends StatelessWidget {
  final int seatNo;

  const IssueTicketScreen({super.key, required this.seatNo});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Issue Ticket")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text("Seat No: $seatNo"),
            CustomTextField(hint: "Passenger Name"),
            CustomTextField(hint: "Drop Location"),

            const SizedBox(height: 20),
            CustomButton(text: "Confirm Ticket", onTap: () {})
          ],
        ),
      ),
    );
  }
}
