var express = require('express');
var http = require('http');
var https = require('https');

var path = require('path');
var fs = require('fs');


// Instantiate the app
var app = express();

app.set('port', process.env.PORT || 8443);

app.use(express.static(path.join(__dirname, 'public')));

process.title = 'seankrail.com';
app.locals.title = 'seankrail.com';
app.locals.email = 'i@seankrail.com';
app.locals.version = '2.0.0-alpha';
app.locals.url = 'https://seankrail.com/';


console.log();
console.log('Version: ' + app.locals.version);
console.log();
console.log('Node Version: ' + process.version);
console.log();


// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'shell', 'html', 'shell.html'));
});

// Resume files
app.get('/resume.pdf', (req, res) => {
  res.download(path.join(__dirname, 'public', 'shell', 'pdf', 'KrailSean-Resume.pdf'), 'KrailSean-Resume.pdf', (_error) => { if (_error) throw _error; });
});
app.get('/resume.png', (req, res) => {
  res.download(path.join(__dirname, 'public', 'shell', 'png', 'KrailSean-Resume.png'), 'KrailSean-Resume.png', (_error) => { if (_error) throw _error; });
});

// // POST project search
// app.post('/projects', (req, res) => {
//   var searchField = req.body.search.trim();
//   var reloadBool = JSON.parse(req.body.reload.toLowerCase());
//   console.log('POST /projects w/ search field: "' + searchField + '" + and reload bool: "' + reloadBool + '"');
//   var result = {};
//   result.keywords = searchField.split(/[ ,\._\-]+/);
//   result.projects = search(searchField);
//   if (reloadBool) {
//     res.send(200);
//   } else res.send(result);
// });


// // Sort projects by search criteria
// function search(searchSubmitted) {
//   if (!projects.utilities.verifySearchField(searchSubmitted)) throw 'Error: Not a valid search query.';
//   var searchKeywords = searchSubmitted.split(/[ ,\._\-]+/);
//   var projectScore = [];
//   for (var i = 0; i < routes.projects.projects.length; i++) {
//     projectScore[i] = {};
//     projectScore[i].score = 0;
//     projectScore[i].id = routes.projects.projects[i].id;
//     projectScore[i].updated = routes.projects.projects[i].updated;
//     routes.projects.projects[i].keywords.forEach(function(projectKey, index, array) {
//       searchKeywords.forEach(function(searchKey, index, array) {
//         var a = projectKey.toLowerCase(),
//             b = searchKey.toLowerCase();
//         if (a.includes(b) || b.includes(a)) projectScore[i].score++;
//       });
//     });
//   }
//   projectScore.sort(function(a, b) {
//         if (a.score < b.score) return 1; // set b (highest) to lower index than a (lowest)
//         else if (a.score > b.score) return -1; // set a (highest) to lower index than b (lowest)
//         else { // scores are equal
//           if (a.updated < b.updated) return 1; // set b (latest) to lower index than a (oldest)
//           else if (a.updated > b.updated) return -1; // set a (latest) to lower index than b (oldest)
//           else { // last updated on the same date
//             if (a.id > b.id) return 1; // set b (lowest) to lower index than a (highest)
//             else if (a.id < b.id) return -1; // set a (lowest) to lower index than b (highest)
//             else return 0; // do nothing
//           }
//         }
//       });
//   return projectScore;
// }


var server = http.createServer(app).listen(app.get('port'), () => { console.log('Express server listening on port ' + app.get('port')); });
