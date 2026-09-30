import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../passenger/auth/passenger_login.dart';

class PassengerAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title; // Kept for compatibility but unused in UI
  final bool showBackButton; // Always showing back button as requested, but keeping parameter

  const PassengerAppBar({
    super.key,
    required this.title,
    this.showBackButton = true,
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
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: const Icon(
                  Icons.arrow_back,
                  color: Colors.white,
                  size: 28,
                ),
                onPressed: () async {
                  final nav = Navigator.of(context);
                  if (await nav.maybePop()) {
                    return;
                  }
                },
              ),
              Image.asset(
                'assets/images/logo.png',
                height: 48,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) => const Icon(Icons.directions_bus, color: Colors.white, size: 36),
              ),
            ],
          ),
          Flexible(
            child: FutureBuilder<String>(
              future: _getPassengerName(),
              builder: (context, snapshot) {
                final name = snapshot.data ?? "Loading...";
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF00ACC1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.person, size: 16, color: Colors.white),
                      const SizedBox(width: 4),
                      Flexible(
                        child: Text(
                          name,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white, size: 28),
            onPressed: () async {
              await FirebaseAuth.instance.signOut();
              if (context.mounted) {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                  (route) => false,
                );
              }
            },
          ),
        ],
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}