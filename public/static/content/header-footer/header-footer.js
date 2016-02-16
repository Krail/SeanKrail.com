// require modules
var path = require('path');
var fs = require('fs');

/* header content */
module.exports.header = JSON.parse(fs.readFileSync(path.join(__dirname, 'header.json'), 'utf8'));

/* footer content */
module.exports.footer = JSON.parse(fs.readFileSync(path.join(__dirname, 'footer.json'), 'utf8'));
