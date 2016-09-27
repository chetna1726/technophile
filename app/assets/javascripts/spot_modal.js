function SpotModal() {
  var _this = this;

  this.initialize = function() {
    this.bindEvent();
  }

  this.bindEvent = function() {
    $('.spots').on('click', function(event) {
      event.preventDefault();
      _this.sendAjax($(this));
    })
  }

  this.sendAjax = function(element) {
    $.ajax({
      url: '/admin/spots/' + element.data('id'),
      type: 'GET',
      data: { id: element.data('id') }
    })
  }
}

$(document).ready(function() {
  var spotModal = new SpotModal();
  spotModal.initialize();
});