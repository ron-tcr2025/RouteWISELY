import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:location/location.dart';
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

class RouteWiselyMap extends StatefulWidget {
  @override
  _RouteWiselyMapState createState() => _RouteWiselyMapState();
}

class _RouteWiselyMapState extends State<RouteWiselyMap> {
  GoogleMapController? _controller;
  final LatLng _startLocation = LatLng(46.8721, -113.9940); // Missoula, MT
  Set<Marker> _markers = {};
  Location _locationTracker = Location();
  StreamSubscription<LocationData>? _locationSubscription;
  Polyline? _routePolyline;

  // API KEYS
  final String mapsApiKey = 'AIzaSyA4bVqER9jyPDHRJ4NMCsbFMFQtWDzcSQk';

  // Route segment tracking
  List<LatLng> _routeSegments = [
    LatLng(46.8721, -113.9940),
    LatLng(46.8731, -113.9930),
    LatLng(46.8741, -113.9920)
  ];
  Set<LatLng> _visitedSegments = {};

  @override
  void initState() {
    super.initState();
    FirebaseFirestore.instance.settings = Settings(persistenceEnabled: true);
    _markers.add(Marker(
      markerId: MarkerId("start"),
      position: _startLocation,
      infoWindow: InfoWindow(title: "Start Location"),
    ));
    _startTracking();
    _fetchDirections();
  }

  void _startTracking() async {
    _locationSubscription = _locationTracker.onLocationChanged.listen((LocationData currentLocation) {
      LatLng pos = LatLng(currentLocation.latitude ?? 0.0, currentLocation.longitude ?? 0.0);

      if (_controller != null) {
        _controller!.animateCamera(CameraUpdate.newLatLng(pos));
      }

      setState(() {
        _markers.add(Marker(
          markerId: MarkerId("current"),
          position: pos,
          infoWindow: InfoWindow(title: "Current Location"),
        ));
      });

      FirebaseFirestore.instance.collection('driver_tracking').add({
        'timestamp': FieldValue.serverTimestamp(),
        'latitude': currentLocation.latitude,
        'longitude': currentLocation.longitude,
        'accuracy': currentLocation.accuracy,
        'speed': currentLocation.speed,
      });

      _checkRouteCompletion(pos);
    });
  }

  void _fetchDirections() async {
    String url =
        'https://maps.googleapis.com/maps/api/directions/json?origin=${_startLocation.latitude},${_startLocation.longitude}&destination=${_startLocation.latitude},${_startLocation.longitude}&key=$mapsApiKey';

    var response = await http.get(Uri.parse(url));
    if (response.statusCode == 200) {
      var data = json.decode(response.body);
      var points = data['routes'][0]['overview_polyline']['points'];
      var line = _decodePolyline(points);

      setState(() {
        _routePolyline = Polyline(
          polylineId: PolylineId("route"),
          points: line,
          color: Colors.blue,
          width: 4,
        );
      });
    } else {
      print("Error fetching directions: ${response.body}");
    }
  }

  List<LatLng> _decodePolyline(String encoded) {
    List<LatLng> points = [];
    int index = 0, len = encoded.length;
    int lat = 0, lng = 0;

    while (index < len) {
      int b, shift = 0, result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.codeUnitAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.add(LatLng(lat / 1E5, lng / 1E5));
    }

    return points;
  }

  void _checkRouteCompletion(LatLng currentPos) {
    for (var segment in _routeSegments) {
      if (_distanceBetween(segment, currentPos) < 0.0001) {
        _visitedSegments.add(segment);
      }
    }

    if (_visitedSegments.length == _routeSegments.length) {
      print("✅ Route completed!");
      FirebaseFirestore.instance.collection('driver_tracking').add({
        'event': 'route_completed',
        'timestamp': FieldValue.serverTimestamp()
      });

      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: Text("Route Complete"),
          content: Text("All segments have been visited."),
        ),
      );
    }
  }

  double _distanceBetween(LatLng a, LatLng b) {
    return (a.latitude - b.latitude).abs() + (a.longitude - b.longitude).abs();
  }

  @override
  void dispose() {
    _locationSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Set<Polyline> polylines = {};
    if (_routePolyline != null) {
      polylines.add(_routePolyline!);
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('RouteWISELY Map'),
      ),
      body: GoogleMap(
        initialCameraPosition: CameraPosition(
          target: _startLocation,
          zoom: 14.0,
        ),
        markers: _markers,
        polylines: polylines,
        myLocationEnabled: true,
        compassEnabled: true,
        onMapCreated: (controller) {
          _controller = controller;
        },
      ),
    );
  }
}
