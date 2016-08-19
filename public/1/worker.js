importScripts('localforage.min.js');
importScripts('message.js');

const TAG = 'forage-example/worker.js :: ';
const ERROR = 'Error: ';

const DATABASE_NAME = 'FollowMeDB';
const OBJECT_STORE_NAME = 'MyLocations';

buffer = [];

if ('localforage' in this) {

	// Create localforage database
	// console.log(localforage);
	localforage.clear().then(() => {
		if (port) port.postMessage(new InfoMessage(null, TAG + 'LocalForage database is empty now.'));

		localforage.config({
			driver: [
				localforage.INDEXEDDB,
				localforage.WEBSQL,
				localforage.LOCALSTORAGE
			],
			name: DATABASE_NAME,
			size: 4980736,
			storeName: OBJECT_STORE_NAME, // ObjectStore Name or Table Name
			version: 0.2,
			description: 'Database table stores my locations.'
		});
		// localforage.setItem('key', {message: 'hi'}).then(() => {
		// 	localforage.getItem('key').then(_value => {console.log(_value);}).catch(_err => {console.log(_err);});
		// }).catch(_err => {console.log(_err);});
	}).catch(_err => { if (port) port.postMessage(new ErrorMessage(_err, TAG + ERROR + 'Failed to clear LocalForage database.')); });

} else {
	// Browser doesn't support indexedDB
	if (port) port.postMessage(new FatalMessage(_event.data, TAG + ERROR + "The user's browser doesn't support indexedDB."));
}

onconnect = (_event) => {
	port = _event.ports[0];
	port.postMessage('hey');
	port.addEventListener('message', (_MessageEvent) => {
		port.postMessage('hi');
		//port.postMessage(_MessageEvent.data);
		port.postMessage(new InfoMessage(null, TAG + 'SharedWorker received message.'));
		//port.postMessage(JSON.stringify(InfoMessage));
		var message = _MessageEvent.data;
		if (message.type === 'verb') {
			port.postMessage('bye');
			switch (message.verb) {
				case 'get':
						localforage.getItem(message.key).then((_value) => {
							port.postMessage(new ResultMessage(message.verb, _value));
						}).catch((_error) => {
							port.postMessage(new ResultMessage(message.verb, _error));
						});
						port.postMessage(new InfoMessage(_MessageEvent.data, TAG + 'Requested to ' + message.verb + ' geoposition @ ' + message.key + ' in LocalForage.'));
						break;
				case 'set':
						localforage.setItem(message.key, message.value).then((_value) => {
							port.postMessage(_value);
							port.postMessage(new ResultMessage(message.verb, _value));
						}).catch((_error) => {
							port.postMessage(new ResultMessage(message.verb, _error));
						});
						port.postMessage(new InfoMessage(_MessageEvent.data, TAG + 'Requested to ' + message.verb + ' geoposition @ ' + message.key + ' in LocalForage.'));
						break;
				case 'remove':
						localforage.removeItem(message.key);
						// localforage.removeItem(message.key).then((_value) => {
						// 	port.postMessage(new ResultMessage(message.verb, _value));
						// }).catch((_error) => {
						// 	port.postMessage(new ResultMessage(message.verb, _error));
						// });
						port.postMessage(new InfoMessage(_MessageEvent.data, TAG + 'Requested to ' + message.verb + ' geoposition @ ' + message.key + ' in LocalForage.'));
						break;
				case 'clear':
						localforage.clear();
						// localforage.clear().then((_value) => {
						// 	port.postMessage(new ResultMessage(message.verb, _value));
						// }).catch((_error) => {
						// 	port.postMessage(new ResultMessage(message.verb, _error));
						// });
						port.postMessage(new InfoMessage(_MessageEvent.data, TAG + 'Requested to ' + message.verb + ' all geopositions in LocalForage.'));
						break;
				case 'length':
						localforage.length();
						// localforage.length().then((_value) => {
						// 	port.postMessage(new ResultMessage(message.verb, _value));
						// }).catch((_error) => {
						// 	port.postMessage(new ResultMessage(message.verb, _error));
						// });
						port.postMessage(new InfoMessage(_MessageEvent.data, TAG + 'Requested to get the ' + message.verb + ' of geopositions in LocalForage.'));
						break;
				case 'keys':
						//localforage.keys();
						localforage.keys().then((_value) => {
							port.postMessage(new ResultMessage(message.verb, _value));
						}).catch((_error) => {
							port.postMessage(new ResultMessage(message.verb, _error));
						});
						port.postMessage(new InfoMessage(_MessageEvent.data, TAG + 'Requested to get all of the ' + message.verb + ' to geopositions in LocalForage.'));
						break;
				default:
						port.postMessage(new FatalMessage(_MessageEvent.data, TAG + 'Requested to ' + message.verb + ', but there is no such verb.'));
			}

		}
		else port.postMessage(new FatalMessage(_MessageEvent.data, TAG + ERROR + 'LocalForage is not setup.'));
	});

	port.start();

	//port.postMessage('hi');

	//port.postMessage(new InfoMessage(_event.data, TAG + 'SharedWorker connected.'));

};

// onconnect = (_event) => {
// 	var port = _event.ports[0];
// 	port.addEventListener('message', (_event) => {
// 		port.postMessage(JSON.stringify(new ResultMessage(null, 'Received data.')));
// 		port.postMessage(new ResultMessage(null, 'Received data.'));
// 	});
// 	port.start();
// };