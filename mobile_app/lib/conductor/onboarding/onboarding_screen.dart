import 'package:flutter/material.dart';
import '../../widgets/custom_button.dart';
import '../auth/conductor_login.dart';

class ConductorOnboardingScreen extends StatefulWidget {
  const ConductorOnboardingScreen({super.key});

  @override
  State<ConductorOnboardingScreen> createState() => _ConductorOnboardingScreenState();
}

class _ConductorOnboardingScreenState extends State<ConductorOnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingData> _pages = [
    OnboardingData(
      title: "Welcome Conductor",
      subtitle: "Manage your bus route and passengers with ease.",
      imagePaths: ['assets/images/logo.png'],
      buttonText1: "Next",
    ),
    OnboardingData(
      title: "Validate Tickets",
      description: "Quickly scan passenger QR codes or validate tickets manually to ensure a smooth boarding process.",
      icon: Icons.qr_code_scanner,
      buttonText1: "Next",
      buttonText2: "Previous",
    ),
    OnboardingData(
      title: "Real-time Seat Management",
      subtitle: "Keep track of seat availability.",
      highlights: [
        "Live seat updates",
        "Manage passenger boarding",
        "Route progress tracking",
      ],
      icon: Icons.event_seat,
      buttonText1: "Get Started",
      buttonText2: "Previous",
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
      MaterialPageRoute(builder: (_) => const ConductorLoginScreen()),
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
  final String buttonText1; 
  final String? buttonText2; 
  final IconData? icon;
  final List<String>? imagePaths;

  OnboardingData({
    required this.title,
    this.subtitle,
    this.description,
    this.highlights,
    required this.buttonText1,
    this.buttonText2,
    this.icon,
    this.imagePaths,
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
            Color(0xFFE3F2FD),
            Color(0xFFF5F7FB),
          ],
          stops: [0.0, 0.5, 0.8, 0.81],
        ),
      ),
      child: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: currentPage == 0
                  ? const SizedBox(height: 48) 
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Image.asset(
                              'assets/images/logo.png',
                              height: 30,
                              errorBuilder: (context, error, stackTrace) => const Icon(
                                Icons.directions_bus,
                                color: Colors.white,
                                size: 24,
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
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 30),
              child: Column(
                children: [
                  if (data.imagePaths != null)
                    Column(
                      children: data.imagePaths!.asMap().entries.map((entry) {
                        String path = entry.value;
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 0),
                          child: Image.asset(
                            path,
                            height: 120,
                            fit: BoxFit.contain,
                            errorBuilder: (context, error, stackTrace) => const Icon(
                              Icons.image_not_supported,
                              size: 100,
                              color: Colors.white,
                            ),
                          ),
                        );
                      }).toList(),
                    )
                  else if (data.icon != null)
                    Icon(
                      data.icon,
                      size: 150,
                      color: Colors.white,
                    ),
                  const SizedBox(height: 30),
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
                  const SizedBox(height: 30),
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
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 60),
              child: Row(
                children: [
                  if (currentPage > 0)
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(right: 15),
                        child: SizedBox(
                          height: 55,
                          child: CustomButton(
                            text: data.buttonText2 ?? "Previous",
                            onTap: onPrevious,
                          ),
                        ),
                      ),
                    ),
                  Expanded(
                    child: SizedBox(
                      height: 55,
                      child: CustomButton(
                        text: data.buttonText1,
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
