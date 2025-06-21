// map_v6.dart - RouteWISELY Enhanced Map (Missoula, MT)

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'dart:async';

class RouteWiselyMap extends StatefulWidget {
  @override
  _RouteWiselyMapState createState() => _RouteWiselyMapState();
}

class _RouteWiselyMapState extends State<RouteWiselyMap> {
  GoogleMapController? _controller;

  // Missoula, MT as default center
  static const LatLng _startLocation = LatLng(46.8721, -113.9940);

  final Set<Marker> _markers = {};
  final Set<Polyline> _polylines = {};

  @override
  void initState() {
    super.initState();
    _initializeMapElements();
  }

  void _initializeMapElements() {
    // Add starting marker
    _markers.add(
      Marker(
        markerId: MarkerId('start'),
        position: _startLocation,
        infoWindow: InfoWindow(title: 'Start Location'),
      ),
    );

    // Example polyline (can be generated from API or Firestore)
    _polylines.add(
      Polyline(
        polylineId: PolylineId('route1'),
        points: [
          _startLocation,
          LatLng(46.8731, -113.9930),
          LatLng(46.8741, -113.9920),
        ],
        color: Colors.blue,
        width: 5,
      ),
    );
  }

  void _updateDriverPosition(LatLng position) {
    setState(() {
      _markers.removeWhere((m) => m.markerId.value == 'driver');
      _markers.add(
        Marker(
          markerId: MarkerId('driver'),
          position: position,
          infoWindow: InfoWindow(title: 'Driver Position'),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
        ),
      );
    });
  }

  Future<void> _syncWithFirestore() async {
    // TODO: fetch route + driver data from Firestore
  }

  Future<void> _fetchDirections() async {
    // TODO: implement Google Directions API call + polyline decoding
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('RouteWISELY Map'),
      ),
      body: GoogleMap(
        initialCameraPosition: CameraPosition(
          target: _startLocation,
          zoom: 14,
        ),
        onMapCreated: (controller) {
          _controller = controller;
        },
        markers: _markers,
        polylines: _polylines,
        myLocationEnabled: true,
        compassEnabled: true,
      ),
      floatingActionButton: FloatingActionButton(
        child: Icon(Icons.location_searching),
        onPressed: () {
          // Example dynamic update
          _updateDriverPosition(LatLng(46.8735, -113.9935));
        },
      ),
    );
  }
}
