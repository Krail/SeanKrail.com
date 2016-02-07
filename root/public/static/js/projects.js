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
    RECTANGLES = true,
    SOFTWARE = true,
    HARDWARE = true;

/* INITIALIZATION */


/* Initialize the element id's of each project based on the number of projects, this is ran when the javascript tag loads */

// Create the list of projects here
(function () {
  "use strict";
  var projects = document.getElementsByClassName('project-article');
  for (var i = 0; i < projects.length; i++) {
    var children = projects[i].children;
    if (children.length === 2) PROJECT_IDS.push(children[1].getAttribute('id'));
    else {
      console.error(TAG + 'Expected two children inside of this project article element');
      console.error(children);
    }
    OPENED.push(false);
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
  var string = document.getElementById('search').value.trim(),
      letters = false, // assume is it
      length = false;
  console.log('Search: "' + string + '"');

  // Test search field for only letters and space
  // Includes "a-z", "A-Z", "0-9", " ", ",", ".", "'", and "-".
  if (!string || string.length === 0 || /^[a-zA-Z0-9 ,.'\-]+$/.test(string)) {
    $('#letters').slideUp({
      duration: 500,
      easing: 'easeInOutQuart'
    });
    letters = true;
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
    length = true;
  }
  else $('#length').slideDown({
    duration: 500,
    easing: 'easeInOutQuart'
  });

  // Disable/enable submit button
  if (letters && length) document.getElementById('submitButton').removeAttribute('disabled');
  else document.getElementById('submitButton').setAttribute('disabled', true);
  
  // return
  console.log('Verifed Search Field: Valid characters? ' + letters + '. Valid length? ' + (length && string.length !== 0) + '. Therefore valid search? ' + (letters && length && string.length !== 0));
  if (letters && length && string.length !== 0) return true; // valid
  else return false; // invalid
}

/* Attach submit listner to form and prevent default action */
(function () {
  function sendData() {
    console.log('data sent'); // debug
    
    var XHR = new XMLHttpRequest(); // Instaniate http request

    // We bind the FormData object and the form element
    var FD  = new FormData(form);

    // We define what will happen if the data are successfully sent
    XHR.addEventListener("load", function(event) {
      if (event.target.status !== 200) throw 'Error: Server returned "' + event.target.status + ' ' + event.target.statusText + '"';
      var res = JSON.parse(event.target.responseText);
      console.log(res); // debug
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
        if (match) console.log('Match'); // debug
        else console.log('No Match'); // debug
        if (match) document.getElementsByTagName('mark')[i].setAttribute('class', 'searched');
        else document.getElementsByTagName('mark')[i].removeAttribute('class');
      }
    });

    // We define what will happen in case of error
    XHR.addEventListener("error", function(event) { alert('Oops! Something goes wrong.'); });

    // We setup our request
    XHR.open('POST', '/projects');

    // The data sent are the one the user provide in the form
    XHR.send(FD);
  }

  // We need to access the form element
  var form = document.getElementById('searchForm');

  // to takeover its submit event.
  form.addEventListener('submit', function (event) {
    if (!verifySearchField()) {
      console.log('form not submitted: invalid search');
      event.preventDefault();
      return;
    }
    if (JSON.parse(document.getElementById('reload').value) === false) {
      console.log('form submitted valid search');
      event.preventDefault();
      sendData();
    } // else default submit (reloads page)
  });
})();


/* Squares or rectangles */
function square(project_id) {
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
  hide();
  if (!RECTANGLES) return;
  RECTANGLES = false;
  document.getElementById('rectangles').removeAttribute('active');
  document.getElementById('squares').setAttribute('active', '');
  PROJECT_IDS.forEach( function(element, index, array) { square(element); });
}
function rectangle(project_id) {
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
  hide();
  if (RECTANGLES) return;
  RECTANGLES = true;
  document.getElementById('rectangles').setAttribute('active', '');
  document.getElementById('squares').removeAttribute('active');
  PROJECT_IDS.forEach( function(element, index, array) { rectangle(element); });
}


/* Software and/or hardware */
function software() {
  if (SOFTWARE) {
    document.getElementById('software').removeAttribute('active');
    if (!HARDWARE) hardware();
    SOFTWARE = false;
    for (var i = 0; i < document.getElementsByClassName('project-article').length; i++) {
      if (document.getElementsByClassName('project-article')[i].getAttribute('software') !== null) document.getElementsByClassName('project-article')[i].style.display = 'none';
    }
  } else {
    document.getElementById('software').setAttribute('active','');
    SOFTWARE = true;
    for (var i = 0; i < document.getElementsByClassName('project-article').length; i++) {
      if (document.getElementsByClassName('project-article')[i].getAttribute('software') !== null) document.getElementsByClassName('project-article')[i].removeAttribute('style');
    }
  }
}
function hardware() {
  if (HARDWARE) {
    document.getElementById('hardware').removeAttribute('active');
    if (!SOFTWARE) software();
    HARDWARE = false;
    for (var i = 0; i < document.getElementsByClassName('project-article').length; i++) {
      if (document.getElementsByClassName('project-article')[i].getAttribute('hardware') !== null) document.getElementsByClassName('project-article')[i].style.display = 'none';
    }
  } else {
    document.getElementById('hardware').setAttribute('active','');
    HARDWARE = true;
    for (var i = 0; i < document.getElementsByClassName('project-article').length; i++) {
      if (document.getElementsByClassName('project-article')[i].getAttribute('hardware') !== null) document.getElementsByClassName('project-article')[i].removeAttribute('style');
    }
  }
}


console.log(TAG + 'Script loaded completely.');
