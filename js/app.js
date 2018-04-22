
/*global
ko, $, map
*/
/*jslint for:true */

//this is my data in the form of an object literal but this would ideally come from AJAX:
//helpful blog post: http://benalman.com/news/2010/03/theres-no-such-thing-as-a-json/
var venues = [{
    "venue": "The Masonic",
    "position": {
      "lat": 37.7911829,
      "lng": -122.412938
    },
    "venueId": 5614
  },
  {
    "venue": "Redwood Room, Clift Hotel",
    "position": {
      "lat": 37.7869318,
      "lng": -122.4111049
    },
    "venueId": 937426
  },
  {
    "venue": "Bill Graham Civic Auditorium",
    "position": {
      "lat": 37.7785099,
      "lng": -122.4174684
    },
    "venueId": 65
  },
  {
    "venue": "Slim's",
    "position": {
      "lat": 37.7715171,
      "lng": -122.413259
    },
    "venueId": 1489
  },
  {
    "venue": "SF Jazz",
    "position": {
      "lat": 37.7762522,
      "lng": -122.4215624
    },
    "venueId": 2588888
  },
  {
    "venue": "Hotel Utah Saloon",
    "position": {
      "lat": 37.7795638,
      "lng": -122.398023
    },
    "venueId": 328
  },
  {
    "venue": "The Warfield",
    "position": {
      "lat": 37.7826598,
      "lng": -122.4101811
    },
    "venueId": 949
  }
];

var map;

function initMap() {

  //build the map object:
  map = new google.maps.Map(document.getElementById("map"), {
    center: {
      lat: 37.7749,
      lng: -122.4194
    },
    zoom: 13,
    //sample style from https://developers.google.com/maps/documentation/javascript/examples/style-array
    styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ]
  });
  ko.applyBindings(new ViewModel());
}

// alerts the user if the map object cannot load
function googleError() {
    alert('Google Maps cannot load at this time. Please check your internet connection and try again later.');
}

var ViewModel = function() {

  const API_KEY = "Co6kY8qQPER2gGwi"; //SongKick API Key
  const SONGKICK_LOGO = "<br><img src='./img/powered-by-songkick-pink.png' width='100'>";

  var self = this;

  self.filter = ko.observable("");
  var infowindow = new google.maps.InfoWindow({});

  //create a marker for each object in the venues array and add info window content for each marker:
  venues.forEach(function(venue) {
    venue.marker = new google.maps.Marker({
      map: map,
      animation: google.maps.Animation.DROP,
      position: venue.position,
      icon: "./img/marker.png" //uses a custom icon
    });

    //SongKick API for venue/concert info:
    $.getJSON("http://api.songkick.com/api/3.0/venues/" + venue.venueId + "/calendar.json?apikey=" + API_KEY, function(data) {
      //grab only the part of the reponse payload that we need:
      var results =  data.resultsPage.results;

      //display the venue name as info window title:
      venue.contentString = "<h3>" + venue.venue + " Upcoming Events:</h3>";

      //display a list of events at the venue:
      venue.contentString += "<ul>";
      var arrayLength = results.event.length;

      //only show a max of 5 events for each venue:
      var numberOfEvents = (arrayLength > 5) ? 5 : arrayLength;

      for (var i = 0; i < numberOfEvents; i++) {
        //SongKick API terms of use require that all events displayed contain a link to their page:
        var href = results.event[i].uri;
        venue.contentString += "<li><a href=" + results.event[i].uri + " target='_blank'>" + results.event[i].displayName + "</a></li>"
      }

      venue.contentString += "</ul>";

      if (numberOfEvents == 0) {
        venue.contentString += "<h4>There are no events scheduled at this time</h4>";
      }

    }).fail(function(jqxhr, textStatus, error) {
      venue.contentString = "<h4>Oops! We couldn't contact the Song Kick Server!</h4>";

      //log the error for developer debug
      console.log("Error: " + error);

    }).always(function() {
      //SongKick logo is required per API terms of use
      venue.contentString += SONGKICK_LOGO;

      //build the info window:
      venue.infowindow = new google.maps.InfoWindow({
        content: venue.contentString
      });

      //add the event listener to display the info window:
      google.maps.event.addListener(venue.marker, "click", function() {
        infowindow.open(map, venue.marker);
        infowindow.setContent(venue.contentString);

        //marker should animate on click per Udacity project rubric. I don't like the user experience but here it is:
        venue.marker.setAnimation(google.maps.Animation.DROP);
      });
    });
  });

  //this blog post was helpful in understanding how this function should work:
  //https://www.samatkins.me/building-map-project.html
  self.displayInfo = function(venue) {
    infowindow.open(map, venue.marker);
    infowindow.setContent(venue.contentString);

    //marker animation per https://developers.google.com/maps/documentation/javascript/examples/marker-animations
    if (venue.marker.getAnimation() !== null) {
      venue.marker.setAnimation(null);
    } else {
      venue.marker.setAnimation(google.maps.Animation.DROP);
    }
  };

  /*
  create a filteredItems knockout observable for use in the DOM:
  This post was helpful:
  https://stackoverflow.com/questions/45422066/set-marker-visible-with-knockout-js-ko-utils-arrayfilter
  User experience is better when search is case-insensitive
  */
  self.filteredItems = ko.computed(function() {
    var filter = self.filter().toLowerCase();
    if (!filter) {
      ko.utils.arrayForEach(venues, function(item) {
        item.marker.setVisible(true);
      });
      return venues;
    } else {
      return ko.utils.arrayFilter(venues, function(item) {
        var result = (item.venue.toLowerCase().search(filter) >= 0)
        item.marker.setVisible(result);

        //I'm not sure if animation of markers returned by the search is required?
        //I'm not crazy about the user experience so I'll leave this out for now:
        //item.marker.setAnimation(google.maps.Animation.DROP);

        return result;
      });
    }
  });
}
