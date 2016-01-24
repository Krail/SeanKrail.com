// REQUIRE modules
var path = require('path');
var fs = require('fs');

/* hard-coded main content of projects page */
module.exports.hard = [];
module.exports.icon = 'glyphicon glyphicon-search';

fs.readdirSync(path.join(__dirname, '/projects/')).forEach(
  function (element, index, array) {
    console.log('After: ' + element);
    module.exports.hard.push(
      JSON.parse(
        fs.readFileSync(path.join(__dirname, 'projects', element), 'utf8')
      )
    );
  }
);
