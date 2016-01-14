"use strict";
var TAG = 'seankrail.js :: ';
/* 
 * Helper functions for each page on my site.
 *
 *   ~ Sean Krail
 *
 */



/* HELPER FUNCTIONS */


function stopScrolling() { document.body.setAttribute('class', 'stop-scrolling'); }
function startScrolling() { document.body.removeAttribute('class'); }

/* Scroll to top of element if not already viewable in window */
function scrollIntoView(selector) {
  stopScrolling();
  if($(selector).position().top < $(window).scrollTop()) $('html, body').animate({scrollTop:$(selector).position().top}, 1000); // scroll up
  else if($(selector).position().top + $(selector).height() > $(window).scrollTop() + window.innerHeight) $('html, body').animate({scrollTop:$(selector).position().top - (window.innerHeight || document.documentElement.clientHeight) + $(selector).height() + 15}, 1000); // scroll down
  startScrolling();
}

/* Scroll to top of element */
function scrollToTop(selector) {
  stopScrolling();
  $('html, body').animate({
    scrollTop: $(selector).offset().top
  }, 1000);
  startScrolling();
}

/* Scroll to bottom of element */
function scrollToBottom(selector) {
  stopScrolling();
  $('html, body').animate({
    scrollTop: $(selector).offset().top - $(selector).prop('scrollHeight')
  }, 1000);
  startScrolling();
}

console.log(TAG + 'Script loaded completely.')
