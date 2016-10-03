/* /public/shell/js/shell.js */
"use strict";

/*
    Set Constants
    Set GlobalVariables
    Get LocalStoragePreferences
    Get SessionStoragePreferences
    Set LocalStoragePreferences
    Set SessionStoragePreferences
*/
window.sean = {
  constants: {
    page: {
      home: "home",
      projects: "projects",
      resume: "resume"
    },
    keys: {
      page: "page",
      search: "search"
    },
    content: {
      home: "home.json",
      projects: "projects.json",
      resume: "resume.json"
    },
    url: {
      home: "/",
      projects: "/projects",
      resume: "/resume"
    },
    serviceworker: "/service-worker.js",
    undefined: "Either I made a mistake or you're hacking my site."
  },
  variables: {
    user_touch: false
  }
};
if(window.localStorage.getItem(window.sean.constants.keys.page) === null) {
  window.localStorage.setItem(window.sean.constants.keys.page, window.sean.constants.page.home);
}
if(window.sessionStorage.getItem(window.sean.constants.keys.search) === null) {
  window.localStorage.setItem(window.sean.constants.keys.search, "");
}
switch(window.localStorage.getItem(window.sean.constants.keys.page)) {
  case window.sean.constants.page.home:
    console.log("Welcome to my home");
    break;
  case window.sean.constants.page.projects:
    console.log("Check out my portfolio.");
    break;
  case window.sean.constants.page.resume:
    console.log("Check out my resume.");
    break;
  default:
    console.log(window.sean.constants.undefined);
}

/*
    Set HeaderActions
*/
function validateSearchForm() {
  var value = window.document.getElementById("searchForm").value;
}
window.document.getElementById("search").oninput = function() { validateSearchForm(); };
function search(_form) {
  console.log(_form);
}
window.document.getElementById("searchForm").onsubmit = function() { search(this); return false; };

/*
    Set FooterActions
*/
// function scrollTop(_milliseconds) {
//   window.sean.variables.user_touch = false;
//   window.addEventListener("touchstart", function(_event) { window.sean.variables.user_touch = true; }, false);
//   var start = null;
//   var pixels_to_milliseconds = window.pageYOffset / _milliseconds;
//   function step(_timestamp) {
//     if (window.sean.variables.user_touch) {
//       return;
//     }
//     if(!start) start = _timestamp;
//     var elapsed = _timestamp - start;
//     window.scrollBy(0, -pixels_to_milliseconds * elapsed);
//     if (elapsed < _milliseconds && !window.sean.variables.user_touch) {
//       window.requestAnimationFrame(step);
//     } else {
//       if (!window.sean.variables.user_touch) window.scrollBy(0, -window.pageYOffset);
//       window.addEventListener("touchstart", function(_event) {}, true);
//     }
//   }
//   window.requestAnimationFrame(step)
// }
function scrollTop(_milliseconds) {
  window.scrollBy(0, -window.pageYOffset);
}
window.document.getElementById("backtotop").onclick = function() { scrollTop(1000) };

/*
    Register Service Worker
*/
window.navigator.serviceWorker.register(window.sean.constants.serviceworker, { scope: "/" })
  .then(function(_registration) {
    console.log("Registration succeeded. Scope is " + _registration.scope);
  })
    .catch(function(_error) {
      console.log("Registration failed with error: ", _error);
    });

/*
    Set MainActions
*/
function updateMain(_json) {
  var state = {
    pageXOffset: window.pageXOffset,
    pageYOffset: window.pageYOffset
  };
  switch(window.localStorage.getItem(window.sean.constants.keys.page)) {
    case window.sean.constants.page.home:
      console.log("Load home");
      state.page = window.sean.constants.page.home;
      history.pushState(state, "Sean Krail", "/");
      break;
    case window.sean.constants.page.projects:
      console.log("Load projects");
      state.page = window.sean.constants.page.projects;
      history.pushState(state, "Sean Krail's Projects", "/projects");
      break;
    case window.sean.constants.page.resume:
      console.log("Load resume");
      state.page = window.sean.constants.page.resume;
      history.pushState(state, "Sean Krail's Resume", "/resume");
      break;
    default:
      console.log(window.sean.constants.undefined);
  }
  window.document.getElementById("main").innerHTML = "<p>" + JSON.stringify(_json) + "</p>";
}
function load(_filename) {
  window.document.getElementById("main").style.display = "none";
  window.document.getElementById("main").innerHTML = "";
  window.document.getElementById("notification-loading").style.display = "";
  window.fetch("/progressive/json/" + _filename)
    .then(function(_response) { return _response.json(); })
      .then(function(_json) {
        console.log(_json);
        updateMain(_json);
        window.document.getElementById("main").style.display = "";
        window.document.getElementById("notification-loading").style.display = "none";
      });
}
function loadHome() {
  window.localStorage.setItem(window.sean.constants.keys.page, window.sean.constants.page.home);
  load(window.sean.constants.content.home);
}
function loadProjects() {
  window.localStorage.setItem(window.sean.constants.keys.page, window.sean.constants.page.projects);
  load(window.sean.constants.content.projects);
}
function loadResume() {
  window.localStorage.setItem(window.sean.constants.keys.page, window.sean.constants.page.resume);
  load(window.sean.constants.content.resume);
}
window.document.getElementById("home-button").onclick = loadHome;
window.document.getElementById("projects-button").onclick = loadProjects;
window.document.getElementById("resume-button").onclick = loadResume;
window.onpopstate = function(_event) {
  window.scrollTo(_event.state.pageXOffset, _event.state.pageYOffset);
  switch(_event.state.page) {
    case window.sean.constants.page.home:
      console.log("Loading my home");
      loadHome();
      break;
    case window.sean.constants.page.projects:
      console.log("Loading my portfolio.");
      loadProjects();
      break;
    case window.sean.constants.page.resume:
      console.log("Loading my resume.");
      loadResume();
      break;
    default:
      console.log(window.sean.constants.undefined);
  }
};

/*
    Progress App
*/
switch(window.localStorage.getItem(window.sean.constants.keys.page)) {
  case window.sean.constants.page.home:
    console.log("Loading my home");
    loadHome();
    break;
  case window.sean.constants.page.projects:
    console.log("Loading my portfolio.");
    loadProjects();
    break;
  case window.sean.constants.page.resume:
    console.log("Loading my resume.");
    loadResume();
    break;
  default:
    console.log(window.sean.constants.undefined);
}
