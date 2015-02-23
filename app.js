
// namespace
var app = {};
app.endPoint = "";


// global variables required by google api
var directionsDisplay;
var geocoder;
var bounds = new google.maps.LatLngBounds();
var directionsService = new google.maps.DirectionsService();
var map;

// setting the lattitude and longitude
app.toronto = new google.maps.LatLng(app.lat,app.lon);
app.toronto = new google.maps.LatLng(43.64814930000001, -79.3979164);

//set lattitude and longitude to your current location
// called in the init function
app.setLocation = function(){
  app.toronto = new google.maps.LatLng(app.lat, app.lon);
}

// called from click submit
//calls all the google apis/functions
app.getDestination = function() {
  app.endPoint = $('.destInput').val();
  console.log(app.endPoint)
  codeAddress();
  calcRoute();
  calculateDistances();
};

// googles function initialize
function initialize() {
  
  directionsDisplay = new google.maps.DirectionsRenderer();
  geocoder = new google.maps.Geocoder();
  var mapOptions = {
    zoom: 14,
    center: app.toronto,
      // How you would like to style the map. 
      // This is where you would paste any style found on Snazzy Maps.
      styles:[{"featureType":"road","elementType":"geometry.fill","stylers":[{"lightness":-100}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"lightness":-100},{"visibility":"off"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"lightness":100}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"water","stylers":[{"visibility":"on"},{"saturation":100},{"hue":"#006eff"},{"lightness":-19}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"saturation":-100},{"lightness":-16}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"hue":"#2bff00"},{"lightness":-39},{"saturation":8}]},{"featureType":"poi.attraction","elementType":"geometry.fill","stylers":[{"lightness":100},{"saturation":-100}]},{"featureType":"poi.business","elementType":"geometry.fill","stylers":[{"saturation":-100},{"lightness":100}]},{"featureType":"poi.government","elementType":"geometry.fill","stylers":[{"lightness":100},{"saturation":-100}]},{"featureType":"poi.medical","elementType":"geometry.fill","stylers":[{"lightness":100},{"saturation":-100}]},{"featureType":"poi.place_of_worship","elementType":"geometry.fill","stylers":[{"lightness":100},{"saturation":-100}]},{"featureType":"poi.school","elementType":"geometry.fill","stylers":[{"saturation":-100},{"lightness":100}]},{"featureType":"poi.sports_complex","elementType":"geometry.fill","stylers":[{"saturation":-100},{"lightness":100}]}]
  }
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  directionsDisplay.setMap(map);
}

// google function to geocode plain text address
function codeAddress() {
    var address = app.endPoint;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  }

// google function to calculate and draw route
function calcRoute() {
  console.log("calcRoute: "+app.toronto)
  var request = {
      origin: app.toronto,
      destination: app.endPoint,
      // Note that Javascript allows us to access the constant
      // using square brackets and a string value as its
      // "property."
      travelMode: google.maps.TravelMode.WALKING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    }
  });
}

// google function to calculate time of journey (walking)
function calculateDistances() {
  var service = new google.maps.DistanceMatrixService();
  var myLatlng = new google.maps.LatLng(parseFloat(app.lat),parseFloat(app.lon));
  service.getDistanceMatrix(
    {
      origins: [myLatlng],
      destinations: [app.endPoint],
      travelMode: google.maps.TravelMode.WALKING,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    }, callback);
}

// google callback function from calculateDistances
function callback(response, status) {
  if (status != google.maps.DistanceMatrixStatus.OK) {
    alert('Error was: ' + status);
  } else {
    var origins = response.originAddresses;
    var destinations = response.destinationAddresses;
    var outputDiv = document.getElementById('outputDiv');
    outputDiv.innerHTML = '';
    $('#outputDiv').addClass('outputDivShade');

      app.results = response.rows[0].elements;
      app.walkingMin = (app.results[0].duration.value)/60;
      console.log("walking minutes: "+app.walkingMin);
      outputDiv.innerHTML += app.results[0].duration.text + '<br>';

  }
}
google.maps.event.addDomListener(window, 'load', initialize);

// called from init function
app.getStops = function(){
// ajax request to get nearby stops
console.log('Stops: startpoint: '+ app.lat);
$.ajax({
  url : 'http://myttc.ca/near/'+app.lat+','+app.lon+'.json',
  dataType : 'jsonp',
  type : 'GET',

  success : function(result){
    console.log('success function called');
    // now that the data has come back let's display it with another function
    console.log(result.locations);
    app.displayStops(result)
  }
});
} //end getStops

// called from getStops
app.displayStops = function(result){
  // we need to clear out any old stops to make way for the new ones
  $('#stops').html('');
  var stops = result.locations;
  var placeholder = $('<option>').text('choose a stop');
  $('#stops').append(placeholder);
  // loop through each stop and display it
  if(stops.length>0){
    for(var i=0;i<stops.length;i++){
      //create an option element to add to the select (dropdown)
      var option = $('<option>').text(stops[i].name).attr('value', stops[i].uri);
      console.log(stops[i].name);
      //add option to #stops select (dropdown)
      $('#stops').append(option);
    } // end for loop
  } // end of if
  console.log("ready to display the stops with this data &&&&&: ",result);
} // end artApp.displayStops

//called from change on Directions dropdown menu
app.displayTimes = function(result,direction){
  console.log('the direction: '+direction);
  var $div = $('#outputDiv2')
  //clear div 
  $div.html('');
  $div.addClass('outputDivShade');
  // if routes even exist
  if(result.stops[direction].routes[0]){
    var stopTimes = result.stops[direction].routes[0].stop_times;
    var stopRoute = result.stops[direction].routes[0].name;
    var now = new Date();
    var route = $('<h4>').text(stopRoute)
    $div.append(route);
    // get the 'how many minutes' until next two cars/buses
    app.transitWait = [];
    for(i=0;i < 2;i++){
      var departureTime = stopTimes[i].departure_timestamp;
      var date = new Date(departureTime * 1000);
      var minFromNow = Math.ceil(Math.abs(date - now)/(1000*60));
      app.transitWait.push(minFromNow);
      if(minFromNow > 60){
        var p = $('<p>').text("more than an hour!!!");
        $div.append(p);
        //only print "more than an hour" once
        break;
      }else{
        var p = $('<p>').text("in "+minFromNow +" min");  
      }
      $div.append(p);
    } // end of for loop
  } else {
    // if no routes: Nope
    var h2 = $('<h2>').text("Nope");
    $div.append(h2);
  } // end of the if
  var h4 = $('<h4>').text(now)
} //end of app.displayTimes

// called from getStopOptions
app.displayStopDirections = function(result){
  var stops = result.stops;
  $('#directions').html('');
  console.log("THE STOPS",result);
  $('#directions').append($('<option>').text('Select your direction'))
  for(i=0;i<stops.length;i++){
    var name = stops[i].name;
    var direction = name.split(" ")[0];
    var option = $('<option>').text(direction).attr('value', i);
    console.log(stops[i].name);
    //add option to #directions select (dropdown)
    $('#directions').append(option);
    $('#directions').removeClass('hidden');
    console.log(direction);
    console.log(name);
  }
}// end displayStopDirections

//called from change on Stops dropdown menu
app.getStopOptions = function(stop){
// ajax request to get info for specific stop for directions
$.ajax({   
  url : 'http://myttc.ca/'+stop+'.json',
  dataType : 'jsonp',
  type : 'GET',

  success : function(result){
    console.log('success getStopOptions function called');
    app.result = result;
    app.displayStopDirections(result);
  }
});
} //end getStopOptions

// called from init
app.displayWeather = function(conditions){
  $('.weather').text(conditions.temp_c);
  console.log(conditions.weather);
  app.temperature = conditions.temp_c;
  app.weather = conditions.weather.toString();
  console.log(app.weather);
  if(app.weather.indexOf('Snow') > -1){
    $('.weatherImg').attr('src', 'images/snowy.png');
  }else if(app.weather.indexOf('Rain') > -1){
    $('.weatherImg').attr('src', 'images/rainy.png');
  } else if(app.weather.indexOf('Sun') > -1){
    $('.weatherImg').attr('src', 'images/sunny.png');
  } else {
    $('.weatherImg').attr('src', 'images/otherWeather.png');
  }
} // end app.displayWeather

// make the final decision on what mode of transportation you should take
app.decision = function(){
  //set transitWait index to 0
  i = 0;
  //if the next streetcar coming in a minute or less reset transitWait index to 1
  if(app.transitWait[i] <= 1){
    i = 1;
  }

  //clear advice
  $div = $('.advice')
  $div.html('');
  app.finalDecision = '';

  // decision logic
  if(app.temperature > 20){
    if(app.walkingMin < 45 && app.weather.indexOf('Rain') <= -1){
      console.log("you should walk");
      h2 = $('<h2>').text("It's so nice out! Enjoy it while we have it :). Take a walk");
      app.finalDecision = 'walk';
    } else {
      if (app.transitWait[i] <= 10){
        console.log("you should transit");
        h2 = $('<h2>').text("It's a little bit far, probably best to jump on transit");
        app.finalDecision = 'transit';
      } else {
        console.log("you should uber");
        app.finalDecision = 'uber';
        h2 = $('<h2>').text("Transit sucks, take uber!");
      } 
    }
  }
  if(app.temperature > 0 && app.temperature < 20){
    if(app.walkingMin < 20){
      console.log("you should walk");
      h2 = $('<h2>').text("These days aren't going to be around forever. Take a walk");
      app.finalDecision = 'walk';
    } else {
      if (app.transitWait[i] <= 10){
        console.log("you should transit");
        h2 = $('<h2>').text("Hop on some transit. The better way");
        app.finalDecision = 'transit';
      } else {
        console.log("you should uber");
        h2 = $('<h2>').text("Transit sucks, take uber!");
        app.finalDecision = 'uber';
      } 
    }
  }
  if(app.temperature > -10 && app.temperature <= 0){
    if(app.walkingMin <= 10 ){
      console.log("you should walk");
      h2 = $('<h2>').text("It's chilly, but not that far. Take a walk :)");
      app.finalDecision = 'walk';
    } else {
      if (app.transitWait[i] <= 5){
        console.log("you should transit");
        h2 = $('<h2>').text("Transit will be here any minute, jump on!");
        app.finalDecision = 'transit';
      } else {
        console.log("you should uber");
        h2 = $('<h2>').text("Ain't nobody got time for this, take uber!");
        app.finalDecision = 'uber';
      } 
    }
  }
  if(app.temperature > -20 && app.temperature <= -10){
    if(app.walkingMin <= 10 ){
      console.log("you should walk");
      h2 = $('<h2>').text("It's cold! Walk fast!");
      app.finalDecision = 'walk';
    } else {
      if (app.transitWait[i] <= 3){
        console.log("you should transit");
        h2 = $('<h2>').text("I promise the wait won't be long, just take transit");
        app.finalDecision = 'transit';
      } else {
        console.log("you should uber");
        h2 = $('<h2>').text("it's too cold for this, take uber!");
        app.finalDecision = 'uber';
      } 
    }
  } 
  if(app.temperature <= -20){
    console.log("you should uber");
    h2 = $('<h2>').text("take uber!");
    app.finalDecision = 'uber';
  }
  //print out decision to advice div
  $div.append(h2);

  // grey out all but the final decision
  if(app.finalDecision === 'walk'){
    $('#outputDiv3').text('');
    $('#content-pane1').removeClass('grey-scale');
    $('#content-pane2').addClass('grey-scale');
    $('#content-pane3').addClass('grey-scale');
  }
  if(app.finalDecision === 'transit'){
    $('#outputDiv3').text('');
    $('#content-pane1').addClass('grey-scale');
    $('#content-pane2').removeClass('grey-scale');
    $('#content-pane3').addClass('grey-scale');
  }
  if(app.finalDecision === 'uber'){
    $('#outputDiv3').text('Uber!');
    $('#content-pane1').addClass('grey-scale');
    $('#content-pane2').addClass('grey-scale');
    $('#content-pane3').removeClass('grey-scale');
  }
} // end of app.decision

// get toronto weather from weather api
app.getWeather = function(){
  $.ajax({
    url: "http://api.wunderground.com/api/6013d362ce14c604/conditions/q/Ontario/Toronto.json",
    type: "GET",
    dataType: "json",
    success : function(result){
      console.log("success");
      app.displayWeather(result.current_observation);
    }
  }); //end ajax    
} // end app.getWeather


// called from ready function 
app.init =  function() {
    app.startPoint = navigator.geolocation.getCurrentPosition(function(position) {
      console.log("Start Point: "+position.coords.latitude);
      app.lat = position.coords.latitude;
      app.lon = position.coords.longitude;
      app.setLocation();
    // using geolocation, immediately get stops nearby
      app.getStops();
    });
    // get weather for toronto
    app.getWeather();

    // listens for submitting "where to?"
    $('form').on('submit', function(e){
      e.preventDefault();
      app.getDestination();
      $('.destInput').val(' ');
      $('#stops').removeClass('hidden');
    });

    // listens for a change on stops dropdown menu
    $( "#stops" ).change(function() {
      app.getStopOptions($(this).val());
    });

    // listens for a change on directions dropdown menu
    $( "#directions" ).change(function() {
      direction = $(this).val(); 
      app.displayTimes(app.result,direction)
      $('#advice').removeClass('hidden');
    });

    // listens for 'what should i do?' button
    $('#advice').on('click', function(){
      app.decision();
    });
} // end of init function


// Ready function: start here 

$(function() {
  app.init(); 


}); //end ready
