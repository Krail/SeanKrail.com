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
(function () {
  "use strict";
  var projects = document.getElementsByTagName('article');
  for (var i = 0; i < projects.length; i++) {
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
console.log(TAG + '# of projects: ' + PROJECT_IDS.length + '.');

// Make links inside header elements 'bubble'
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

// Add onclick event to each mark element
(function () {
  for (var i = 0; i < document.getElementsByTagName('mark').length; i++) {
    document.getElementsByTagName('mark')[i].addEventListener('click', function (event) {
      event.stopPropagation();
      if (!document.getElementById('search').value || document.getElementById('search').value.length === 0 ) {
        document.getElementById('search').value = this.innerHTML;
        verifySearchField();
      }
      else if (!document.getElementById('search').value.includes(this.innerHTML)) {
        document.getElementById('search').value += ', ' + this.innerHTML;
        verifySearchField();
      }
    }, false);
  }
})();



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
// resize sections (assuming correct formatting)
function resetSections(project_id) {
  var halfsection = document.getElementById(project_id).getElementsByClassName('section-half');
  for (var i = 0; i < halfsection.length; i++) halfsection[i].style.height = 'auto';
}

/* A helper function to pause all active videos (specifically iframe-vimeo videos, tongue twister) */
function pauseAllVideos() {
	"use strict";
	var videos = document.getElementsByTagName('video');
  for (var i = 0; i < videos.length; i++) {
    videos[i].pause();
  }
}
function pauseAllVideos(project_id) {
  "use strict";
  for (var i = 0; i < PROJECT_IDS.length; i++) {
    if (PROJECT_IDS[i] === project_id) {
      var videos = document.getElementById(PROJECT_IDS[i]).getElementsByTagName('video');
      for (var j = 0; j < videos.length; j++) {videos[j].play();}
      break;
    }
  }
}

/* A helper function to play all videos under element 'project_id' */
function playAllVideos(project_id) {
	"use strict";
	for (var i = 0; i < PROJECT_IDS.length; i++) { // Iterate through all of the projects
		if (PROJECT_IDS[i] === project_id) { // This is project 'project_id'
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
        var complete;
        if (OPENED[index]) { // Project is currently opened, close it.
          if (!RECTANGLES) square(project_id);
          pauseAllVideos(project_id);
          OPENED[index] = false;
          complete = resetSections;
        } else { // Project is currently closed, open it.
          if (!RECTANGLES) rectangle(project_id);
          playAllVideos(project_id);
          OPENED[index] = true;
          complete = resizeSections;
        }
        $('#' + element).slideToggle({
          duration: 500,
          easing: 'easeInOutQuart',
          complete: function() { complete(project_id); }
        });
      }
    }
  );
}

/* Expands all projects */
function show() {
	"use strict";
	//pauseAllVideos(); // pause all active videos
  PROJECT_IDS.forEach( // Iterate through all of the projects
    function(element, index, array) {
      if (!OPENED[index]) { // Project is currently closed, open it.
        if (!RECTANGLES) rectangle(element);
        playAllVideos(element);
        OPENED[index] = true;
        $('#' + element).slideDown({
          duration: 500,
          easing: 'easeInOutQuart',
          complete: function() { resizeSections(element); }
        });
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
      if (OPENED[index]) { // Project is currently opened, close it.
        if (!RECTANGLES) square(element);
        pauseAllVideos(element);
        OPENED[index] = false;
        $('#' + element).slideUp({
          duration: 500,
          easing: 'easeInOutQuart',
          complete: function() { resetSections(element); }
        });
      }
    }
  );
}



/* Search bar function */
function verifySearchField() {
  var string = document.getElementById('search').value,
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

  // Test search field for 60 characters
  if (string.length <= 60) {
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
  if (letters || length) document.getElementById('submitButton').setAttribute('disabled', true);
  else document.getElementById('submitButton').removeAttribute('disabled');

  // Scroll warnings into 
  if (length != (document.getElementById('length').style.display !== 'none')
     || letters != (document.getElementById('letters').style.display !== 'none')) scrollToBottom('html, body, header');
  
  // return
  if (letters || length) return false;
  else return true;
}
(function () {
  function sendData() {
    var XHR = new XMLHttpRequest();

    // We bind the FormData object and the form element
    var FD  = new FormData(form);

    // We define what will happen if the data are successfully sent
    XHR.addEventListener("load", function(event) {
      if (event.target.status !== 200) throw 'Error: Server returned "' + event.target.status + ' ' + event.target.statusText + '"';
      var res = JSON.parse(event.target.responseText);
      //var sortedProjects = res.projects;
      /*sortedProjects.sort(function(a, b) {
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
      });*/
      // Reorder HTML elements
      for (var i = 0; i < res.projects.length; i++) {
        document.getElementById('projects').insertBefore(document.getElementById(res.projects[i].id + 'Article'), (i+1 !== res.projects.length) ? document.getElementById('projects').children[i] : null);
      }
      // Add/remove classes to mark elements
      for (var i = 0; i < document.getElementsByTagName('mark').length; i++) {
        var match = false;
        for (var j = 0; j < res.keywords.length; j++) {
          var a = document.getElementsByTagName('mark')[i].innerHTML.toLowerCase(),
              b = res.keywords[j].toLowerCase();
          if (a.includes(b) || b.includes(a)) match = true;
        }
        if (match) document.getElementsByTagName('mark')[i].setAttribute('class', 'searched');
        else document.getElementsByTagName('mark')[i].removeAttribute('class');
      }
    });

    // We define what will happen in case of error
    XHR.addEventListener("error", function(event) {
      alert('Oups! Something goes wrong.');
    });

    // We setup our request
    XHR.open('POST', '/projects');

    // The data sent are the one the user provide in the form
    XHR.send(FD);
  }

  // We need to access the form element
  var form = document.getElementById('searchForm');

  // to takeover its submit event.
  form.addEventListener('submit', function (event) {
    if (!verifySearchField()) { event.preventDefault(); return; }
    if (JSON.parse(document.getElementById('reload').value) === false) {
      event.preventDefault();
      sendData();
    }
  });
})();


/* Squares or rectangles */
function square(project_id) {
  console.log(TAG + 'square(' + project_id + ') called.');
  var header = document.getElementById(project_id + 'Header');
  if (!header) throw 'Error: No such header with id -> ' + project_id + 'Header';
  /*$('#' + project_id + 'Article').animate({
    display: 'inline-block',
    marginRight: '0.5vw',
    marginLeft: '0.5vw'
  },1000);*/
  document.getElementById(project_id + 'Article').style.display = 'inline-block';
  document.getElementById(project_id + 'Article').style.marginRight = '0.5vw';
  document.getElementById(project_id + 'Article').style.marginLeft = '0.5vw';
  for(var i = 0; i < header.children.length; i++) {
    if (header.children[i].tagName.toLowerCase() !== 'img') document.getElementById(project_id + 'Header').children[i].style.display = 'none';
    else document.getElementById(project_id + 'Header').children[i].style.display = 'block';
  }
}
function squares() {
  if (document.getElementById('squares').getAttribute('disabled') === '') return;
  console.log(TAG + 'squares() called.');
  hide();
  RECTANGLES = false;
  document.getElementById('rectangles').removeAttribute('disabled');
  document.getElementById('squares').setAttribute('disabled', '');
  document.getElementById('projects').style.margin = '0 -0.5vw';
  //document.getElementById('expand-collapse').children[0].setAttribute('disabled', '');
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
    else document.getElementById(project_id + 'Header').children[i].removeAttribute('style');
  }
}
function rectangles() {
  if (document.getElementById('rectangles').getAttribute('disabled') === '') return;
  console.log(TAG + 'rectangles() called.');
  hide();
  RECTANGLES = true;
  document.getElementById('rectangles').setAttribute('disabled', '');
  document.getElementById('squares').removeAttribute('disabled');
  document.getElementById('projects').style.margin = 0;
  //document.getElementById('expand-collapse').children[0].removeAttribute('disabled');
  PROJECT_IDS.forEach( function(element, index, array) { rectangle(element); });
}


console.log(TAG + 'Script loaded completely.');
