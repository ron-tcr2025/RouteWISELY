// map_v6.dart

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class RouteWiselyMap extends StatefulWidget {
  @override
  _RouteWiselyMapState createState() => _RouteWiselyMapState();
}

class _RouteWiselyMapState extends State<RouteWiselyMap> {
  GoogleMapController? _controller;
  static const LatLng _startLocation = LatLng(42.3601, -71.0589); // Boston

  final Set<Marker> _markers = {
    Marker(
      markerId: MarkerId('start'),
      position: _startLocation,
      infoWindow: InfoWindow(title: 'Start Location'),
    ),
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('RouteWISELY Map')),
      body: GoogleMap(
        initialCameraPosition: CameraPosition(
          target: _startLocation,
          zoom: 12,
        ),
        markers: _markers,
        onMapCreated: (controller) {
          _controller = controller;
        },
        myLocationEnabled: true,
        compassEnabled: true,
      ),
    );
  }
}
