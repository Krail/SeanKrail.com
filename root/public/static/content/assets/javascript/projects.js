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

// Create the list of projects here
function initialize() {
  "use strict";
  var projects = document.getElementsByClassName('project');
  for (var i = 0; i < projects.length; i++) {
    var main = projects[i].getElementsByTagName('main');
    if (main.length === 1) project_id.push(main[0].getAttribute('id'));
    else console.error(TAG + 'Too many main elements inside of this project article element: ' + projects[i]);
  }
}
initialize();
console.log(TAG + '# of projects: ' + project_id.length + '.');

function bubbleAnchors() {
  project_id.forEach(
    function(element, index, array) {
      var paragraphs = document.getElementById(element + 'Header').getElementsByTagName('p');
      for(var i = 0; i < paragraphs.length; i++) for(var j = 0; j < paragraphs[i].getElementsByTagName('a').length; j++) document.getElementById(element + 'Header').getElementsByTagName('p')[i].getElementsByTagName('a')[j].onclick = function onclick(event){event.stopPropagation();};
    }
  );
}
bubbleAnchors();



/* HELPER FUNCTIONS */


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
      // New
      var display = document.getElementById(element).style.display;
      if (element === x) {
        $('#' + element).slideToggle({
          duration: 500,
          easing: 'easeInOutQuart',
          start: function(animation) {
            stopScrolling();
            //$('html, body').addClass('stop-scrolling');
            //$('html, body').bind('touchmove', function(event){event.preventDefault()});
          },
          complete: function() {
            startScrolling();
            //$('html, body').removeClass('stop-scrolling');
            //$('html, body').unbind('touchmove');
          }
        });
        if (display !== 'block') {
          //scrollToTop('#' + element + 'Article');
          playAllVideos(x);
        } else pauseAllVideos(x);
      }
      // Old
      /*
      var display = document.getElementById(element).style.display;
      if (element === x) { // This is project 'x'
        display = ( // Ternary for this project
          display === 'none' ? 'block' : 'none'
        );
        if (display === 'block') { // Move to the top of this project's article if it is being shown
          //document.getElementById(element + ' article').scrollIntoView({block: 'start', behavior: 'smooth'});
          //document.getElementById(element + ' article').scrollIntoView(true);
          scrollToTop('#' + element + 'Article');
          playAllVideos(x);
        }
      } else { display = 'none'; } // Else, hide this project
      document.getElementById(element).style.display = display;
      */
    }
  );
}

/* Expands project 'x' and collapses all of the other projects */
function show(x) {
	"use strict";
	//pauseAllVideos(); // pause all active videos
  project_id.forEach( // Iterate through all of the projects
    function(element, index, array) {
      var display = document.getElementById(element).style.display;
      // New
      if (element === x) {
        $('#' + element).slideDown({
          duration: 500,
          easing: 'easeInOutQuart',
          start: function(animation) {
            stopScrolling();
            //$('html, body').addClass('stop-scrolling');
            //$('html, body').bind('touchmove', function(event){event.preventDefault()});
          },
          complete: function() {
            startScrolling();
            //$('html, body').removeClass('stop-scrolling');
            //$('html, body').unbind('touchmove');
          }
        });
        //scrollToTop('#' + element + 'Article');
        playAllVideos(x);
      }
      // Old
      /*
      if (element === x) { // This is project 'x'
        display = 'block' // Show this project
        //document.getElementById('#' + element + ' article').scrollIntoView({block: 'start', behavior: 'smooth'}); // Move to the top of this project's article
        //document.getElementById('#' + element + ' article').scrollIntoView(true); // Move to the top of this project's article
        scrollToTop('#' + element + 'Article');
        playAllVideos(x);
      } else { display = 'none'; } // Hide this project
      document.getElementById(element).style.display = display;
      */
    }
  );
}

/* Collapses all projects */
function hide() {
	"use strict";
	pauseAllVideos(); // pause all active videos
  project_id.forEach(
    function(element, index, array) {
      // New
      if (document.getElementById(element).style.display === 'block') {
        $('#' + element).slideUp({
          duration: 500,
          easing: 'easeInOutQuart',
          start: function(animation) {
            stopScrolling();
            //$('html, body').addClass('stop-scrolling');
            //$('html, body').bind('touchmove', function(event){event.preventDefault()});
          },
          complete: function() {
            startScrolling();
            //$('html, body').removeClass('stop-scrolling');
            //$('html, body').unbind('touchmove');
          }
        });
      }
      // Old
      /*
      document.getElementById(element).style.display = 'none';
      */
    }
  );
}



/* LAST INITIALIZATION */


//hide(); // initialize all projects as hidden, for some reason it doesn't like the fact that there's no inline style attribute declaring display to be none. I do say so in the css...



/* Search bar helper functions */


function keyup() {
  var string = document.getElementById('searchfield').value,
      letters = true,
      length = true;

  // Test search field for only letters and space
  // Includes "a-z", "A-Z", "0-9", " ", ",", ".", "'", and "-".
  if (!string || string.length === 0 || /^[a-zA-Z0-9 ,.'\-]+$/.test(string)) {
    document.getElementById('letters').style.display = 'none';
    letters = false;
  } else document.getElementById('letters').style.display = '';

  // Test search field for 30 characters
  if (string.length <= 30) {
    document.getElementById('length').style.display = 'none';
    length = false;
  }
  else document.getElementById('length').style.display = '';

  // Disable/enable submit button
  if (letters || length) document.getElementById('submitbutton').setAttribute('disabled', true);
  else document.getElementById('submitbutton').removeAttribute('disabled');

  // Scroll warnings into 
  if (length != (document.getElementById('length').style.display !== 'none')
     || letters != (document.getElementById('letters').style.display !== 'none')) {
    scrollToBottom('html, body, header, nav');
  }
}

console.log(TAG + 'Script loaded completely.')
