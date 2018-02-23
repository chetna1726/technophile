$(document).ready(function() {
  $('.slider').fullpage({
    loopHorizontal: true,
    continuousVertical: true,
    continuousHorizontal: true,
    continuousVertical:true,
    scrollHorizontally: true,
    anchors: ['walkative', 'discover', 'track','share'],
    menu: '#nav',
    scrollingSpeed: 1000,
    scrollOverflow: true,
    verticalCentered: false
  });
  $('.section').find('.fp-tableCell').addClass('vertical-center');
  var scrollableHeight = $(window).height();
  $('#images').css('height', scrollableHeight);
});
