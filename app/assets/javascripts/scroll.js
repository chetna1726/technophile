$(document).ready(function() {
  $('.slider').fullpage({
    anchors: ['walkative', 'discover', 'track','share'],
    menu: '#nav',
    scrollingSpeed: 1000
  });
  $('.section').find('.fp-tableCell').addClass('vertical-center');
  var scrollableHeight = $(window).height();
  $('#images').css('height', scrollableHeight);
});