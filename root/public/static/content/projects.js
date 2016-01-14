// REQUIRE modules
var path = require('path');
var fs = require('fs');

/* hard-coded main content of projects page */
module.exports.hard = [];
module.exports.icon = 'glyphicon glyphicon-search';

fs.readdir(path.join(__dirname, '/projects/'), function (err, data) {
  if (err) console.log("Error adding hard-coded projects", err);
  data.forEach(function (file) {
    module.exports.hard.push(
      JSON.parse(
        fs.readFileSync(path.join(__dirname, 'projects', file), 'utf8')
      )
    );
  });
});
