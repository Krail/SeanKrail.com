const TAG = 'forage-example/main.js :: ';
const DEBUG = 'Debug: ';
const ERROR = 'Error: ';
const LOCALFORAGE = 'LocalForage: ';

debug = true;


worker = new SharedWorker("worker.js");
// console.log(worker);

//console.log((new ResultMessage(null, 'string...')));

worker.port.onmessage = (_MessageEvent) => {
	// console.log(_MessageEvent);
	var data = _MessageEvent.data;
	switch(data) {
		case 'geoposition':
				var pos = {
					lat: data.latitude,
					lng: data.longitude
				};
				markers.push(new google.maps.Marker({
					position: pos,
					icon: {
						path: google.maps.SymbolPath.CIRCLE,
						scale: 10
					},
					draggable: false,
					map: map
				}));
				map.setCenter(pos);
				break;
		case 'result':
				console.log(TAG + 'Received results:');
				console.log(data);
				break;
		case 'info':
				if (!debug) break;
		case 'error':
		default:
				console.log(TAG + DEBUG + 'Message received from shared worker:')
				console.log(data);
	}
};


worker.port.start();

window.worker = worker;


// In browser's console:
//   localforage.keys().then(_value => {console.log(_value);}).catch(_err => {console.log(_err);});
//   localforage.getItem("1471133682492").then(_value => {console.log(_value);}).catch(_err => {console.log(_err);});


// Create localforage database

// console.log(localforage);
// localforage.clear().then(() => {
// 	console.log('Database is empty.');
// 	localforage.config({
// 		driver: [
// 			localforage.INDEXEDDB,
// 			localforage.WEBSQL,
// 			localforage.LOCALSTORAGE
// 		],
// 		name: 'followme',
// 		size: 4980736,
// 		storeName: 'mylocations',
// 		version: 0.1
// 		description: 'Database table stores my locations.'
// 	});
// 	// localforage.setItem('key', {message: 'hi'}).then(() => {
// 	// 	localforage.getItem('key').then(_value => {console.log(_value);}).catch(_err => {console.log(_err);});
// 	// }).catch(_err => {console.log(_err);});
// }).catch(_err => {console.log(_err);});



/// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.

function initMap() {
	console.log('initMap');

	var sanfran_pos = {lat: 37.8, lng: -122.4};
	var pakwan_pos = {lat: 37.764899, lng: -122.423656};
	var radnor_pos = {lat: 40.05, lng: -75.36};

	var zoom_level = 17;
	var zoom_radius = 611.5; // meters

	map = new google.maps.Map(document.getElementById('map'), {
		center: sanfran_pos,
		zoom: 13/*,
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
	zIndex_3 = 15000;
	zIndex_2 = 10000;
	zIndex_1 =  5000;
	zIndex_0 =     0;


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

		google.maps.event.addListenerOnce(map, 'zoom_changed', () => { console.log('before zoom_changed: ' + map.getZoom()); if (map.getZoom() > 20) map.setZoom(20); console.log('after zoom_changed: ' + map.getZoom()); });

		geolocation.watchPosition((_position) => {
			console.log(_position);
			console.log('(' + _position.coords.latitude + ', ' + _position.coords.longitude + ') @ ' + _position.timestamp);

			var geoposition = {
				altitude: _position.coords.altitude,
				accuracy: _position.coords.accuracy,
				altitudeAccuracy: _position.coords.altitudeAccuracy,
				heading: _position.coords.heading,
				latitude: _position.coords.latitude,
				longitude: _position.coords.longitude,
				speed: _position.coords.speed,
				timestamp: _position.timestamp
			};

			var message = new SetMessage(geoposition.timestamp, geoposition);

			var pos = {
				lat: geoposition.latitude,
				lng: geoposition.longitude
			};

			markers.push(new UserMarker(geoposition.latitude, geoposition.longitude, geoposition.accuracy, geoposition.heading));

			if (markers.length > 1) {
				markers.forEach((_marker, _index, _array) => {
					if (_marker.marker.accuracy) {
						_marker.marker.opacity *= 0.75;
						if (_marker.marker.opacity > 0.05) {
							_marker.marker.accuracy.setOptions({
								fillOpacity: _marker.marker.opacity,
								strokeOpacity: 2 * _marker.marker.opacity
							});
						}
						else _marker.marker.accuracy.setMap(null);
					}
					//if (_marker.marker.heading && _marker.marker.heading.getAnimation());
				});
				var prev_marker = markers[markers.length-2];
				paths.push(new UserPath(prev_marker.user.latitude, prev_marker.user.longitude, geoposition.latitude, geoposition.longitude));
			}

			if      (geoposition.accuracy > 3200) map.setZoom(11);
			else if (geoposition.accuracy > 1600) map.setZoom(12);
			else if (geoposition.accuracy >  800) map.setZoom(13);
			else if (geoposition.accuracy >  400) map.setZoom(14);
			else if (geoposition.accuracy >  200) map.setZoom(15);
			else if (geoposition.accuracy >  100) map.setZoom(16);
			else if (geoposition.accuracy >   50) map.setZoom(17);
			else                                  map.setZoom(18);

			map.setCenter(pos);

			// localforage.setItem(String(geoposition.timestamp), geoposition).then(() => {
			// 	console.log(TAG + LOCALFORAGE + 'Record created for position @ ' + _position.timestamp);			
			// }).catch(_err => {console.log(_err); buffer.push(geoposition);});

			worker.port.postMessage(message);

		}, (_error) => {
			switch(_error.code) {
				case _error.PERMISSION_DENIED:
						console.log(TAG + ERROR + 'User denied the request for Geolocation.');
						break;
				case _error.POSITION_UNAVAILABLE:
						console.log(TAG + ERROR + 'Location information is unavailable.');
						break;
				case _error.TIMEOUT:
						console.log(TAG + ERROR + 'The request to get user location timed out.');
						break;
				case _error.UNKNOWN_ERROR:
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

		var opacity = 0.4;

		var point = null, accuracy = null, heading = null;

		point = MyPoint(_latitude, _longitude, opacity);

		if (_accuracy && _accuracy > 5) accuracy = MyAccuracy(_latitude, _longitude, _accuracy, opacity);
		else accuracy = null;

		if (_heading) heading = MyHeading(_latitude, _longitude, _heading, opacity);
		else heading = null;

		this.marker = {
			point: point,
			accuracy: accuracy,
			heading, heading,
			opacity: opacity
		};

	}

	function UserPath(_start_latitude, _start_longitude, _end_latitude, _end_longitude) {
		this.user = {
			start_latitude: _start_latitude,
			start_longitude: _start_longitude,
			end_latitude: _end_latitude,
			end_longitude: _end_longitude
		};

		var opacity = 0.4;

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
			strokeOpacity: 2 * opacity,
			strokeWeight: 5,
			visible: true,
			zIndex: zIndex_1
		});
	}


/*
	Function for drawing a user's point
*/
function MyPoint(_latitude, _longitude, _opacity) {
	// return new google.maps.Circle({
	// 	center: {lat: _latitude, lng: _longitude},
	// 	clickable: false,
	// 	draggable: false,
	// 	editable: false,
	// 	fillColor: '#00FF00',
	// 	fillOpacity: _opacity,
	// 	map: map,
	// 	radius: 5,
	// 	strokeColor: '#00FF00',
	// 	strokeOpacity: 2 * _opacity,
	// 	strokePosition: google.maps.StrokePosition.CENTER,
	// 	strokeWeight: 5,
	// 	visible: true,
	// 	zIndex: zIndex_2
	// });
	return new google.maps.Marker({
		anchorPoint: {x: 0, y: 0},
		animation: google.maps.Animation.DROP,
		//attribution : {},
		clickable: false,
		crossOnDrag: true,
		cursor: 'default',
		draggable: false,
		icon: {
			anchor: {x: 0, y: 0},
			fillColor: '#00FF00',
			fillOpacity: 0.9,
			labelOrigin: {x: 0, y: 0},
			path: google.maps.SymbolPath.CIRCLE,
			rotation: 0,
			scale: 8,
			strokeColor: '#66FF66',
			strokeOpacity: 0.9,
			strokeWeight: 3
		},
		label: '',
		map: map,
		opacity: 0.9,
		optimized: true,
		//place: {},
		position: {lat: _latitude, lng: _longitude},
		shape: {},
		title: '',
		visible: true,
		zIndex: zIndex_2
	});
}

/*
	Function for drawing a user's point's radius of accuracy in meters
*/
function MyAccuracy(_latitude, _longitude, _accuracy, _opacity) {
	return new google.maps.Circle({
		center: {lat: _latitude, lng: _longitude},
		clickable: false,
		draggable: false,
		editable: false,
		fillColor: '#FF0000',
		fillOpacity: _opacity,
		map: map,
		radius: _accuracy,
		strokeColor: '#FF6666',
		strokeOpacity: 2 * _opacity,
		strokePosition: google.maps.StrokePosition.CENTER,
		strokeWeight: 5,
		visible: true,
		zIndex: zIndex_0
	});
}

/*
	Function for drawing the direction a user is traveling at a given point
*/
function MyHeading(_latitude, _longitude, _heading, _opacity) {
	return new google.maps.Marker({
		anchorPoint: {x: 0, y: 0},
		animation: google.maps.Animation.DROP,
		attribution : {},
		clickable: false,
		crossOnDrag: true,
		cursor: 'default',
		draggable: false,
		icon: {
			anchor: {x: 0, y: 0},
			fillColor: '#0000FF',
			fillOpacity: _opacity,
			labelOrigin: {x: 0, y: 0},
			path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
			rotation: _heading,
			scale: 5,
			strokeColor: '#0000FF',
			strokeOpacity: 2 * _opacity,
			strokeWeight: 5
		},
		label: '',
		map: map,
		opacity: 0.9,
		optimized: true,
		place: {},
		position: {lat: _latitude, lng: _longitude},
		shape: {},
		title: '',
		visible: true,
		zIndex: zIndex_3
	});
}

