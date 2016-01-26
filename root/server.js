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

var sass = require('node-sass');
var compressor = require('node-minify');
var GitHubAPI = require('github');
var mdConverter = new (require("showdown")).Converter();

var app = express();

app.set('port', process.env.PORT || 443);
app.set('views', __dirname + '/views');
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
app.use(express.static(path.join(__dirname, 'public')));
app.locals.theme = process.env.THEME; //Make the THEME environment variable available to the app.
app.locals.version = fs.readFileSync(path.join(__dirname, 'version.version'), 'utf8').replace(/\n$/, '');


// Read config values from a JSON file.
var config = fs.readFileSync(path.join(__dirname, 'app_config.json'), 'utf8');
config = JSON.parse(config);
config.VERSION = app.locals.version;

// Create DynamoDB client and pass in region.
var db = new AWS.DynamoDB({region: config.AWS_REGION});
// Create SNS client and pass in region.
var sns = new AWS.SNS({region: config.AWS_REGION});


// Convert base.scss file into style.css (Async)
sass.render(
  {
    file: path.join(__dirname, 'public/scss/base.scss'),
    outputStyle: 'compressed'
  }, (err, data) => {
    if (err) throw err;
    else fs.writeFile(path.join(__dirname, 'public/css/style.min.css'), data.css, 'utf8', (err) => { if (err) throw err; });
  }
);
sass.render(
  {
    file: path.join(__dirname, 'public/scss/base.scss'),
    outputStyle: 'nested'
  }, (err, data) => {
    if (err) throw err;
    else fs.writeFile(path.join(__dirname, 'public/css/style.css'), data.css, 'utf8',(err) => { if (err) throw err; });
  }
);

// Minify javascript files
const jsDir = 'public/js'
fs.readdir(path.join(__dirname, 'public/js'), (err, files) => {
  if (err) throw err;
  files.forEach(
    (element, index, array) => {
      new compressor.minify({
        type: 'gcc',
        fileIn: path.join(__dirname, jsDir, element),
        fileOut: path.join(__dirname, jsDir, element.replace(/\.[^/.]+$/, "") + '.min.js'),
        callback: (err, min) => { if (err) throw err; }
      });
    }
  );
});



// Add all 'hard' projects
fs.readdir(path.join(__dirname, 'public/static/content/projects'), (err, files) => {
  if (err) throw err;
  files.forEach(
    (element, index, array) => {
      fs.readFile(path.join(__dirname, 'public/static/content/projects', element), 'utf8', (err, data) => {
        if (err) throw err;
        routes.projects.projects.hard.push(JSON.parse(data));
      });
    }
  );
});



// Convert all of my GitHub Repos
var github = new GitHubAPI({
  version: '3.0.0',
  protocol: 'https',
  host: 'api.github.com'
});
const token = fs.readFileSync(path.join(__dirname, 'token.token'), 'utf8');
github.authenticate({
  type: 'oauth',
  token: token
});
github.repos.getFromUser(
  {
    user: 'Krail', // required
    type: 'all',
    sort: 'created',
    direction: 'desc',
    per_page: 10
  }, (err, data) => {
    if (err) throw err;
    if(!Array.isArray(data)) console.error('Error. GitHub data is not an array: ', data);
    else {
      data.forEach(
        (element, index, array) => {
          var project = {
            id: element.name,
            header: {
              image: {
                title: 'My GitHub Avatar',
                src: element.owner.avatar_url,
                alt: element.name
              },
              heading: element.name,
              paragraphs: [ element.description ]
            },
            content: [
              {
                type: 'readme',
                html: ''
              }
            ]
          };

          https.get('https://raw.githubusercontent.com/' + element.full_name + '/master/README.md', (res) => {
            var data = '';
            res.on('data', (d) => { data += d; });
            res.on('end', () => {
              project.content[0].html = mdConverter(data);
              routes.projects.projects.soft.push(project);
            });
          });

        }
      );
    }
  }
);

var object1 = {y: {x: 5}};
var object2 = {y: object1.y};
console.log(object2);



// GET each page in the /routes/ directory
Object.keys(routes).forEach(
  (element, index, array) => {
    if (element === 'home') app.get('/(home)?', routes.home);
    else if (element === 'projects') {
      app.get('/projects', (req, res) => {
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
  var searchField = req.body.search;
  res.send(200);
  search(searchField);
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

// Search projects database.
var search = function(searchSubmitted) {
  var formData = {
    TableName: config.PROJECTS_TABLE,
    Item: {
      search: {'S': searchSubmitted}
    }
  };
};

http.createServer(app).listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'));
});
