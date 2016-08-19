const TAG = 'forage-example/main.js :: ';
const ERROR = 'Error: ';
const LOCALFORAGE = 'LocalForage: '

// In browser's console:
//   localforage.keys().then(_value => {console.log(_value);}).catch(_err => {console.log(_err);});
//   localforage.getItem("1471133682492").then(_value => {console.log(_value);}).catch(_err => {console.log(_err);});


// Create localforage database

console.log(localforage);
localforage.clear().then(() => {
	console.log('Database is empty.');
	localforage.config({
		driver: localforage.INDEXEDDB,
		name: 'locations',
		size: 4980736,
		storeName: 'user_locations',
		description: 'Stores locations of users.'
	});
	// localforage.setItem('key', {message: 'hi'}).then(() => {
	// 	localforage.getItem('key').then(_value => {console.log(_value);}).catch(_err => {console.log(_err);});
	// }).catch(_err => {console.log(_err);});
}).catch(_err => {console.log(_err);});



/// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.

function initMap() {
	console.log('initMap');

	var sanfran_pos = {lat: 37.8, lng: -122.4};
	var pakwan_pos = {lat: 37.764899, lng: -122.423656};
	var radnor_pos = {lat: 40.05, lng: -75.36};

	map = new google.maps.Map(document.getElementById('map'), {
		center: sanfran_pos,
		zoom: 14/*,
		styles: [
			{
				featureType: 'all',
				stylers: [
					{ saturation: -50 }
				]
			},{
				featureType: 'road.arterial',
				elementType: 'geometry',
				stylers: [
					{ hue: '#00ffee' },
					{ saturation: 50 }
				]
			},{
				featureType: 'poi.business',
				elementType: 'labels',
				stylers: [
					{ visibility: 'off' }
				]
			}
		]*/
	});


	buffer = [];
	markers = [];
	paths = [];
	high_zIndex = 10000;
	medium_zIndex = 5000;
	low_zIndex = 0;


	// var pakwan_marker = new google.maps.Marker({
	// 	position: pakwan_pos,
	// 	icon: {
	// 		path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
	// 		scale: 5
	// 	},
	// 	draggable: false,
	// 	map: map
	// });


	if ('geolocation' in window.navigator) {
		console.log(TAG + 'Good news. Your browser supports geolocation.');
		var geolocation = window.navigator.geolocation;
		geolocation.watchPosition(_position => {
			console.log(_position);
			console.log('(' + _position.coords.latitude + ', ' + _position.coords.longitude + ') @ ' + _position.timestamp);

			var coordinates = {
				latitude: _position.coords.latitude,
				longitude: _position.coords.longitude,
				altitude: _position.coords.altitude,
				accuracy: _position.coords.accuracy,
				altitudeAccuracy: _position.coords.altitudeAccuracy,
				heading: _position.coords.heading,
				speed: _position.coords.speed
			};

			var pos = {
				lat: _position.coords.latitude,
				lng: _position.coords.longitude
			};

			markers.push(new UserMarker(coordinates.latitude, coordinates.longitude, coordinates.accuracy, coordinates.heading));

			if (markers.length > 1) {
				var prev_marker = markers[markers.length-2];
				paths.push(new UserPath(prev_marker.user.latitude, prev_marker.user.longitude, coordinates.latitude, coordinates.longitude));
			}

			map.setCenter(pos);

			localforage.setItem(String(_position.timestamp), coordinates).then(() => {
				console.log(TAG + LOCALFORAGE + 'Record created for position @ ' + _position.timestamp);
			}).catch(_err => {console.log(_err); buffer.push(coordinates);});
		}, _error => {
			switch(error.code) {
				case error.PERMISSION_DENIED:
						console.log(TAG + ERROR + 'User denied the request for Geolocation.');
						break;
				case error.POSITION_UNAVAILABLE:
						console.log(TAG + ERROR + 'Location information is unavailable.');
						break;
				case error.TIMEOUT:
						console.log(TAG + ERROR + 'The request to get user location timed out.');
						break;
				case error.UNKNOWN_ERROR:
						console.log(TAG + ERROR + 'An unknown error occurred.');
						break;
			}
		});
	} else {
		// Browser doesn't support Geolocation
		console.log(TAG + ERROR + "Your browser doesn't support geolocation.");

		// TODO: draw box over google maps with message
	}

}


	/*
		A class that represents a user marker in google maps
		_accuracy is a double that represents the accuracy of the
		  latitude and longitude properties, expressed in meters.
	*/
	function UserMarker(_latitude, _longitude, _accuracy, _heading) {
		this.user = {
			latitude: _latitude,
			longitude: _longitude,
			accuracy: _accuracy,
			heading: _heading
		};

		var point = null, accuracy = null, heading = null;

		point = MyPoint(_latitude, _longitude);

		if (_accuracy && _accuracy > 5) accuracy = MyAccuracy(_latitude, _longitude, _accuracy);
		else accuracy = null;

		if (_heading) heading = MyHeading(_latitude, _longitude, _heading);
		else heading = null;

		this.marker = {
			point: point,
			accuracy: accuracy,
			heading, heading
		};

	}

	function UserPath(_start_latitude, _start_longitude, _end_latitude, _end_longitude) {
		this.user = {
			start_latitude: _start_latitude,
			start_longitude: _start_longitude,
			end_latitude: _end_latitude,
			end_longitude: _end_longitude
		};

		this.path = new google.maps.Polyline({
			clickable: false,
			draggable: false,
			editable: false,
			geodesic: true,
			icons: [],
			map: map,
			path: [
				{lat: _start_latitude, lng: _start_longitude},
				{lat: _end_latitude, lng: _end_longitude}
			],
			strokeColor: '#0000FF',
			strokeOpacity: 0.8,
			strokeWeight: 5,
			visible: true,
			zIndex: medium_zIndex
		});
	}


/*
	Function for drawing a user's point
*/
function MyPoint(_latitude, _longitude) {
	return new google.maps.Circle({
		center: {lat: _latitude, lng: _longitude},
		clickable: false,
		draggable: false,
		editable: false,
		fillColor: '#00FF00',
		fillOpacity: 0.35,
		map: map,
		radius: 5,
		strokeColor: '#00FF00',
		strokeOpacity: 0.8,
		strokePosition: google.maps.StrokePosition.CENTER,
		strokeWeight: 1,
		visible: true,
		zIndex: high_zIndex
	});
}

/*
	Function for drawing a user's point's radius of accuracy in meters
*/
function MyAccuracy(_latitude, _longitude, _accuracy) {
	return new google.maps.Circle({
		center: {lat: _latitude, lng: _longitude},
		clickable: false,
		draggable: false,
		editable: false,
		fillColor: '#FF0000',
		fillOpacity: 0.35,
		map: map,
		radius: _accuracy,
		strokeColor: '#FF0000',
		strokeOpacity: 0.8,
		strokePosition: google.maps.StrokePosition.CENTER,
		strokeWeight: 2,
		visible: true,
		zIndex: low_zIndex
	});
}

/*
	Function for drawing the direction a user is traveling at a given point
*/
function MyHeading(_latitude, _longitude, _heading) {
	return new google.maps.Marker({
		anchorPoint: {x: 0, y: 0},
		animation: google.maps.Animation.BOUNCE,
		attribution : {},
		clickable: false,
		crossOnDrag: true,
		cursor: 'default',
		draggable: false,
		icon: {
			anchor: {x: 0, y: 0},
			fillColor: '#0000FF',
			fillOpacity: 0.35,
			labelOrigin: {x: 0, y: 0},
			path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
			rotation: _heading,
			scale: 5,
			strokeColor: '#0000FF',
			strokeOpacity: 0.8,
			strokeWeight: 2
		},
		label: '',
		map: map,
		opacity: 1.0,
		optimized: true,
		place: {},
		position: {lat: _latitude, lng: _longitude},
		shape: {},
		title: '',
		visible: true,
		zIndex: medium_zIndex
	});
}

