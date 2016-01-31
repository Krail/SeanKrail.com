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


var app = express();

app.set('port', process.env.PORT || 443);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(require('serve-favicon')(path.join(__dirname, 'public', 'static', 'content', 'assets', 'images', 'ico', 'favicon.ico')));
app.use(express.favicon(path.join(__dirname, 'public', 'static', 'content', 'assets', 'images', 'ico', 'favicon.ico')));
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
process.title = 'nodeSK';
app.locals.theme = process.env.THEME; //Make the THEME environment variable available to the app.
app.locals.version = fs.readFileSync(path.join(__dirname, 'version.version'), 'utf8').replace(/\n$/, '');
app.locals.url = 'seankrail.com';


console.log('*****************************************');
console.log('\n\nVersion: ' + app.locals.version + '\n');
console.log('*****************************************');

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


// Refresh array of projects (hard and soft)
projects.refresh(routes.projects);


// GET each page in the /routes/ directory
Object.keys(routes).forEach(
  (element, index, array) => {
    if (element === 'home') app.get('/(home)?', routes.home);
    else if (element === 'projects') {
      app.get('/projects', (req, res) => {
        projects.utilities.shuffle(routes.projects);
        res.render('projects', {
          page: 'projects',
          appTitle: 'Sean\'s Projects',
          content: routes.projects
        });
      });
    } else app.get('/' + element, routes[element]);
  }
);


// POST signup form.
app.post('/signup', (req, res) => {
  var nameField = req.body.name,
      emailField = req.body.email,
      previewBool = req.body.previewAccess;
  res.send(200);
  signup(nameField, emailField, previewBool);
});

// POST project search
app.post('/projects', (req, res) => {
  var searchField = req.body.search.trim();
  var reloadBool = JSON.parse(req.body.reload.toLowerCase());
  console.log('POST /projects w/ search field: "' + searchField + '" + and reload bool: "' + reloadBool + '"');
  //res.send(200);
  var result = {};
  result.projects = search(searchField);
  res.send(result);
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
    if (err) throw err;
    else {
      //console.log('Form data added to database.');
      var snsMessage = 'New signup: %EMAIL%'; //Send SNS notification containing email from form.
      snsMessage = snsMessage.replace('%EMAIL%', formData.Item.email['S']);
      sns.publish({ TopicArn: config.NEW_SIGNUP_TOPIC, Message: snsMessage }, (err, data) => {
        if (err) throw err;
        //console.log('SNS message sent.');
      });  
    }
  });
};

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
  return projectScore;
}


http.createServer(app).listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'));
});
