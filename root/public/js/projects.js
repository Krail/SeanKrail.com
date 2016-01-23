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



/* INITIALIZATION */


/* Initialize the element id's of each project based on the number of projects, this is ran when the javascript tag loads */
var project_id = [];
var opened = [];

// Create the list of projects here
function initialize() {
  "use strict";
  // get project ids
  var projects = document.getElementsByTagName('article');
  for (var i = 0; i < projects.length; i++) {
    if (projects[i].classList.contains('project')) {
      var children = projects[i].children;
      if (children.length === 2) project_id.push(children[1].getAttribute('id'));
      else {
        console.error(TAG + 'Expected two children inside of this project article element');
        console.log(children);
      }
      opened.push(false);
    }
  }
}
initialize();
console.log(TAG + '# of projects: ' + project_id.length + '.');

function bubbleAnchors() {
  project_id.forEach(
    function(element, index, array) {
      var paragraphs = document.getElementById(element + 'Header').getElementsByTagName('p');
      for(var i = 0; i < paragraphs.length; i++) {
        for(var j = 0; j < paragraphs[i].getElementsByTagName('a').length; j++) {
          document.getElementById(element + 'Header').getElementsByTagName('p')[i].getElementsByTagName('a')[j].onclick = function onclick(event){event.stopPropagation();};
        }
      }
    }
  );
}
bubbleAnchors();



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
  for (var i = 0; i < project_id.length; i++) {
    if (project_id[i] === x) {
      var videos = document.getElementById(project_id[i]).getElementsByTagName('video');
      for (var j = 0; j < videos.length; j++) {videos[j].play();}
      break;
    }
  }
}

/* A helper function to play all videos under element 'x' */
function playAllVideos(x) {
	"use strict";
	for (var i = 0; i < project_id.length; i++) { // Iterate through all of the projects
		if (project_id[i] === x) { // This is project 'x'
      var videos = document.getElementById(project_id[i]).getElementsByTagName('video');
      for (var j = 0; j < videos.length; j++) {videos[j].play();}
			break;
		}
	}
}



/* MAIN FUNCTIONS */


/* If project 'x' is expanded, collapse it.
 * Else if project 'x' is collapsed, expand it.
 * And collapses all of the other projects */
function toggle(x) {
	"use strict";
	//pauseAllVideos(); // pause all active videos
  project_id.forEach( // Iterate through all of the projects
    function(element, index, array) {
      if (element === x) {
        $('#' + element).slideToggle({
          duration: 500,
          easing: 'easeInOutQuart'/*,
          start: function(animation) { stopScrolling(); },
          complete: function() { startScrolling(); }*/
        });
        if(document.getElementById(x).style.display !== 'block') {
          playAllVideos(x);
          if (opened[index] === false) {
            resizeSections(x);
            opened[index] = true;
          }
        } else pauseAllVideos(x);
      }
    }
  );
}

/* Expands project 'x' and collapses all of the other projects */
function show() {
	"use strict";
	//pauseAllVideos(); // pause all active videos
  project_id.forEach( // Iterate through all of the projects
    function(element, index, array) {
      if (document.getElementById(element).style.display !== 'block') {
        $('#' + element).slideDown({
          duration: 500,
          easing: 'easeInOutQuart'/*,
          start: function(animation) { stopScrolling(); },
          complete: function() { startScrolling(); }*/
        });
        playAllVideos(element);
        if (opened[index] === false) {
          resizeSections(element);
          opened[index] = true;
        }
      }
    }
  );
}

/* Collapses all projects */
function hide() {
	"use strict";
	pauseAllVideos(); // pause all active videos
  project_id.forEach(
    function(element, index, array) {
      console.log()
      if (document.getElementById(element).style.display !== 'none') {
        $('#' + element).slideUp({
          duration: 500,
          easing: 'easeInOutQuart'/*,
          start: function(animation) { stopScrolling(); },
          complete: function() { startScrolling(); }*/
        });
        pauseAllVideos(element);
      }
    }
  );
}



/* LAST INITIALIZATION */


//hide(); // initialize all projects as hidden, for some reason it doesn't like the fact that there's no inline style attribute declaring display to be none. I do say so in the css...



/* Search bar helper functions */


function verifySearchField() {
  var string = document.getElementById('searchfield').value,
      letters = true,
      length = true;

  // Test search field for only letters and space
  // Includes "a-z", "A-Z", "0-9", " ", ",", ".", "'", and "-".
  if (!string || string.length === 0 || /^[a-zA-Z0-9 ,.'\-]+$/.test(string)) {
    //document.getElementById('letters').style.display = 'none';
    $('#letters').slideUp({
      duration: 500,
      easing: 'easeInOutQuart'
    });
    letters = false;
  } else /*document.getElementById('letters').style.display = '';*/ $('#letters').slideDown({
      duration: 500,
      easing: 'easeInOutQuart'
    });

  // Test search field for 30 characters
  if (string.length <= 30) {
    //document.getElementById('length').style.display = 'none';
    $('#length').slideUp({
      duration: 500,
      easing: 'easeInOutQuart'
    });
    length = false;
  }
  else /*document.getElementById('length').style.display = '';*/ $('#length').slideDown({
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

console.log(TAG + 'Script loaded completely.')