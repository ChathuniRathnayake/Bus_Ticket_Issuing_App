import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../passenger/dashboard/profile_screen.dart';
import '../passenger/auth/passenger_login.dart';

class PassengerAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final bool showBackButton;
  final bool showTitle; // explicitly show the title text next to logo

  const PassengerAppBar({
    super.key,
    required this.title,
    this.showBackButton = false,
    this.showTitle = false,
  });

  Future<String> _getPassengerName() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return "Passenger";

    if (user.displayName != null && user.displayName!.isNotEmpty) {
      return user.displayName!;
    }

    try {
      final doc = await FirebaseFirestore.instance
          .collection('passengers')
          .doc(user.uid)
          .get();
      return doc.data()?['name'] ?? "Passenger";
    } catch (e) {
      return "Passenger";
    }
  }

  @override
  Widget build(BuildContext context) {
    final canPop = Navigator.of(context).canPop();
    final showBack = showBackButton || canPop;

    return AppBar(
      backgroundColor: Colors.transparent,
      elevation: 0,
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
        children: [
          // Back button – always white, shown when canPop or explicitly requested
          if (showBack)
            IconButton(
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
              icon: const Icon(Icons.arrow_back, color: Colors.white, size: 26),
              onPressed: () {
                if (Navigator.of(context).canPop()) {
                  Navigator.of(context).pop();
                }
              },
            )
          else
            const SizedBox(width: 4),

          const SizedBox(width: 8),

          // Logo
          Image.asset(
            'assets/images/logo.png',
            height: 48,
            fit: BoxFit.contain,
            color: Colors.white,
          ),

          const SizedBox(width: 8),

          // Page title (only when explicitly requested)
          if (showTitle && title.isNotEmpty)
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            )
          else
            const Spacer(),

          // Passenger name pill
          FutureBuilder<String>(
            future: _getPassengerName(),
            builder: (context, snapshot) {
              final name = snapshot.data ?? "";
              return GestureDetector(
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ProfileScreen()),
                ),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFF00ACC1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.person, size: 15, color: Colors.white),
                      const SizedBox(width: 4),
                      ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 80),
                        child: Text(
                          name,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),

          const SizedBox(width: 4),

          // Logout button
          IconButton(
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
            icon: const Icon(Icons.logout, color: Colors.white, size: 22),
            onPressed: () async {
              await FirebaseAuth.instance.signOut();
              if (context.mounted) {
                Navigator.of(context).pushAndRemoveUntil(
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