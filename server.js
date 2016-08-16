//Copyright 2013-2014 Amazon.com, Inc. or its affiliates. All Rights Reserved.
//Licensed under the Apache License, Version 2.0 (the "License"). 
//You may not use this file except in compliance with the License. 
//A copy of the License is located at
//
//    http://aws.amazon.com/apache2.0/
//
//or in the "license" file accompanying this file. This file is distributed 
//on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
//either express or implied. See the License for the specific language 
//governing permissions and limitations under the License.

// REQUIRE modules.
var express = require('express');
var routes = require('./routes/index.js');
var http = require('http');
var https = require('https');
var path = require('path');
var fs = require('fs');
var AWS = require('aws-sdk');

var sass_minify = require('./modules/sass-minify.js');
var projects = require('./modules/projects.js');

//var LEX = require('letsencrypt-express').testing();

// Instantiate the app
var app = express();


app.set('port', 443);
//app.set('port', process.env.PORT || 443); // FOR DEPLOYMENT
//app.set('port', process.env.PORT || 3000); // FOR DEVELOPMENT @ http://localhost:3000
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(require('serve-favicon')(path.join(__dirname, 'public', 'static', 'images', 'favicon.ico')));
app.use(express.favicon(path.join(__dirname, 'public', 'static', 'images', 'favicon.ico')));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.directory(path.join(__dirname, 'public'), {
  hidden: true, icons: true, filter: false
}));
app.use(express.static(path.join(__dirname, 'public'), {
  hidden: true, icons: true, filter: false
}));
process.title = 'node-seankrail';
app.locals.theme = process.env.THEME || 'flatly'; //Make the THEME environment variable available to the app.
app.locals.version = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version || '1.0.8';
app.locals.url = 'seankrail.com';


console.log('**************************');
console.log('\nVersion: ' + app.locals.version + '\n');
console.log('**************************');
console.log('\nNode Version: ' + process.version + '\n');


//console.log(JSON.stringify(process.env));


// Read config values from a JSON file.
var config = fs.readFileSync(path.join(__dirname, 'app_config.json'), 'utf8');
config = JSON.parse(config);
config.VERSION = app.locals.version;

// Create DynamoDB client and pass in region.
var db = new AWS.DynamoDB({region: config.AWS_REGION});
// Create SNS client and pass in region.
var sns = new AWS.SNS({region: config.AWS_REGION});


// Create minified stylesheet
sass_minify.sass();
// Minify javascript files
sass_minify.minify();


// Refresh array of projects (hard and soft) on startup
projects.refresh(routes.projects);
// Refresh array of projects (hard and soft) at midnight each night
require('node-schedule').scheduleJob('0 0 * * *', function() {
  projects.refresh(routes.projects);
});


// GET home page
app.get('/(home)?', routes.home);

// GET resume page
app.get('/darts', (req, res) => {
  //res.redirect(path.join(__dirname, 'public', 'static', 'darts', 'index.html'));
  res.redirect('/doxygen/darts/index.html');
});

// GET resume page
app.get('/resume', routes.resume);
// GET resume in pdf
app.get('/resume.pdf', (req, res) => {
  res.download(path.join(__dirname, 'public', 'static', 'images', 'resume', 'KrailSean-Resume.pdf'), 'KrailSean-Resume.pdf', (err) => { if (err) throw err; });
});
// GET resume in png
app.get('/resume.png', (req, res) => {
  res.download(path.join(__dirname, 'public', 'static', 'images', 'resume', 'KrailSean-Resume.png'), 'KrailSean-Resume.png', (err) => { if (err) throw err; });
});


// GET projects page
app.get('/projects', (req, res) => {
  projects.utilities.shuffleKeywords(routes.projects);
  res.render('projects', {
    page: 'projects',
    appTitle: 'Sean\'s Projects',
    content: routes.projects
  });
});

// POST project search
app.post('/projects', (req, res) => {
  var searchField = req.body.search.trim();
  var reloadBool = JSON.parse(req.body.reload.toLowerCase());
  console.log('POST /projects w/ search field: "' + searchField + '" + and reload bool: "' + reloadBool + '"');
  var result = {};
  result.keywords = searchField.split(/[ ,\._\-]+/);
  result.projects = search(searchField);
  if (reloadBool) {
    res.send(200);
  } else res.send(result);
});


// Sort projects by search criteria
function search(searchSubmitted) {
  if (!projects.utilities.verifySearchField(searchSubmitted)) throw 'Error: Not a valid search query.';
  var searchKeywords = searchSubmitted.split(/[ ,\._\-]+/);
  var projectScore = [];
  for (var i = 0; i < routes.projects.projects.length; i++) {
    projectScore[i] = {};
    projectScore[i].score = 0;
    projectScore[i].id = routes.projects.projects[i].id;
    projectScore[i].updated = routes.projects.projects[i].updated;
    routes.projects.projects[i].keywords.forEach(function(projectKey, index, array) {
      searchKeywords.forEach(function(searchKey, index, array) {
        var a = projectKey.toLowerCase(),
            b = searchKey.toLowerCase();
        if (a.includes(b) || b.includes(a)) projectScore[i].score++;
      });
    });
  }
  projectScore.sort(function(a, b) {
        if (a.score < b.score) return 1; // set b (highest) to lower index than a (lowest)
        else if (a.score > b.score) return -1; // set a (highest) to lower index than b (lowest)
        else { // scores are equal
          if (a.updated < b.updated) return 1; // set b (latest) to lower index than a (oldest)
          else if (a.updated > b.updated) return -1; // set a (latest) to lower index than b (oldest)
          else { // last updated on the same date
            if (a.id > b.id) return 1; // set b (lowest) to lower index than a (highest)
            else if (a.id < b.id) return -1; // set a (lowest) to lower index than b (highest)
            else return 0; // do nothing
          }
        }
      });
  return projectScore;
}


// DEBUG GET projects page
app.get('/projects-button', (req, res) => {
  projects.utilities.shuffleKeywords(routes.projects);
  res.render('projects-button', {
    page: 'projects',
    appTitle: 'Sean\'s Projects',
    content: routes.projects
  });
});


// POST signup form.
app.post('/signup', (req, res) => {
  var nameField = req.body.name,
      emailField = req.body.email,
      previewBool = req.body.previewAccess;
  res.send(200);
  signup(nameField, emailField, previewBool);
});

// Add signup form data to database.
var signup = function(nameSubmitted, emailSubmitted, previewPreference) {
  var formData = {
    TableName: config.STARTUP_SIGNUP_TABLE,
    Item: {
      email: {'S': emailSubmitted}, 
      name: {'S': nameSubmitted},
      preview: {'S': previewPreference}
    }
  };
  db.putItem(formData, (err, data) => {
    if (err) throw err.formatted;
    else {
      console.log('Form data added to database.');
      var snsMessage = 'New signup: %EMAIL%'; //Send SNS notification containing email from form.
      snsMessage = snsMessage.replace('%EMAIL%', formData.Item.email['S']);
      sns.publish({ TopicArn: config.NEW_SIGNUP_TOPIC, Message: snsMessage }, (err, data) => {
        if (err) throw err.formatted;
        console.log('SNS message sent.');
      });  
    }
  });
};


/*var lex = LEX.create({
  //configDir: require('os').homedir() + '/letsencrypt/etc',
  configDif: null,
  onRequest: app,
  letsencrypt: null,
  approveRegistration: (hostname, approve) => {
    //if (hostname === 'seankrail') {
      approve(null, {
        domains: ['seankrail.com'],
        email: 'i@seankrail.com',
        agreeTos: true
      });
    //}
  }
});*/

/*lex.listen([], [443, 5001], () => {
  var protocol = ('requestCert' in this) ? 'https' : 'http';
  console.log("Listening at " + protocol + '://localhost:' + this.address().port);
});*/


//http.createServer(app).listen(app.get('port'), () => { console.log('Express server listening on port ' + app.get('port')); });
https.createServer({
  key: fs.readFileSync('domain.key'),
  cert: fs.readFileSync('chained.pem')//,
  //dhparam: fs.readFileSync('dhparam.pem')
}, app).listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'));
});
