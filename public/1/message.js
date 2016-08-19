/*
	LocalForage Verb Request Messages
*/
function GetMessage(_key) {
	this.type = 'verb';
	this.verb = 'get';
	this.key = _key;
}
function SetMessage(_key, _value) {
	this.type = 'verb';
	this.verb = 'set';
	this.key = _key;
	this.value = _value;
}
function RemoveMessage(_key) {
	this.type = 'verb';
	this.verb = 'remove';
	this.key = _key;
}
function ClearMessage() {
	this.type = 'verb';
	this.verb = 'clear';
}
function LengthMessage() {
	this.type = 'verb';
	this.verb = 'length';
}
function KeysMessage() {
	this.type = 'verb';
	this.verb = 'keys';
}

/*
	LocalForage Verb Response Message
*/
function ResultMessage(_verb, _result) {
	this.type = 'result';
	this.verb = _verb;
	this.result = _result;
}

/*
	Meta messages received from LocalForage.
*/
function InfoMessage(_object, _message) {
	this.type = 'info';
	this.object = _object;
	this.message = _message;
}
function ErrorMessage(_object, _message) {
	this.type = 'error';
	this.object = _object;
	this.message = _message;
}
function FatalMessage(_object, _message) {
	this.type = 'fatal';
	this.object = _object;
	this.message = _message;
}
