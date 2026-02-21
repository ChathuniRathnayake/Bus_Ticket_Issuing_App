import 'package:flutter/material.dart';
import '../../widgets/custom_button.dart';
import '../auth/passenger_login.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingData> _pages = [
    OnboardingData(
    imagePath: 'assets/images/logo.png',
      title: "Welcome to TicketGo",
      subtitle: "Travel smarter. Book faster. Ride easier.",
      imagePath: 'assets/images/logo.png',
      buttonText: "Next",
    ),
    OnboardingData(
      title: "Find Your Bus Easily",
      description: "Search buses by route and date.\nCheck live seat availability before booking.",
      icon: Icons.search,
      buttonText: "Next",
      buttonText: "Previous",
    ),
    OnboardingData(
      title: "Book Your Seat Anytime",
      subtitle: "Fast. Secure. Convenient.",
      highlights: [
        "Select your seat",
        "Instant booking confirmation",
        "Digital ticket with QR code",
      ],
      icon: Icons.confirmation_num,
      buttonText: "Get Started",
    ),
  ];

  void _onNext() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _navigateToLogin();
    }
  }

  void _onPrevious() {
    if (_currentPage > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _navigateToLogin() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const PassengerLoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          PageView.builder(
            controller: _pageController,
            itemCount: _pages.length,
            onPageChanged: (index) => setState(() => _currentPage = index),
            itemBuilder: (context, index) {
              return _OnboardingPage(
                data: _pages[index],
                currentPage: _currentPage,
                onNext: _onNext,
                onPrevious: _onPrevious,
                onSkip: _navigateToLogin,
              );
            },
          ),
          Positioned(
            bottom: 50,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                _pages.length,
                (index) => Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: _currentPage == index ? 24 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: _currentPage == index ? const Color(0xFF1B56FD) : Colors.grey[300],
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class OnboardingData {
  final String title;
  final String? subtitle;
  final String? description;
  final List<String>? highlights;
  final String buttonText;
  final IconData? icon;
  final String? imagePath;

  OnboardingData({
    required this.title,
    this.subtitle,
    this.description,
    this.highlights,
    required this.buttonText,
    this.icon,
    this.imagePath,
  });
}

class _OnboardingPage extends StatelessWidget {
  final OnboardingData data;
  final int currentPage;
  final VoidCallback onNext;
  final VoidCallback onPrevious;
  final VoidCallback onSkip;

  const _OnboardingPage({
    required this.data,
    required this.currentPage,
    required this.onNext,
    required this.onPrevious,
    required this.onSkip,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF1B56FD),
            Color(0xFF60B5FF),
            Colors.white,
          ],
          stops: [0.0, 0.4, 0.7],
        ),
      ),
      child: SafeArea(
        child: Column(
          children: [
            // Header with TicketGo and Skip (only shown after first page)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: currentPage == 0
                  ? const SizedBox(height: 48) // Maintain height for layout consistency
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: const [
                            Icon(Icons.directions_bus, color: Colors.white, size: 24),
                            SizedBox(width: 8),
                            Text(
                              "TicketGo",
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        TextButton(
                          onPressed: onSkip,
                          child: const Text(
                            "Skip",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
            ),
            const Spacer(),
            // Main Content
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 30),
              child: Column(
                children: [
                  if (data.imagePath != null)
                    Image.asset(
                      data.imagePath!,
                      height: 150,
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) => const Icon(
                        Icons.image_not_supported,
                        size: 150,
                        color: Colors.white,
                      ),
                    )
                  else if (data.icon != null)
                    Icon(
                      data.icon,
                      size: 150,
                      color: Colors.white,
                    ),
                  const SizedBox(height: 40),
                  Text(
                    data.title,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  if (data.subtitle != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      data.subtitle!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 18,
                        color: Color(0xCCFFFFFF),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                  const SizedBox(height: 40),
                  if (data.description != null || data.highlights != null)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          if (data.description != null)
                            Text(
                              data.description!,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.grey[700],
                                height: 1.5,
                              ),
                            ),
                          if (data.highlights != null) ...[
                            if (data.description != null) const SizedBox(height: 20),
                            ...data.highlights!.map((h) => Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.check_circle, color: Color(0xFF00ACC1), size: 22),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Text(
                                          h,
                                          style: const TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                )),
                          ],
                        ],
                      ),
                    ),
                ],
              ),
            ),
            const Spacer(flex: 2),
            // Navigation Buttons
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 80),
              child: Row(
                children: [
                  if (currentPage > 0)
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(right: 15),
                        child: SizedBox(
                          height: 55,
                          child: CustomButton(
                            text: "Previous",
                            onTap: onPrevious,
                          ),
                        ),
                      ),
                    ),
                  Expanded(
                    flex: 2,
                    child: SizedBox(
                      height: 55,
                      child: CustomButton(
                        text: data.buttonText,
                        onTap: onNext,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
