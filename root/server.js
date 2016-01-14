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
var path = require('path');
var fs = require('fs');
var AWS = require('aws-sdk');
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

// GET home page.
app.get('/', routes.home);
app.get('/home', routes.home);

// GET test page.
app.get('/test', routes.test);

// GET projects page
app.get('/projects', routes.projects);

// GET resume page
app.get('/resume', routes.resume);

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
  var dateL = req.body.dateL,
      dateH = req.body.dateH;
  res.send(200);
  search(dateL, dateH);
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
    if (err) {
      console.log('Error adding item to database: ', err);
    } else {
      console.log('Form data added to database.');
      var snsMessage = 'New signup: %EMAIL%'; //Send SNS notification containing email from form.
      snsMessage = snsMessage.replace('%EMAIL%', formData.Item.email['S']);
      sns.publish({ TopicArn: config.NEW_SIGNUP_TOPIC, Message: snsMessage }, function(err, data) {
        if (err) {
          console.log('Error publishing SNS message: ' + err);
        } else {
          console.log('SNS message sent.');
        }
      });  
    }
  });
};

// Search projects database.
var search = function(dateH, dateL) {
  var queryParams = {
    TableName: config.SEANKRAIL_PROJECTS_TABLE,
    ExpressionAttributeValues: {
      ":dateL": dateL,
      ":dateH": dateH
    },
    KeyConditionExpression: "date between :dateL and :dateH",
    Limit: 5,
    ProjectionExpression: "date, title, json"
  };
  db.query(queryParams, function(err, data) {
    if (err) {
      console.log('Error querying database: ', err);
    } else {
      console.log('Successfully queried database.');
      data.Items.forEach(function(item) {
        console.log(" -", item.date + ": " + item.title + "..." + item.json);
      });
    }
  });
};

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
