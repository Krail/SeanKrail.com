// require modules
var path = require('path');
var fs = require('fs');

// main content of home page
module.exports = JSON.parse(fs.readFileSync(path.join(__dirname, 'home.json'), 'utf8'));
