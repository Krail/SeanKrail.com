// require modules
var path = require('path');
var fs = require('fs');

/* main content of resume page */
module.exports = JSON.parse(
  fs.readFileSync(path.join(__dirname, '/resume.json'), 'utf8')
);
