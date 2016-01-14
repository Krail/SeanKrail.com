"use strict";
var TAG = 'seankrail.js :: ';
/* 
 * Helper functions for each page on my site.
 *
 *   ~ Sean Krail
 *
 */



/* HELPER FUNCTIONS */


/* Scroll to top of element if not already viewable in window */
function scrollIntoView(selector) {
  if ($(selector).position().top < $(window).scrollTop()) //scroll up
    $('html, body').animate({scrollTop:$(selector).position().top}, 1000);
  else if ($(selector).position().top + $(selector).height() > $(window).scrollTop() + window.innerHeight) //scroll down
    $('html, body').animate({scrollTop:$(selector).position().top - (window.innerHeight || document.documentElement.clientHeight) + $(selector).height() + 15}, 1000);
}

/* Scroll to top of element */
function scrollToTop(selector) {
  $('html, body').animate({
    scrollTop: $(selector).offset().top
  }, 1000);
}

/* Scroll to bottom of element */
function scrollToBottom(selector) {
  $('html, body').animate({
    scrollTop: $(selector).offset().top - $(selector).prop('scrollHeight')
  }, 1000);
}

console.log(TAG + 'Script loaded completely.')
