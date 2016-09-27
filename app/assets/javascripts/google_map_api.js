function GoogleMapAPI() {
  var _this = this
  var map, searchBox
  var markersArray = []
  var geocoder = new google.maps.Geocoder()

  this.initialize = function() {
    _this.getMap()
    _this.getSearchBox()
    _this.searchEvent(searchBox)
    _this.clickEvent()
  }

  this.getSearchBox = function() {
    var input = $("#pac-input")[0]
    searchBox = new google.maps.places.SearchBox(input)
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input)
  }

  this.clickEvent = function() {
    google.maps.event.addListener(map, 'click', function(event) {
      _this.checkForExistingMarkerOnMap()
      _this.checkSpotAvailability(event.latLng)
    })
  }

  this.searchEvent = function(searchBox) {
    google.maps.event.addListener(searchBox, 'places_changed', function() {
      var place = searchBox.getPlaces()[0]

      if(place) {
        // Create/Remove a marker from the search-bar
        _this.checkForExistingMarkerOnMap()  
        _this.checkSpotAvailability(place.geometry.location)
      }
    })
  }

  this.getMap = function() {
    map = new google.maps.Map($("#map-canvas")[0], {
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    })

    var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(24.8902, 78.1759), new google.maps.LatLng(7.8474, 78.2631))
    map.fitBounds(defaultBounds)
  }

  this.getMarker = function(location) {
    var marker = new google.maps.Marker({
      position: location,
      map: map
    })

    markersArray.push(marker)
    marker.setMap(map)
    map.setZoom(14)
    map.panTo(marker.position)
  }

  this.checkSpotAvailability = function(coordinates) {
    $.ajax({
      url: "/admin/spots/check",
      type: "GET",
      data: { latitude: coordinates.lat().toFixed(6), longitude: coordinates.lng().toFixed(6) },
      dataType: "json",
      success: function(data) {
        if(data["success"]) {
          _this.updateCoordinates(coordinates)
          _this.getAddressFromCoordinates(coordinates)
          $("#flash-message").html(null)
        } 
        else {
          $("#flash-message").html("<a class= 'text-danger' href=" + data["link"] + ">Spot is already marked by the name: " + data["spot_name"] + "</a></p>")
        }
      }
    })
  }

  this.checkForExistingMarkerOnMap = function() {
    if(markersArray.length != 0) {
      _this.removeMarker()
    }
  }

  this.getAddressFromCoordinates = function(location) {
    geocoder.geocode({'latLng': location}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          _this.getMarker(location)
          _this.updateAddress(results[0].formatted_address)
        } 
        else { 
          alert('No results found')
        }
      } 
    })
  }

  this.removeMarker = function() {
    for(var i = 0; i < markersArray.length; i++) {
      markersArray[i].setMap(null)
    }
    markersArray = []
  }

  this.updateAddress = function(address) {
    if(address) {
      $("#spot_address").val(address)
    } else {
      $("#spot_address").val($("#pac-input").val())
    }
  };

  this.updateCoordinates = function(coordinates) {
    $("#spot_latitude").val(coordinates.lat().toFixed(6))
    $("#spot_longitude").val(coordinates.lng().toFixed(6))
  }
}

$(document).ready(function() {
  if($('#map-canvas')[0]) {
    var searchBox = new GoogleMapAPI()
    searchBox.initialize()
  }
})