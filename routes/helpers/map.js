var latitude = document.getElementById('latitude');
var longitude = document.getElementById('longitude');
mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhZG93d2Fsa2VyNTUiLCJhIjoiY2ttZTR6OWdqMGplejJzcDVzbG9hZDZsaiJ9.XvlTCvjhctqR_1VOVHxU7A';
var coordinates = document.getElementById('coordinates');
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [0, 0],
    zoom: 2
});

var marker = new mapboxgl.Marker({
    draggable: true
})
    .setLngLat([0, 0])
    .addTo(map);

var lngLat = marker.getLngLat();

lngLat.lat = latitude.value;
lngLat.lng = longitude.value;

function onDragEnd() {
    lngLat = marker.getLngLat();
    coordinates.style.display = 'block';
    coordinates.innerHTML =
        'Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat;
    latitude.value = lngLat.lat;
    longitude.value = lngLat.lng;
    console.log(longitude.value, latitude.value);
}
marker.on('dragend', onDragEnd);