"use strict";
var TAG = 'seankrail.js :: ';
/* 
 * Helper functions for each page on my site.
 *
 *   ~ Sean Krail
 *
 */



/* HELPER FUNCTIONS */


function stopScrolling() { document.body.setAttribute('class', 'stop-scrolling'); console.log(TAG + 'stopScrolling() -> ' + document.body.getAttribute('class')); }
function startScrolling() { document.body.removeAttribute('class'); console.log(TAG + 'stopScrolling() -> ' + document.body.getAttribute('class')); }

/* Scroll to top of element if not already viewable in window */
function scrollIntoView(selector) {
  stopScrolling();
  if($(selector).position().top < $(window).scrollTop()) $('html, body').animate({
    scrollTop:$(selector).position().top
  }, {
    duration: 1000,
    easing: 'easeInOutQuart',
    start: function(animation) { stopScrolling(); },
    complete: function() { startScrolling(); }
  }); // scroll up
  else if($(selector).position().top + $(selector).height() > $(window).scrollTop() + window.innerHeight) $('html, body').animate({
    scrollTop: $(selector).position().top - (window.innerHeight || document.documentElement.clientHeight) + $(selector).height() + 15
  }, {
    duration: 1000,
    easing: 'easeInOutQuart',
    start: function(animation) { stopScrolling(); },
    complete: function() { startScrolling(); }
  }); // scroll down
}

/* Scroll to top of element */
function scrollToTop(selector) {
  $(selector).animate({
    scrollTop: $(selector).offset().top
  }, {
    duration: 1000,
    easing: 'easeInOutQuart',
    start: function(animation) { stopScrolling(); },
    complete: function() { startScrolling(); }
  });
}

/* Scroll to bottom of element */
function scrollToBottom(selector) {
  $(selector).animate({
    scrollTop: $(selector).offset().top - $(selector).prop('scrollHeight')
  }, {
    duration: 1000,
    easing: 'easeInOutQuart',
    start: function(animation) { stopScrolling(); },
    complete: function() { startScrolling(); }
  });
}

console.log(TAG + 'Script loaded completely.')
