import 'package:flutter/material.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Fullstack Challenge',
      home: Scaffold(
        appBar: AppBar(
          title: Text('Welcome to AutoDelegate'),
        ),
        body: Center(
          child: Text('Hello World'),
        ),
      ),
    );
  }
}