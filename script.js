mapboxgl.accessToken = 'pk.eyJ1Ijoicm9uanVkZC10Y3IiLCJhIjoiY21ibWIyYzZxMWJhazJscHZjc3VyNTNwNSJ9.HNj1Xnr4_GUk9b3Io9CNSg';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-71.6856, 42.2067], // Grafton, MA
  zoom: 13
});

map.addControl(new mapboxgl.NavigationControl(), 'top-right');

// Optional: Center on user's live location
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(position => {
    map.flyTo({
      center: [position.coords.longitude, position.coords.latitude],
      zoom: 15
    });

    new mapboxgl.Marker()
      .setLngLat([position.coords.longitude, position.coords.latitude])
      .addTo(map);
  });
}
