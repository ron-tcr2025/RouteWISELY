
# RouteWISELY Maps Codebook

## Overview
This codebook describes integration of Google Maps API in RouteWISELY for mobile (Flutter/Dart) and web (HTML/JavaScript).

## Web Sample Stub
```html
<!DOCTYPE html>
<html>
  <head>
    <title>RouteWISELY Map</title>
    <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
    <script>
      function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 12,
          center: {lat: 42.3601, lng: -71.0589},
          mapTypeControl: false
        });
      }
    </script>
  </head>
  <body onload="initMap()">
    <div id="map" style="height:100vh;width:100%;"></div>
  </body>
</html>
```

## Mobile Sample Stub (Flutter)
```dart
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
```

## Gotchas
- Always secure API keys in environment files or secrets managers.
- Check billing and quota limits for Google Maps API.
- On mobile, ensure location permissions are handled.

## Upload Instructions
1. Place files in your repo.
2. Commit:
    ```
    git add .
    git commit -m "Add RouteWISELY Maps Codebook and stubs"
    git push origin main
    ```
