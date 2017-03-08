+function ($) {
  'use strict';

  if ( !$.fn.carousel ) {
    throw new Error( "carousel-swipe required bootstrap carousel" )
  }

  // CAROUSEL CLASS DEFINITION
  // =========================

  var CarouselSwipe = function(element) {
    this.$element    = $(element)
    this.carousel    = this.$element.data('bs.carousel')
    this.options     = $.extend({}, CarouselSwipe.DEFAULTS, this.carousel.options)
    this.startX      =
    this.startY      =
    this.startTime   =
    this.cycling     =
    this.$active     =
    this.$items      =
    this.$next       =
    this.$prev       =
    this.dx          = null
    this.sliding     = false

    this.$element
      .on('touchstart',        $.proxy(this.touchstart,this))
      .on('touchmove',         $.proxy(this.touchmove,this))
      .on('touchend',          $.proxy(this.touchend,this))
      .on('slide.bs.carousel', $.proxy(this.sliding, this))
      .on('slid.bs.carousel',  $.proxy(this.stopSliding, this))
  }

  CarouselSwipe.DEFAULTS = {
    swipe: 50 // percent per second
  }

  CarouselSwipe.prototype.sliding = function() {
    this.sliding = true
  }

  CarouselSwipe.prototype.stopSliding = function() {
    this.sliding = false
  }

  CarouselSwipe.prototype.touchstart = function(e) {
    if (this.sliding || !this.options.swipe) return;
    var touch = e.originalEvent.touches ? e.originalEvent.touches[0] : e
    this.dx = 0
    this.startX = touch.pageX
    this.startY = touch.pageY
    this.cycling = null
    this.width = this.$element.width()
    this.startTime = e.timeStamp
  }

  CarouselSwipe.prototype.touchmove = function(e) {
    if (this.sliding || !this.options.swipe) return;
    var touch = e.originalEvent.touches ? e.originalEvent.touches[0] : e
    var dx = touch.pageX - this.startX
    var dy = touch.pageY - this.startY
    if (Math.abs(dx) < Math.abs(dy)) return; // vertical scroll

    if ( this.cycling === null ) {
      this.cycling = !!this.carousel.interval
      this.cycling && this.carousel.pause()
    }

    e.preventDefault()
    this.dx = dx / (this.width || 1) * 100
    this.swipe(this.dx)
  }

  CarouselSwipe.prototype.touchend = function(e) {
    if (this.sliding || !this.options.swipe) return;
    if (!this.$active) return; // nothing moved
    var all = $()
      .add(this.$active).add(this.$prev).add(this.$next)
      .carousel_transition(true)

    var dt = (e.timeStamp - this.startTime) / 1000
    var speed = Math.abs(this.dx / dt) // percent-per-second
    if (this.dx > 40 || (this.dx > 0 && speed > this.options.swipe)) {
      this.carousel.prev()
    } else if (this.dx < -40 || (this.dx < 0 && speed > this.options.swipe)) {
      this.carousel.next();
    } else {
      this.$active
        .one($.support.transition.end, function () {
          all.removeClass('prev next')
        })
      .emulateTransitionEnd(this.$active.css('transition-duration').slice(0, -1) * 1000)
    }

    all.css('transform', '')
    this.cycling && this.carousel.cycle()
    this.$active = null // reset the active element
  }

  CarouselSwipe.prototype.swipe = function(percent) {
    var $active = this.$active || this.getActive()
    if (percent < 0) {
        this.$prev
            .css('transform', 'translate3d(0,0,0)')
            .removeClass('prev')
            .carousel_transition(true)
        if (!this.$next.length || this.$next.hasClass('active')) return
        this.$next
            .carousel_transition(false)
            .addClass('next')
            .css('transform', 'translate3d(' + (percent + 100) + '%,0,0)')
    } else {
        this.$next
            .css('transform', '')
            .removeClass('next')
            .carousel_transition(true)
        if (!this.$prev.length || this.$prev.hasClass('active')) return
        this.$prev
            .carousel_transition(false)
            .addClass('prev')
            .css('transform', 'translate3d(' + (percent - 100) + '%,0,0)')
    }

    $active
        .carousel_transition(false)
        .css('transform', 'translate3d(' + percent + '%, 0, 0)')
  }

  CarouselSwipe.prototype.getActive = function() {
    this.$active = this.$element.find('.item.active')
    this.$items = this.$active.parent().children()

    this.$next = this.$active.next()
    if (!this.$next.length && this.options.wrap) {
      this.$next = this.$items.first();
    }

    this.$prev = this.$active.prev()
    if (!this.$prev.length && this.options.wrap) {
      this.$prev = this.$items.last();
    }

    return this.$active;
  }

  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  var old = $.fn.carousel
  $.fn.carousel = function() {
    old.apply(this, arguments);
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel.swipe')
      if (!data) $this.data('bs.carousel.swipe', new CarouselSwipe(this))
    })
  }

  $.extend($.fn.carousel,old);

  $.fn.carousel_transition = function(enable) {
    enable = enable ? '' : 'none';
    return this.each(function() {
      $(this)
        .css('-webkit-transition', enable)
        .css('transition', enable)
    })
  };

}(jQuery);

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


$(window).load(function(){
      // Message for Window Loaded
      console.log('window loaded');

      // Check cookie is set for first visit and change
      // animation based on that.
      //checkAndSetCookieForMenu();

      //Check cookie is set for visited artworks
      //checkAndSetCookieForVisitedArtwork();

      // Fade out Loading Screen with a delay of 4 seconds
      $('.loading-container').delay(4000).velocity({opacity: 0},1000,function(){
        $('.page.loading').delay(500).velocity({opacity: 0},1000,function(){
          $(this).remove();
        });
      });

});

var signUpCarouselDirection = 'null';
$("#carousel-intro").carousel();
$("#carousel-sign-up").carousel();
$(".carousel-sign-up-btn").on('click tap', function () {
  // do something…
  var index = $('#carousel-sign-up .active').index('#carousel-sign-up .item');
  index = index + 1;
  var totalLength = $('#carousel-sign-up .item').length;

  if(index == totalLength - 1 && signUpCarouselDirection == 'right'){
       // Reached the end
       $('.sign-up-continue-btn').text('Save');
       $('.sign-up-continue-btn').addClass('btn-primary');
  } else if(index == totalLength && signUpCarouselDirection == 'left') {
      // Going back from the last slide
      $('.sign-up-continue-btn').text('Continue');
      $('.sign-up-continue-btn').removeClass('btn-primary');
  } else if(index == 1 && signUpCarouselDirection == 'left') {
     // Close Sign up
     slideDownPanel($('.page.sign-up .close'));
  }

});


$(document).ready(function(){
     //Fix height problem with intro
     $('#carousel-example-generic').height($(document).height()-$('.page.intro .intro-footer').height());


     // Regenerate Avatar Button
     $('body').on('click tap', '.regenerate-avatar-btn', function(e){
       var totalNumberOfAvatars =  75;
       var r = Math.round(Math.random()*totalNumberOfAvatars)
       $('.regenerate-avatar-image').attr('src', 'assets/images/avatars/avatar_'+ r +'.png')
     });

     // Links to slide additional info
     $('body').on('click tap', '.more-details', function(e){
        console.log('click')
        moreDetails($(this));
     });

     // Close Panels 
     $('body').on('click tap', '.close', function(e){
        slideDownPanel($(this));
     });

});





function moreDetails(click){
     var $this = null;
     // check if object is jquery object
     if(click instanceof jQuery){
          $this = click;
     } else {
          // this is a javascript object
          $this = $('#'+click.id);
     }
     var href = $this.attr("href");
     var hash = href.substr(1);

     //Set Panel from display none to display block
     $('.page.'+hash).css('display','block');

     //If we don't set a slight timeout the css animation won't work.
     setTimeout(function(){
          $('.page.'+hash).addClass('slideUp');
     },100);
}


function slideDownPanel(link){
     var $this = link;

     if($this.parent('.nav').parent('.page').hasClass('sign-up')){
          $('#carousel-sign-up').carousel(0);
     }
     $this.parent('.nav').parent('.page').removeClass('slideUp');
     setTimeout(function(){
       $this.parent('.nav').parent('.page').css('display','none');
     }, 750);
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
