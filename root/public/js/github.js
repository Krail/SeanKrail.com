"use strict";
var TAG = 'github.js :: ';
/* 
 * Functions to extract Github repositories and convert them into project articles.
 *
 *   ~ Sean Krail
 *
 */



/* Request data */


function callback(response) {
  var meta = response.meta;
  var data = response.data;
  console.log(meta);
  console.log(data);
}

var script = window.document.createElement("script");

script.src = "https://api.github.com/users/Krail/repos?callback=callbacc";

var head = window.document.getElementsByTagName("head")[0];

head.appendChild(script);
