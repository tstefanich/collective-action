/******************************************

Globals

*******************************************/

var totalTime = 10000 * 5;// 60000 * 5;//
var locationWindow;
var currentPosition;


// This could be a json that gets loaded in but I'm not sure if its needed anywhere else besides on the phone...
var allLocations = [
  {
    url:"location-1",
    name: "Ben's House",
    lat: 44.957124,
    lon: -93.283987,
    radius: .1,
    timer:Date.now() - (totalTime * .95), // This is here to that if you open the app inside a location you don't need to wait 5 minutes for the popup to happen.
  },
  {
    url:"location-2",
    name: "Tyler's House",
    lat: 34.045206,
    lon: -118.334594,
    radius: .1,
    timer:Date.now() - (totalTime * .95), // This is here to that if you open the app inside a location you don't need to wait 5 minutes for the popup to happen.

  },
  {
    url:"location-3",
    name: "MCAD",
    lat: 44.956828,
    lon: -93.274653,
    radius: .1,
    timer:Date.now() - (totalTime * .95), // This is here to that if you open the app inside a location you don't need to wait 5 minutes for the popup to happen.
  },
]



/******************************************

Geolocation Functions

*******************************************/

function calcGeoDistance(lat1, lon1, lat2, lon2, units) {
  if(units == 'km'){
     var R = 6371; //earth radius in KM
  }else{
    var R = 3959; // earth radius in Miles (default)
  }
  var dLat = (lat2-lat1) * (Math.PI / 180);
  var dLon = (lon2-lon1) * (Math.PI / 180);
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d;
}


function redirectUserToProperPage(currentPos) {
  for (var i = allLocations.length - 1; i >= 0; i--) {
    // Find slug
    //var $slug = $('.'+allLocation[i].url);
    var passedTime = Date.now() - allLocations[i].timer;

    // Calc distance
    var distance = calcGeoDistance(currentPos.lat, currentPos.lng, allLocations[i].lat, allLocations[i].lon);
    var roundedDistance = distance.toFixed(2); // I needed this for something.... I don't remmeber why...

    if(roundedDistance <= allLocations[i].radius){
      //$slug.removeClass('outside-fence');
      //$slug.addClass('inside-fence');
      if (passedTime > totalTime) {
            //alert( "reset menu" );
            alert('You are at' + allLocations[i].url)
            //$('#'+allLocations[i].slug+'-modal').modal();
            allLocations[i].timer = Date.now(); // Save the current time to restart the timer!
      }

    } else {
      //$slug.addClass('outside-fence');
      //$slug.removeClass('inside-fence');
    } // End if
  } // End For
}


/******************************************

Getting Geolocation from Phone

*******************************************/


function handleLocationError(browserHasGeolocation, locationWindow, pos) {
  //console.log(pos);
  //locationWindow.setPosition(pos);
  //locationWindow.setContent(browserHasGeolocation ?
  //                      'Error: The Geolocation service failed.' :
  //                      'Error: Your browser doesn\'t support geolocation.');
}


if (navigator.geolocation) {
      navigator.geolocation.watchPosition(function(position) {
        // Set as global variable for other functions to use
        currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Update arrays and webpages with current distance data
        redirectUserToProperPage(currentPosition);

      }, function() {
        handleLocationError(true, locationWindow, currentPosition);
      }, {
        enableHighAccuracy: true,
        timeout: 1000,
        maximumAge: 0
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, locationWindow, currentPosition);
    }

/******************************************
socket.io communication
*******************************************/

var socket = io('http://localhost:3000'); //MAKE SSURE TO CHANGE THIS TO THE SERVER'S IP LATER!
socket.on('connect', function(){
console.log('connected to the server as: ' + socket.id);
});


socket.on('next', function(data){
console.log(data);

});

socket.on('myTurn', function(data){
console.log(data);

});


$(window).click(function(){
var clientInfo = { 'hi':'there', 'ho' :'here' }
socket.emit('clientInfo', clientInfo);
})


socket.on('disconnect', function(){
console.log('disconnected from the server as: ' + socket.id);

});


