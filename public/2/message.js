/*
	LocalForage Verb Request Messages
*/
function GetMessage(_userid, _key) {
	this.userid = _id;
	this.type = 'verb';
	this.verb = 'get';
	this.key = _key;
}
function SetMessage(_id, _key, _value) {
	this.userid = _id;
	this.type = 'verb';
	this.verb = 'set';
	this.key = _key;
	this.value = _value;
}
function RemoveMessage(_id, _key) {
	this.userid = _id;
	this.type = 'verb';
	this.verb = 'remove';
	this.key = _key;
}
function ClearMessage(_id) {
	this.userid = _id;
	this.type = 'verb';
	this.verb = 'clear';
}
function LengthMessage(_id) {
	this.userid = _id;
	this.type = 'verb';
	this.verb = 'length';
}
function KeysMessage(_id) {
	this.userid = _id;
	this.type = 'verb';
	this.verb = 'keys';
}

/*
	LocalForage Verb Response Message
*/
function ResultMessage(_id, _verb, _result) {
	this.userid = _id;
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
