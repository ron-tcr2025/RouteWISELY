// end_project_v6.dart

import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class EndProjectV6 extends StatelessWidget {
  final String projectId;

  EndProjectV6({required this.projectId});

  void _completeProject(BuildContext context) {
    FirebaseFirestore.instance.collection('projects').doc(projectId).update({
      'status': 'completed',
      'completed_at': FieldValue.serverTimestamp(),
    }).then((_) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('✅ Project marked as complete!')),
      );
    }).catchError((error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('❌ Failed to complete project: $error')),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('End Project')),
      body: Center(
        child: ElevatedButton(
          onPressed: () => _completeProject(context),
          child: Text('Mark Project as Complete'),
        ),
      ),
    );
  }
}
