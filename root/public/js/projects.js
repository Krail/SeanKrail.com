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
var project_ids = [];
var opened = [];

// Create the list of projects here
function initialize() {
  "use strict";
  // get project ids
  var projects = document.getElementsByTagName('article');
  for (var i = 0; i < projects.length; i++) {
    if (projects[i].classList.contains('project')) {
      var children = projects[i].children;
      if (children.length === 2) project_ids.push(children[1].getAttribute('id'));
      else {
        console.error(TAG + 'Expected two children inside of this project article element');
        console.log(children);
      }
      opened.push(false);
    }
  }
}
initialize();
console.log(TAG + '# of projects: ' + project_ids.length + '.');

function bubbleAnchors() {
  project_ids.forEach(
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
function resizeSections(project_ids) {
  var first = document.getElementById(project_ids).getElementsByClassName('section-half');
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
  for (var i = 0; i < project_ids.length; i++) {
    if (project_ids[i] === x) {
      var videos = document.getElementById(project_ids[i]).getElementsByTagName('video');
      for (var j = 0; j < videos.length; j++) {videos[j].play();}
      break;
    }
  }
}

/* A helper function to play all videos under element 'x' */
function playAllVideos(x) {
	"use strict";
	for (var i = 0; i < project_ids.length; i++) { // Iterate through all of the projects
		if (project_ids[i] === x) { // This is project 'x'
      var videos = document.getElementById(project_ids[i]).getElementsByTagName('video');
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
  project_ids.forEach( // Iterate through all of the projects
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
  project_ids.forEach( // Iterate through all of the projects
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
  project_ids.forEach(
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



/* Squares or rectangles */
function squares() {
  console.log(TAG + 'squares() called.');
  hide();
  document.getElementById('rectangles').setAttribute('disabled', true);
  document.getElementById('squares').removeAttribute('disabled');
  document.getElementById('expand-collapse').children[0].setAttribute('disabled', true);
  project_ids.forEach( function(element, index, array) {
    var header = document.getElementById(element + 'Header');
    document.getElementById(element + 'Article').style.display = 'inline-block';
    document.getElementById(element + 'Article').style.marginRight = '0.5vw';
    document.getElementById(element + 'Article').style.marginLeft = '0.5vw';
    for(var i = 0; i < header.children.length; i++) {
      if (header.children[i].tagName.toLowerCase() !== 'img') document.getElementById(element + 'Header').children[i].style.display = 'none';
    }
  });
}
/* Squares or rectangles */
function rectangles() {
  console.log(TAG + 'rectangles() called.');
  hide();
  document.getElementById('rectangles').removeAttribute('disabled');
  document.getElementById('squares').setAttribute('disabled', true);
  document.getElementById('expand-collapse').children[0].removeAttribute('disabled');
  project_ids.forEach( function(element, index, array) {
    var header = document.getElementById(element + 'Header');
    document.getElementById(element + 'Article').style.display = 'block';
    document.getElementById(element + 'Article').style.marginRight = '0';
    document.getElementById(element + 'Article').style.marginLeft = '0';
    for(var i = 0; i < header.children.length; i++) {
      if (header.children[i].tagName.toLowerCase() !== 'img') document.getElementById(element + 'Header').children[i].style.display = 'block';
    }
  });
}


console.log(TAG + 'Script loaded completely.');
