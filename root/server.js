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
var md = require("node-markdown").Markdown;

var app = express();

app.set('port', process.env.PORT || 443);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.locals.theme = process.env.THEME; //Make the THEME environment variable available to the app.
app.locals.version = fs.readFileSync('./version.txt', 'utf8').replace(/\n$/, '');


// Read config values from a JSON file.
var config = fs.readFileSync('./app_config.json', 'utf8');
config = JSON.parse(config);
config.VERSION = fs.readFileSync('./version.txt', 'utf8');

// Create DynamoDB client and pass in region.
var db = new AWS.DynamoDB({region: config.AWS_REGION});
// Create SNS client and pass in region.
var sns = new AWS.SNS({region: config.AWS_REGION});


// Convert base.scss file into style.css (Async)
sass.render(
  {
    file: './public/scss/base.scss',
    outputStyle: 'compressed'
  },
  function(err, data) {
    if (err) console.log('Error compiling Sass file: ', err);
    else fs.writeFileSync('./public/css/style.min.css', data.css);
  }
);
sass.render(
  {
    file: './public/scss/base.scss',
    outputStyle: 'nested'
  },
  function(err, data) {
    if (err) console.log('Error compiling Sass file: ', err);
    else fs.writeFileSync('./public/css/style.css', data.css);
  }
);

// Minify javascript files
var jsDir = './public/js/'
var files = fs.readdirSync(jsDir);
files.forEach(
  function(element, index, array) {
    new compressor.minify({
      type: 'gcc',
      fileIn: jsDir + element,
      fileOut: jsDir + element.replace(/\.[^/.]+$/, "") + '.min.js',
      callback: function(err, min) {
        if (err) console.log('Error minifying javascript files: ', err);
      }
    });
  }
);


// Convert all of my GitHub Repos
var github = new GitHubAPI({
  version: '3.0.0',
  protocol: 'https',
  host: 'api.github.com'
});
var token = fs.readFileSync('./token.txt', 'utf8');
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
  },
  function(err, data) {
    if (err) throw err;
    else {
      data = JSON.parse(data);
      if(!Array.isArray(data)) console.log('Error. GitHub data is not an array: ', data);
      else {
        data.forEach(
          function(element, index, array) {
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
                  type: 'readme'
                }
              ]
            };
            var readme_url = 'https://raw.githubusercontent.com/' + element.full_name + '/master/README.md';
            https.get(readme_url, (res) => {
              var data = '';
              res.on('data', (d) => { data += d; });
              res.on('end', function() {
                project.content[0].html = md(data);
                fs.writeFile('./public/static/content/assets/projects/' + project.id + '.json', JSON.stringify(project), 'utf8');
              });
            });
            console.log(project);
          }
        );
        console.log(JSON.stringify(data));
      }
    }
  }
);


// GET home page.
app.get('/', routes.home);

// GET each page in the /routes/ directory
Object.keys(routes).forEach(
  function(element, index, array) {
    app.get('/' + element, routes[element]);
  }
);


// POST signup form.
app.post('/signup', function(req, res) {
  var nameField = req.body.name,
      emailField = req.body.email,
      previewBool = req.body.previewAccess;
  res.send(200);
  signup(nameField, emailField, previewBool);
});

// POST project search
app.post('/projects', function(req, res) {
  var searchField = req.body.search;
  res.send(200);
  search(searchField);
});

// Add signup form data to database.
var signup = function (nameSubmitted, emailSubmitted, previewPreference) {
  var formData = {
    TableName: config.STARTUP_SIGNUP_TABLE,
    Item: {
      email: {'S': emailSubmitted}, 
      name: {'S': nameSubmitted},
      preview: {'S': previewPreference}
    }
  };
  db.putItem(formData, function(err, data) {
    if (err) console.log('Error adding item to database: ', err);
    else {
      console.log('Form data added to database.');
      var snsMessage = 'New signup: %EMAIL%'; //Send SNS notification containing email from form.
      snsMessage = snsMessage.replace('%EMAIL%', formData.Item.email['S']);
      sns.publish({ TopicArn: config.NEW_SIGNUP_TOPIC, Message: snsMessage }, function(err, data) {
        if (err) console.log('Error publishing SNS message: ' + err);
        else console.log('SNS message sent.');
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

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
