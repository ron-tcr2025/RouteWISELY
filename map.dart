import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class RouteWiselyMap extends StatefulWidget {
  @override
  _RouteWiselyMapState createState() => _RouteWiselyMapState();
}

class _RouteWiselyMapState extends State<RouteWiselyMap> {
  GoogleMapController? mapController;

  final LatLng _center = const LatLng(42.3601, -71.0589);

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GoogleMap(
        onMapCreated: _onMapCreated,
        initialCameraPosition: CameraPosition(
          target: _center,
          zoom: 12.0,
        ),
        myLocationEnabled: true,
        compassEnabled: true,
      ),
    );
  }
}