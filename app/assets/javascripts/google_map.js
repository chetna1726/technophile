var markersObject = {}
var spotIdArray = [];
var coordinates = [];
var averageSpeed = 4;
var averageSpotRadius = 1000

function GoogleMap() {
  var _this = this;
  var map, marker;
  var myLatlng = new google.maps.LatLng(-25.363882,131.044922);
  var geocoder = new google.maps.Geocoder();
  var infoWindow = new google.maps.InfoWindow();
  
  this.initialize = function() {
    _this.getMap();
    _this.getSearchBox();
    _this.searchEvent(searchBox);
    
    if(spotDetails['id']) {
      spotIdArray = spotDetails['id'];
      _this.showSpotMarkersOnMap(spotDetails['spot_info'], spotDetails['spot_position']);
    }
    
    _this.bindEvents();

    if(spotDetails['tripVoronoi']) {
      _this.setSpotZoneOnMap(spotDetails['tripVoronoi']['cells']);
    }
  }

  this.getMap = function() {
    var mapOptions = {
      zoom: 12,
      center: new google.maps.LatLng(28.611463, 77.226140),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map($("#trip-view-map")[0], mapOptions);
  }

  // showing voronoi graph zones on the map
  this.setSpotZoneOnMap = function(cellsArray) {
    var spotZoneCoordinates = [];

    for(var i = 0; i < cellsArray.length; i++) {
      for(var j = 0; j < cellsArray[i]['halfedges'].length; j++) {
        zoneCoordinates = [];
        zoneCoordinates.push(
          new google.maps.LatLng(cellsArray[i]['halfedges'][j]['edge']['va']['x'], cellsArray[i]['halfedges'][j]['edge']['va']['y']),
          new google.maps.LatLng(cellsArray[i]['halfedges'][j]['edge']['vb']['x'], cellsArray[i]['halfedges'][j]['edge']['vb']['y'])
        );

        var spotZone = new google.maps.Polygon({
          path: zoneCoordinates,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35
        });

        spotZone.setMap(map);
      }

    }
  }

  this.bindEvents = function() {
    if(!spotDetails['detailPage']) {
      _this.clickEventOnMap();
    }
    _this.onSubmitOfForm();
    _this.clickEventOnSpot();
    _this.clickEventOnRemoveIcon();
    _this.hoverEventOnSpot();
  }

  this.clickEventOnMap = function() {
    google.maps.event.addListener(map, 'click', function(event) {
      if(coordinates.length == 0) {
        _this.setModal(event.latLng);
      } else {
        alert('Spot marked Beyond Limit');
      }
    });
  }

  this.hoverEventOnSpot = function() {
    _this.changeMarkerColorOnMouseOver();
    _this.changeMarkerColorOnMouseOut();
  }

  this.changeMarkerColorOnMouseOver = function() {
    $('#spots-container').on('mouseover', 'a', function() {
      markersObject[$(this).data('spotid')].setIcon('http://maps.google.com/mapfiles/ms/icons/purple-dot.png');
    });
  }

  this.changeMarkerColorOnMouseOut = function() {
    $('#spots-container').on('mouseout', 'a', function() {
      if($(this).data('spot-status')) {
        markersObject[$(this).data('spotid')].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
      }
      else {
        markersObject[$(this).data('spotid')].setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
      }
    });
  }

  this.showSpotMarkersOnMap = function(spotInfo, spotPosition) {
    for(var i = 0; i < spotPosition.length; i++) {
      var markerPosition = new google.maps.LatLng(spotPosition[i][0], spotPosition[i][1]);

      _this.addMarkerToMap(markerPosition, spotInfo[i][3], spotInfo[i][0]);
    
      _this.clickEventOnMarker(spotInfo[i][0]);
      
      _this.hoverEventOnMarker(spotInfo[i][1], spotInfo[i][2]);
    }

    if(spotDetails['detailPage']) {
      map.setZoom(16);
    } else {
      _this.zoomInMap();
    }
  }

  this.getSearchBox = function() {
    var input = $("#pac-input")[0]
    searchBox = new google.maps.places.SearchBox(input)
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input)
  }

  this.searchEvent = function(searchBox) {
    google.maps.event.addListener(searchBox, 'places_changed', function() {
      var place = searchBox.getPlaces()[0]
      if(place) {
        if(coordinates.length == 0) {
          _this.setModal(place.geometry.location);
        } else {
          alert('Spot marked Beyond Limit');
        }
      }
    })
  }

  // shows and fill required data on the spot modal
  this.setModal = function(coordinates) {
    _this.clearErrorsOnForm();
    _this.getAddressFromCoordinates(coordinates);
  }

  this.clearErrorsOnForm = function() {
    $('#errors').html('');
  }

  this.getAddressFromCoordinates = function(coordinates) {
    geocoder.geocode({'latLng': coordinates}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          _this.showSpotModalThroughAjax(coordinates, results[0].formatted_address);
        } 
        else { 
          alert('No results found')
        }
      } 
    })
  }

  this.showSpotModalThroughAjax = function(coordinates, address) {
    $.ajax({
      url: '/admin/spots/new',
      type: 'GET',
      data: { latitude: coordinates.lat().toFixed(6), longitude: coordinates.lng().toFixed(6), address: address },
      success: function() {
        $('#spotModal').modal({
          show: true,
          backdrop: 'static',
          keyboard: false
        });
      }
    })
  }

  this.onSubmitOfForm = function() {
    $(document).on('ajax:complete', '#spot-create', function(data, xhr) {
      var _xhr = JSON.parse(xhr.responseText);
      var position = new google.maps.LatLng(_xhr['latitude'], _xhr['longitude']);

      if(_xhr['errors'].length > 0) {
        // showing validation errors on the spot modal
        _this.showValidationErrorsOnModal(_xhr['errors']);
      }
      else {
        // building spot_id params for trip
        if(!_this.checkForSpotIdInArray(_xhr['id'])) {
          spotIdArray.push(_xhr['id'])
          $('#trip_spot_ids').val(spotIdArray);
        }

        // hiding modal
        $('#spotModal').modal('hide');
        
        // removing the previous marker from map
        if(markersObject[_xhr['id']]) {
          _this.removeMarkerFromMap(markersObject[_xhr['id']]);
        }

        // placing marker on the map
        _this.addMarkerToMap(position, _xhr['draft'], _xhr['id']);

  
        _this.zoomInMap();

        // showing spots name on the trip form
        if($('div#' + _xhr['id'])[0]) {
          _this.replaceSpotsOnTripForm(_xhr['draft'], _xhr['name'], _xhr['id']);
        } else {
          _this.appendSpotsOnTripForm(_xhr['draft'], _xhr['name'], _xhr['id']);
        }

        // events on marker
        _this.hoverEventOnMarker(_xhr['name'], _xhr['image']);
        _this.clickEventOnMarker(_xhr['id']);

      }
    });
  }

  this.zoomInMap = function() {
    map.setZoom(14);
  }

  this.checkForSpotIdInArray = function(spotId) {
    for(i = 0; i < spotIdArray.length; i++) {
      if(spotIdArray[i] == spotId) {
        return true;
      }
    }
    return false;
  }

  this.removeMarkerFromMap = function(marker) {
    marker.setMap(null);
  }

  this.showValidationErrorsOnModal = function(errors) {
    var error = ""
    for(var i=0; i < errors.length; i++) {
      error = error + "<p class='spot-errors'>" + errors[i] + "</p>"
    }
    $('#errors').html(error)
  }

  this.replaceSpotsOnTripForm = function(status, spotName, spotId) {
    if(status) {
      $('div#' + spotId).html("<a href='#' class='trip-spots draft-spots' data-toggle='model' data-target='#spotModal' data-spotid=" + spotId + " data-spot-status=" + status + ">" + spotName + "</a><img class='remove-image pull-right' src='/assets/remove-icon.png' data-spot-remove-id=" + spotId + " >")
    } else {
      $('div#' + spotId).html("<a href='#' class='trip-spots done-spots' data-toggle='model' data-target='#spotModal' data-spotid=" + spotId + " data-spot-status=" + status + ">" + spotName + "</a><img class='remove-image pull-right' src='/assets/remove-icon.png' data-spot-remove-id=" + spotId + " >")
    }
  }

  this.appendSpotsOnTripForm = function(status, spotName, spotId) {
    if(status) {
      $('#spots-container').append("<div id=" + spotId + "><a href='#' class='trip-spots draft-spots' data-toggle='model' data-target='#spotModal' data-spotid=" + spotId + " data-spot-status=" + status + ">" + spotName + "</a><img class='remove-image pull-right' src='/assets/remove-icon.png' data-spot-remove-id=" + spotId + "></div>")
    } else {
      $('#spots-container').append("<div id=" + spotId + "><a href='#' class='trip-spots done-spots' data-toggle='model' data-target='#spotModal' data-spotid=" + spotId + " data-spot-status=" + status + ">" + spotName + "</a><img class='remove-image pull-right' src='/assets/remove-icon.png' data-spot-remove-id=" + spotId + "></div>")  
    }
  }

  this.addMarkerToMap = function(location, status, spotId) {
    marker = new google.maps.Marker({
      position: location,
      map: map
    });

    marker.setMap(map);
    map.panTo(marker.position);
    markersObject[spotId] = marker;

    if(status) {
      marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
    } else {
      marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
    }

    coordinates.push(marker.getPosition());

    if(!spotDetails['detailPage']) {
      _this.setCircleAroundMarker(marker.getPosition());
    }

    _this.calculateTotalDistance();
  }

  this.setCircleAroundMarker = function(coordinate) {
    var circleOptions = {
      strokeColor: '#262626',
      strokeOpacity: 0.1,
      strokeWeight: 1,
      fillColor: '#262626',
      fillOpacity: 0.1,
      map: map,
      center: coordinate,
      radius: averageSpotRadius
    };

    var spotCircle = new google.maps.Circle(circleOptions);

    google.maps.event.addListener(spotCircle, 'click', function(event) {
      _this.setModal(event.latLng);
    })

  }

  this.calculateTotalDistance = function() {
    meters = Math.round(google.maps.geometry.spherical.computeLength(coordinates));
    _this.fillDistanceOfTrip(meters);
    _this.calculateAverageTime(meters);
  }

  this.fillDistanceOfTrip = function(meters) {
    $('#trip_total_distance').val(meters);
  }

  this.calculateAverageTime = function(meters) {
    seconds = (meters * 60 * 60) / (averageSpeed * 1000)
    _this.fillTimeTakenOfTrip(Math.round(seconds));
  }

  this.fillTimeTakenOfTrip = function(seconds) {
    $('#trip_duration').val(seconds);
  }

  this.hoverEventOnMarker = function(spotName, spotImage) {
    _this.showInfoWindowBox(spotName, spotImage);
    _this.hideInfoWindowBox();
  }

  this.showInfoWindowBox = function(spotName, spotImage) {
    google.maps.event.addListener(marker, 'mouseover', function() {
      if(spotImage) {
        infoWindow.setContent('<div class="info-window-box"><h4>' + spotName + '</h4><img class="info-window-box-image" src=' + spotImage +'></div>');
      } else {
        infoWindow.setContent('<div class="info-window-box"><h4>' + spotName + '</h4><img class="info-window-box-image" src="/assets/no_image.jpg"></div>');
      }

      infoWindow.setPosition(this.position);
      infoWindow.open(map, this);
    })
  }

  this.hideInfoWindowBox = function() {
    google.maps.event.addListener(marker, 'mouseout', function() {
      infoWindow.close();
    })
  }

  this.clickEventOnMarker = function(spotId) {
    google.maps.event.addListener(marker, 'click', function() {
      _this.showSpotModalForEdit(spotId)
      _this.clearErrorsOnForm();
    })
  }

  this.clickEventOnSpot = function() {
    $('#spots-container').on('click', 'a', function(event) {
      var spotId = $(this).data('spotid');
      event.preventDefault();
      _this.showSpotModalForEdit(spotId);
      _this.clearErrorsOnForm();
    })
  }

  this.showSpotModalForEdit = function(spotId) {
    $.ajax({
      url: '/admin/spots/' + spotId + '/edit',
      type: 'GET',
      data: { id: spotId }
    })
  }

  this.clickEventOnRemoveIcon = function() {
    $('#spots-container').on('click', 'img', function() {
      if(confirm('do you really want do delete the spot')) {

        $.ajax({
          url: '/admin/spots/' + $(this).data('spot-remove-id'),
          type: 'DELETE',
          dataType: 'json',
          success: function(data) {
            if(data['success']) {
              // removing marker from map
              _this.removeMarkerFromMap(markersObject[data['id']])
              
              // removing spot name from the trip form
              $('#' + data['id']).remove();

              // building trip spot_ids param
              _this.removeElementFromArrayByValue(data['id']);
              $('#trip_spot_ids').val(spotIdArray);

              // recalculating the distance of the trip
              _this.removeCoordinatesFromArrayByValue(markersObject[data['id']].getPosition());
              _this.calculateTotalDistance();

              // removing marker from the markerObject
              delete(markersObject[data['id']]);

            } else {
              alert('not deleted');
            }
          }
        });
      }
    });
  }

  this.removeElementFromArrayByValue = function(spotId) {
    for(var i = 0; i < spotIdArray.length; i++) {
      if(spotIdArray[i] == spotId) {
        spotIdArray.splice(i, 1);
      }
    }
  }

  this.removeCoordinatesFromArrayByValue = function(markerCoordinate) {
    for(var i = 0; i < coordinates.length; i++) {
      if(coordinates[i] == markerCoordinate) {
        coordinates.splice(i, 1);
      }
    }
  }

}

$(document).ready(function () {
  var googleMap = new GoogleMap()
  googleMap.initialize()
});
