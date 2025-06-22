// driver_tracking_v6.dart
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:location/location.dart';

class DriverTrackingV6 extends StatefulWidget {
  @override
  _DriverTrackingV6State createState() => _DriverTrackingV6State();
}

class _DriverTrackingV6State extends State<DriverTrackingV6> {
  GoogleMapController? _mapController;
  Location _location = Location();
  Set<Polyline> _polylines = {};
  List<LatLng> _path = [];

  @override
  void initState() {
    super.initState();
    _initLocationTracking();
  }

  void _initLocationTracking() async {
    bool serviceEnabled = await _location.serviceEnabled();
    if (!serviceEnabled) serviceEnabled = await _location.requestService();
    if (!serviceEnabled) return;

    PermissionStatus permissionGranted = await _location.hasPermission();
    if (permissionGranted == PermissionStatus.denied) {
      permissionGranted = await _location.requestPermission();
    }
    if (permissionGranted != PermissionStatus.granted) return;

    _location.onLocationChanged.listen((locationData) {
      if (locationData.latitude != null && locationData.longitude != null) {
        final point = LatLng(locationData.latitude!, locationData.longitude!);
        setState(() {
          _path.add(point);
          _polylines = {
            Polyline(
              polylineId: PolylineId('route'),
              points: _path,
              color: Colors.blue,
              width: 4,
            )
          };
        });
        _mapController?.animateCamera(CameraUpdate.newLatLng(point));
        _uploadLocation(locationData);
      }
    });
  }

  void _uploadLocation(LocationData data) {
    FirebaseFirestore.instance.collection('driver_tracking').add({
      'latitude': data.latitude,
      'longitude': data.longitude,
      'accuracy': data.accuracy,
      'speed': data.speed,
      'timestamp': FieldValue.serverTimestamp(),
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Driver Tracking V6')),
      body: GoogleMap(
        initialCameraPosition: CameraPosition(
          target: LatLng(46.8721, -113.9940), // Missoula
          zoom: 14,
        ),
        onMapCreated: (controller) => _mapController = controller,
        polylines: _polylines,
        myLocationEnabled: true,
        myLocationButtonEnabled: true,
      ),
    );
  }
}
