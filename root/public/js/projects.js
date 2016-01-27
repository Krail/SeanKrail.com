"use strict";
var TAG = 'projects.js :: ';
/* 
 * For toggling/showing/hiding each of my projects on seankrail.com/projects
 * Also to play and pause videos within each project autonomously.
 *
 * Invariant: At most, only one project is showing at a time, or none may be showing as well.
 *
 * This is very simplistic and could be better optimized (something to do in the future).
 *
 *   ~ Sean Krail
 *
 */



/* Global variables */

var PROJECT_IDS = [],
    OPENED = [],
    RECTANGLES = true;

/* INITIALIZATION */


/* Initialize the element id's of each project based on the number of projects, this is ran when the javascript tag loads */

// Create the list of projects here
//function initialize() {
(function () {
  "use strict";
  var projects = document.getElementsByTagName('article');
  for (var i = 0; i < projects.length; i++) {
    console.log(TAG + 'initialize(): Below should be project article element');
    console.log(projects[i]);
    if (projects[i].classList.contains('project')) {
      var children = projects[i].children;
      if (children.length === 2) PROJECT_IDS.push(children[1].getAttribute('id'));
      else {
        console.error(TAG + 'Expected two children inside of this project article element');
        console.error(children);
      }
      OPENED.push(false);
    }
  }
})();
//initialize();
console.log(TAG + '# of projects: ' + PROJECT_IDS.length + '.');

// Make links inside header elements 'bubble'.
//function bubbleAnchors() {
(function () {
  PROJECT_IDS.forEach(
    function(element, index, array) {
      var paragraphs = document.getElementById(element + 'Header').getElementsByTagName('p');
      for(var i = 0; i < paragraphs.length; i++) {
        for(var j = 0; j < paragraphs[i].getElementsByTagName('a').length; j++) {
          document.getElementById(element + 'Header').getElementsByTagName('p')[i].getElementsByTagName('a')[j].onclick = function onclick(event){event.stopPropagation();};
        }
      }
    }
  );
})();
//bubbleAnchors();



/* HELPER FUNCTIONS */


// resize sections (assuming correct formatting)
function resizeSections(project_id) {
  var first = document.getElementById(project_id).getElementsByClassName('section-half');
  for (var i = 0; i < first.length; i += 2) {
    var maxHeight = (first[i].offsetHeight > first[i+1].offsetHeight) ? first[i].offsetHeight : first[i+1].offsetHeight;
    maxHeight = maxHeight * 100 / window.innerWidth;
    first[i].style.height = maxHeight + 'vw';
    first[i+1].style.height = maxHeight + 'vw';
  }
}

/* A helper function to pause all active videos (specifically iframe-vimeo videos, tongue twister) */
function pauseAllVideos() {
	"use strict";
	var videos = document.getElementsByTagName('video');
  for (var i = 0; i < videos.length; i++) {
    videos[i].pause();
  }
}
function pauseAllVideos(x) {
  "use strict";
  for (var i = 0; i < PROJECT_IDS.length; i++) {
    if (PROJECT_IDS[i] === x) {
      var videos = document.getElementById(PROJECT_IDS[i]).getElementsByTagName('video');
      for (var j = 0; j < videos.length; j++) {videos[j].play();}
      break;
    }
  }
}

/* A helper function to play all videos under element 'x' */
function playAllVideos(x) {
	"use strict";
	for (var i = 0; i < PROJECT_IDS.length; i++) { // Iterate through all of the projects
		if (PROJECT_IDS[i] === x) { // This is project 'x'
      var videos = document.getElementById(PROJECT_IDS[i]).getElementsByTagName('video');
      for (var j = 0; j < videos.length; j++) {videos[j].play();}
			break;
		}
	}
}



/* MAIN FUNCTIONS */


/* If project 'project_id' is expanded, collapse it.
 * Else if project 'project_id' is collapsed, expand it.
 * And collapses all of the other projects */
function toggle(project_id) {
	"use strict";
  PROJECT_IDS.forEach( // Iterate through all of the projects
    function(element, index, array) {
      if (element === project_id) {
        $('#' + element).slideToggle({
          duration: 500,
          easing: 'easeInOutQuart'/*,
          start: function(animation) { stopScrolling(); },
          complete: function() { startScrolling(); }*/
        });
        if (OPENED[index]) {
          pauseAllVideos(project_id);
          OPENED[index] = false;
          if (!RECTANGLES) square(project_id);
        } else {
          playAllVideos(project_id);
          resizeSections(project_id);
          OPENED[index] = true;
          if (!RECTANGLES) rectangle(project_id);
        }
      }
    }
  );
}

/* Expands project 'x' and collapses all of the other projects */
function show() {
	"use strict";
	//pauseAllVideos(); // pause all active videos
  PROJECT_IDS.forEach( // Iterate through all of the projects
    function(element, index, array) {
      if (!OPENED[index]) {
        $('#' + element).slideDown({
          duration: 500,
          easing: 'easeInOutQuart'/*,
          start: function(animation) { stopScrolling(); },
          complete: function() { startScrolling(); }*/
        });
        playAllVideos(element);
        resizeSections(element);
        OPENED[index] = true;
        if (!RECTANGLES) rectangle(project_id);
      }
    }
  );
}

/* Collapses all projects */
function hide() {
	"use strict";
	pauseAllVideos(); // pause all active videos
  PROJECT_IDS.forEach(
    function(element, index, array) {
      console.log()
      if (OPENED[index]) {
        $('#' + element).slideUp({
          duration: 500,
          easing: 'easeInOutQuart'/*,
          start: function(animation) { stopScrolling(); },
          complete: function() { startScrolling(); }*/
        });
        pauseAllVideos(element);
        OPENED[index] = false;
        if (!RECTANGLES) square(project_id);
      }
    }
  );
}



/* Search bar helper functions */


function verifySearchField() {
  var string = document.getElementById('searchfield').value,
      letters = true,
      length = true;

  // Test search field for only letters and space
  // Includes "a-z", "A-Z", "0-9", " ", ",", ".", "'", and "-".
  if (!string || string.length === 0 || /^[a-zA-Z0-9 ,.'\-]+$/.test(string)) {
    $('#letters').slideUp({
      duration: 500,
      easing: 'easeInOutQuart'
    });
    letters = false;
  } else $('#letters').slideDown({
      duration: 500,
      easing: 'easeInOutQuart'
    });

  // Test search field for 30 characters
  if (string.length <= 30) {
    $('#length').slideUp({
      duration: 500,
      easing: 'easeInOutQuart'
    });
    length = false;
  }
  else $('#length').slideDown({
      duration: 500,
      easing: 'easeInOutQuart'
    });

  // Disable/enable submit button
  if (letters || length) document.getElementById('submitbutton').setAttribute('disabled', true);
  else document.getElementById('submitbutton').removeAttribute('disabled');

  // Scroll warnings into 
  if (length != (document.getElementById('length').style.display !== 'none')
     || letters != (document.getElementById('letters').style.display !== 'none')) {
    scrollToBottom('html, body, header');
  }
}



/* Squares or rectangles */
function square(project_id) {
  console.log(TAG + 'square(' + project_id + ') called.');
  var header = document.getElementById(project_id + 'Header');
  if (!header) throw 'Error: No such header with id -> ' + project_id + 'Header';
  document.getElementById(project_id + 'Article').style.display = 'inline-block';
  document.getElementById(project_id + 'Article').style.marginRight = '0.5vw';
  document.getElementById(project_id + 'Article').style.marginLeft = '0.5vw';
  for(var i = 0; i < header.children.length; i++) {
    if (header.children[i].tagName.toLowerCase() !== 'img') document.getElementById(project_id + 'Header').children[i].style.display = 'none';
  }
}
function squares() {
  console.log(TAG + 'squares() called.');
  hide();
  document.getElementById('rectangles').removeAttribute('disabled');
  document.getElementById('squares').setAttribute('disabled', '');
  document.getElementById('expand-collapse').children[0].setAttribute('disabled', '');
  PROJECT_IDS.forEach( function(element, index, array) { square(element); });
}
function rectangle(project_id) {
  console.log(TAG + 'rectangle(' + project_id + ') called.');
  var header = document.getElementById(project_id + 'Header');
  if (!header) throw 'Error: No such header with id -> ' + project_id + 'Header';
  document.getElementById(project_id + 'Article').style.display = 'block';
  document.getElementById(project_id + 'Article').style.marginRight = '0';
  document.getElementById(project_id + 'Article').style.marginLeft = '0';
  for(var i = 0; i < header.children.length; i++) {
    if (header.children[i].tagName.toLowerCase() !== 'img') document.getElementById(project_id + 'Header').children[i].style.display = 'block';
  }
}
function rectangles() {
  console.log(TAG + 'rectangles() called.');
  hide();
  document.getElementById('rectangles').setAttribute('disabled', '');
  document.getElementById('squares').removeAttribute('disabled');
  document.getElementById('expand-collapse').children[0].removeAttribute('disabled');
  PROJECT_IDS.forEach( function(element, index, array) { rectangle(element); });
}


console.log(TAG + 'Script loaded completely.');
