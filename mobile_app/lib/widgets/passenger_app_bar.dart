import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../passenger/dashboard/profile_screen.dart';

class PassengerAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final bool showBackButton;

  const PassengerAppBar({
    super.key,
    required this.title,
    this.showBackButton = false,
  });

  Future<String> _getPassengerName() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return "Passenger";
    
    if (user.displayName != null && user.displayName!.isNotEmpty) {
      return user.displayName!;
    }
    
    try {
      final doc = await FirebaseFirestore.instance.collection('passengers').doc(user.uid).get();
      return doc.data()?['name'] ?? "Passenger";
    } catch (e) {
      return "Passenger";
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      leading: showBackButton
          ? IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.black),
              onPressed: () => Navigator.of(context).pop(),
            )
          : null,
      title: Row(
        children: [
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                color: Color(0xFF1B56FD),
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 8),
          FutureBuilder<String>(
            future: _getPassengerName(),
            builder: (context, snapshot) {
              final name = snapshot.data ?? "Loading...";
              return GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ProfileScreen()),
                  );
                },
                child: Row(
                  children: [
                    Text(
                      name,
                      style: const TextStyle(
                        color: Colors.black87,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const CircleAvatar(
                      radius: 16,
                      backgroundColor: Color(0xFFF0F7FF),
                      child: Icon(Icons.person, size: 20, color: Colors.blue),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
