var DEBUG = true;
if(!DEBUG){
    if(!window.console) window.console = {};
    var methods = ["log", "debug", "warn", "info"];
    for(var i=0;i<methods.length;i++){
        console[methods[i]] = function(){};
    }
}




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
    if (e.currentTarget.id == 'carousel-sign-up') return;
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
    if (e.currentTarget.id == 'carousel-sign-up') return;
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
    if (e.currentTarget.id == 'carousel-sign-up') return;
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



var touch = 'ontouchstart' in document.documentElement
            || navigator.maxTouchPoints > 0
            || navigator.msMaxTouchPoints > 0;

if (touch) { // remove all :hover stylesheets
    try { // prevent exception on browsers not supporting DOM styleSheets properly
        for (var si in document.styleSheets) {
            var styleSheet = document.styleSheets[si];
            if (!styleSheet.rules) continue;

            for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
                if (!styleSheet.rules[ri].selectorText) continue;

                if (styleSheet.rules[ri].selectorText.match(':hover')) {
                    styleSheet.deleteRule(ri);
                }
            }
        }
    } catch (ex) {}
}



function convertSpreadsheetToSources(json){
   //https://stackoverflow.com/questions/30082277/accessing-a-new-style-public-google-sheet-as-json
        console.log('parsing Google Spreadsheet');
        //console.log(json);

        for (var i = 0; i < json.feed.entry.length; i++) {
          //  This is console.log for the each row in the spreadsheet
          //console.log( json.feed.entry[i]);
          var title = json.feed.entry[i].gsx$title.$t;
          var authors = json.feed.entry[i].gsx$authors.$t;
          var org = json.feed.entry[i].gsx$org.$t;
          var link = json.feed.entry[i].gsx$sources.$t;

          // Make a newly formatted Master List/Array
          // of all of the projects
          var source = '<div class="source-container" style="text-indent:0px;margin-left:40px;"><a href="'+link+'">'+title+'</a> - '+ authors+ ' - '+org+'</div>';
          $('.page.about .container p:last-child').append(source);

        //marker.setVisible(true);
        }
        console.log('parsed Google Spreadsheet');


}
/******************************************

Globals

*******************************************/

var totalTime = 1000 * 5;// 60000 * 5;//
var locationWindow;
var currentPosition;

/****
Map Globals
****/
var infowindow;
var googleMap;
var mapMinZoom = 14;
var mapMaxZoom = 19;
var content;
var title;
var allProjects = []; // This may be fine to be just become allLocations
var allMarkers = [];
var allCircles = [];


// This could be a json that gets loaded in but I'm not sure if its needed anywhere else besides on the phone...
var allLocations = [
  {
    url:"westbank",
    name: "Ben's House",
    lat: 44.957124,
    lon: -93.283987,
    radius: .16,
    timer:Date.now() - (totalTime * .95), // This is here to that if you open the app inside a location you don't need to wait 5 minutes for the popup to happen.
    googleMapsLink: "https://www.google.com/maps/place/2438+Grand+Ave+S,+Minneapolis,+MN+55405/",
    description: "Ben Moren is a Minneapolis based media artist working at the intersection of filmmaking, performance, and creative coding. His projects investigate the disappearing separation between the digital and natural worlds. He has created site specific and mixed reality projects for the Northern Spark Festival in Minneapolis, Kultur Park in Berlin, and the Weisman Art Museum. He has exhibited at the Soap Factory, the Minneapolis Institute of Arts, the Chicago Artists Coalition, and the Beijing Film Academy. He co-founded and facilitates the WZFR, an experimental rural filmmaking residency in western Wisconsin. He is an Assistant Professor at the Minneapolis College of Art and Design teaching in the Media Arts department and the Web+Multimedia Environments major.",
    image:'bens-house.jpg',
    icon:'white-pin.png',

  },
  /*{
    url:"location-2",
    name: "Tyler's House",
    lat: 34.045206,
    lon: -118.334594,
    radius: .16,
    timer:Date.now() - (totalTime * .95), // This is here to that if you open the app inside a location you don't need to wait 5 minutes for the popup to happen.
    googleMapsLink:"https://www.google.com/maps/place/1641+La+Fayette+Rd,+Los+Angeles,+CA+90019/",
    description: "Tyler Stefanich (b.1985) is an artist and designer. His work, through installations and performances, uses software-based systems to explore issues related to history, memory and identity. Stefanich received a BFA in Interactive Media from the Minneapolis College of Art and Design, and earned an MFA from UCLA in Media Art. Currently he lives and works in Los Angeles, California, as manager of the UCLA Game Lab, a creative research center that combines art and technology as well as Web Director at Northern Lights.mn, a media arts organization based in Minnesota.",
    image:'tylers-house.jpg',
    icon:'white-pin.png',
  },
  {
    url:"location-3",
    name: "MCAD",
    lat: 44.956828,
    lon: -93.274653,
    radius: .16,
    timer:Date.now() - (totalTime * .95), // This is here to that if you open the app inside a location you don't need to wait 5 minutes for the popup to happen.
    googleMapsLink: "https://www.google.com/maps/place/2501+Stevens+Ave,+Minneapolis,+MN+55404/",
    description: "The Minneapolis College of Art and Design (MCAD) is a private, nonprofit four-year and postgraduate college specializing in the visual arts. Located in the Whittier neighborhood of Minneapolis, Minnesota, United States, MCAD currently enrolls more than 700 students offering education in painting, drawing, animation, entrepreneurial studies, sculpture, printmaking, papermaking, photography, filmmaking, illustration, graphic design, book arts, furniture design, liberal arts, comic art, web design, and sustainable design. MCAD is one of just a few major art schools to offer a major in comic art.",
    image:'mcad.jpg',
    icon:'white-pin.png',
  },
  {
    url:"location-4",
    name: "UCLA",
    lat: 34.075768,
    lon: -118.4432951,
    radius: .16,
    timer:Date.now() - (totalTime * .95), // This is here to that if you open the app inside a location you don't need to wait 5 minutes for the popup to happen.
    googleMapsLink:"https://www.google.com/maps/place/240+Charles+E+Young+Dr+N,+Los+Angeles,+CA+90095/",
    description: "The University of California, Los Angeles (UCLA) is a public research university in the Westwood district of Los Angeles, California, United States. It became the Southern Branch of the University of California in 1919, making it the second-oldest undergraduate campus of the ten-campus system after the original University of California campus in Berkeley (1873).[10] It offers 337 undergraduate and graduate degree programs in a wide range of disciplines.[11] UCLA enrolls about 31,000 undergraduate and 13,000 graduate students,[6] and had 119,000 applicants for Fall 2016, including transfer applicants, the most applicants for any American university.",
    image:'ucla.jpg',
    icon:'white-pin.png',

  },
*/


{
    url:"studio",
    name: "Studio",
    lat:  45.0054778,
    lon: -93.2486953,
    radius: .16,
    timer:Date.now() - (totalTime * .95), // This is here to that if you open the app inside a location you don't need to wait 5 minutes for the popup to happen.
    googleMapsLink:"https://www.google.com/maps/place/240+Charles+E+Young+Dr+N,+Los+Angeles,+CA+90095/",
    description: "The University of California, Los Angeles (UCLA) is a public research university in the Westwood district of Los Angeles, California, United States. It became the Southern Branch of the University of California in 1919, making it the second-oldest undergraduate campus of the ten-campus system after the original University of California campus in Berkeley (1873).[10] It offers 337 undergraduate and graduate degree programs in a wide range of disciplines.[11] UCLA enrolls about 31,000 undergraduate and 13,000 graduate students,[6] and had 119,000 applicants for Fall 2016, including transfer applicants, the most applicants for any American university.",
    image:'ucla.jpg',
    icon:'icon_commons.png',
  },
  {
    url:"commons",
    name: "Commons",
    lat:  44.975737,
    lon: -93.261539,
    radius: .16,
    timer:Date.now() - (totalTime * .95), // This is here to that if you open the app inside a location you don't need to wait 5 minutes for the popup to happen.
    googleMapsLink:"https://www.google.com/maps/place/240+Charles+E+Young+Dr+N,+Los+Angeles,+CA+90095/",
    description: "The University of California, Los Angeles (UCLA) is a public research university in the Westwood district of Los Angeles, California, United States. It became the Southern Branch of the University of California in 1919, making it the second-oldest undergraduate campus of the ten-campus system after the original University of California campus in Berkeley (1873).[10] It offers 337 undergraduate and graduate degree programs in a wide range of disciplines.[11] UCLA enrolls about 31,000 undergraduate and 13,000 graduate students,[6] and had 119,000 applicants for Fall 2016, including transfer applicants, the most applicants for any American university.",
    image:'ucla.jpg',
    icon:'icon_commons.png',
  },
  {
    url:"westbank",
    name: "Westbank",
    lat:  44.969050,
    lon: -93.246891,
    radius: .16,
    timer:Date.now() - (totalTime * .95), // This is here to that if you open the app inside a location you don't need to wait 5 minutes for the popup to happen.
    googleMapsLink:"https://www.google.com/maps/place/240+Charles+E+Young+Dr+N,+Los+Angeles,+CA+90095/",
    description: "The University of California, Los Angeles (UCLA) is a public research university in the Westwood district of Los Angeles, California, United States. It became the Southern Branch of the University of California in 1919, making it the second-oldest undergraduate campus of the ten-campus system after the original University of California campus in Berkeley (1873).[10] It offers 337 undergraduate and graduate degree programs in a wide range of disciplines.[11] UCLA enrolls about 31,000 undergraduate and 13,000 graduate students,[6] and had 119,000 applicants for Fall 2016, including transfer applicants, the most applicants for any American university.",
    image:'ucla.jpg',
    icon:'icon_cedarriverside.png',
  },
  {
    url:"littleafrica",
    name: "Little Africa",
    lat:  44.956528,
    lon: -93.166645,
    radius: .16,
    timer:Date.now() - (totalTime * .95), // This is here to that if you open the app inside a location you don't need to wait 5 minutes for the popup to happen.
    googleMapsLink:"https://www.google.com/maps/place/240+Charles+E+Young+Dr+N,+Los+Angeles,+CA+90095/",
    description: "The University of California, Los Angeles (UCLA) is a public research university in the Westwood district of Los Angeles, California, United States. It became the Southern Branch of the University of California in 1919, making it the second-oldest undergraduate campus of the ten-campus system after the original University of California campus in Berkeley (1873).[10] It offers 337 undergraduate and graduate degree programs in a wide range of disciplines.[11] UCLA enrolls about 31,000 undergraduate and 13,000 graduate students,[6] and had 119,000 applicants for Fall 2016, including transfer applicants, the most applicants for any American university.",
    image:'ucla.jpg',
    icon:'icon_littleafrica.png',
  },
  {
    url:"rondo",
    name: "Rondo",
    lat:  44.954729,
    lon: -93.149774,
    radius: .16,
    timer:Date.now() - (totalTime * .95), // This is here to that if you open the app inside a location you don't need to wait 5 minutes for the popup to happen.
    googleMapsLink:"https://www.google.com/maps/place/240+Charles+E+Young+Dr+N,+Los+Angeles,+CA+90095/",
    description: "The University of California, Los Angeles (UCLA) is a public research university in the Westwood district of Los Angeles, California, United States. It became the Southern Branch of the University of California in 1919, making it the second-oldest undergraduate campus of the ten-campus system after the original University of California campus in Berkeley (1873).[10] It offers 337 undergraduate and graduate degree programs in a wide range of disciplines.[11] UCLA enrolls about 31,000 undergraduate and 13,000 graduate students,[6] and had 119,000 applicants for Fall 2016, including transfer applicants, the most applicants for any American university.",
    image:'ucla.jpg',
    icon:'icon_rondo.png',
  },
  {
    url:"littlemekong",
    name: "Little Mekong",
    lat:  44.955431,
    lon: -93.116884,
    radius: .16,
    timer:Date.now() - (totalTime * .95), // This is here to that if you open the app inside a location you don't need to wait 5 minutes for the popup to happen.
    googleMapsLink:"https://www.google.com/maps/place/240+Charles+E+Young+Dr+N,+Los+Angeles,+CA+90095/",
    description: "The University of California, Los Angeles (UCLA) is a public research university in the Westwood district of Los Angeles, California, United States. It became the Southern Branch of the University of California in 1919, making it the second-oldest undergraduate campus of the ten-campus system after the original University of California campus in Berkeley (1873).[10] It offers 337 undergraduate and graduate degree programs in a wide range of disciplines.[11] UCLA enrolls about 31,000 undergraduate and 13,000 graduate students,[6] and had 119,000 applicants for Fall 2016, including transfer applicants, the most applicants for any American university.",
    image:'ucla.jpg',
    icon:'icon_littlemekong.png',
  },
  {
    url:"lowertown",
    name: "Lowertown",
    lat:  44.949736,
    lon: -93.084645,
    radius: .16,
    timer:Date.now() - (totalTime * .95), // This is here to that if you open the app inside a location you don't need to wait 5 minutes for the popup to happen.
    googleMapsLink:"https://www.google.com/maps/place/240+Charles+E+Young+Dr+N,+Los+Angeles,+CA+90095/",
    description: "The University of California, Los Angeles (UCLA) is a public research university in the Westwood district of Los Angeles, California, United States. It became the Southern Branch of the University of California in 1919, making it the second-oldest undergraduate campus of the ten-campus system after the original University of California campus in Berkeley (1873).[10] It offers 337 undergraduate and graduate degree programs in a wide range of disciplines.[11] UCLA enrolls about 31,000 undergraduate and 13,000 graduate students,[6] and had 119,000 applicants for Fall 2016, including transfer applicants, the most applicants for any American university.",
    image:'ucla.jpg',
    icon:'icon_lowertown.png',
  }




//commons:
//Westbank: 44.969050, -93.246891
//Little Africa: 44.956528, -93.166645
//Rondo: 44.954729, -93.149774
//Little Mekong: 44.955431, -93.116884
//Lowertown: 44.949736, -93.084645
]





function gaInit() {
  $.getScript('//www.google-analytics.com/analytics.js'); // jQuery shortcut
  window.ga = window.ga || function () { (ga.q = ga.q || []).push(arguments) }; ga.l = +new Date;
  ga('create', 'UA-100777467-1', 'auto');

  console.log("Initalized");
  ga('send', 'pageview');
  return ga;
};

function gaTrack(e) {
  var path = e.currentTarget.pathname + e.currentTarget.hash;
  var title = e.currentTarget.hash.substr(1);
  var track =  { page: path, title: title};

  ga = window.ga || gaInit();

  ga('set', track);
  ga('send', 'pageview');

  console.log("Tracked");
};




function showArtworkClose(){
   var closeButton = $('.close.artwork');
   closeButton.css('display','block');
   closeButton.delay(500).velocity({opacity: 1}, 500);
  }

  function hideArtworkClose(){
   var closeButton = $('.close.artwork');
   closeButton.velocity({opacity: 0}, 200, function(){
      closeButton.css('display','none');
   });
  }

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
     console.log('redirectUserToProperPage');
  var areYouNearAPlayArea = false;
  for (var i = allLocations.length - 1; i >= 0; i--) {
    // Find slug
    //var $slug = $('.'+allLocation[i].url);
    var passedTime = Date.now() - allMarkers[i].timer;

    // Calc distance
    var distance = calcGeoDistance(currentPos.lat, currentPos.lng, allMarkers[i].position.lat(), allMarkers[i].position.lng());
    var roundedDistance = distance.toFixed(2); // I needed this for something.... I don't remmeber why...
    if(roundedDistance <= allMarkers[i].radius){
      console.log('redirectUserToProperPage 2');

      //allMarkers[i].insideFence = true;
      //$slug.removeClass('outside-fence');
      //$slug.addClass('inside-fence');
      console.log(passedTime);
      console.log(totalTime);
      areYouNearAPlayArea = true;


      $('.play-buttons-container a').removeClass('inside-fence');
      $('.play-button.warning').removeClass('inside-fence');
      $('.play-button.warning').addClass('outside-fence');

      $('.nav.artwork.close .title').html('<span>'+allLocations[i].url+'</span>');

      $('.play-buttons-container a[href="#'+allLocations[i].url+'"]').addClass('inside-fence');

      //if (passedTime > totalTime) {
        //    console.log($('#'+allMarkers[i].slug+'-modal'));
            //alert( "reset menu" );

            //alert('You are at' + allMarkers[i].slug)
            //$('#'+allMarkers[i].slug+'-modal').modal();
            //allMarkers[i].timer = Date.now(); // Save the current time to restart the timer!
      //}

    } else {
            $('.play-buttons-container a[href='+allLocations[i].url+']').removeClass('inside-fence');
            $('.play-buttons-container a[href='+allLocations[i].url+']').addClass('outside-fence');

      //$slug.addClass('outside-fence');
      //$slug.removeClass('inside-fence');
    } // End if
  } // End For

  if(areYouNearAPlayArea == false){
    $('.play-buttons-container a').removeClass('inside-fence');
    $('.play-button.warning').addClass('inside-fence');
  }
}


/******************************************

Getting Geolocation from Phone

*******************************************/


function handleLocationError(err, locationWindow, pos) {
  console.log(err);
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
        $('.geolocation-warning').css('display','none');
        // Update arrays and webpages with current distance data
        updateMarkerDistances(currentPosition);

        // Sets custom Marker for your location
        displayLocation(currentPosition);

        // Update arrays and webpages with current distance data
        redirectUserToProperPage(currentPosition);

        $('.loading-container').delay(500).velocity({opacity: 0},500,function(){
        $('.page.loading').delay(100).velocity({opacity: 0},500,function(){
          $(this).remove();
        });
      });
      }, function(err) {
        handleLocationError(err, locationWindow, currentPosition);
        if(err.code != 3){
              $('.loading-container').delay(500).velocity({opacity: 0},500,function(){
                $('.page.loading').delay(100).velocity({opacity: 0},500,function(){
                  $(this).remove();
                });
              });
        }
      }, {
        enableHighAccuracy: true,
        timeout: 1000,
        maximumAge: 0
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, locationWindow, currentPosition);
    }

function resizeImages(){
      console.log('window loaded');
      var newHeight = $(window).height();
      newHeight = newHeight - ($('.intro-footer').outerHeight() * 2) ;

      // Intro Slide show & Signup
      $('.page.intro .carousel-inner').css('margin-top', ($('.intro-footer').outerHeight() * 1.2)+'px' );
      $('.page.intro .carousel-inner .item img').css('height', newHeight+'px');
      $('.regenerate-avatar-image').css('height', newHeight-100+'px');
      //$('.regenerate-avatar-image').css('background-size', 'auto '+newHeight+'px' );

      // Homescreen
      //$('.avatar-image').css('height', newHeight-20+'px');

      //Team Singup Page
      var newHeight = $(window).height();
      newHeight = newHeight - ($('.intro-footer').outerHeight() * 2) - 21 ;
      $('.confirmation-sign-up .container .image').css('height', newHeight+'px');
}

function resizeAvatar(){
      console.log('window loaded');
      var newHeight = $(window).height();
      newHeight = newHeight - ($('.intro-footer').outerHeight() * 2) - 36 -60 ;

      // Homescreen
      $('.avatar-image').css('height', newHeight-2+'px');
}

function generateAvatar(){
    var totalNumberOfAvatars = 294;
    var r = Math.ceil(Math.random()*totalNumberOfAvatars)
    $('.regenerate-avatar-image').css('background-image', 'url(assets/images/avatars/'+ r +'.png)')
    $('.regenerate-avatar-image').attr('data-avatar-id', r );
}


function buildPlayButtonsForLocations(){
  for (var i = allLocations.length - 1; i >= 0; i--) {
    console.log('marker button')
    $('.play-buttons-container').append('<a class="btn btn-default more-details project-launcher artwork outside-fence" style="width:100%;" href="#'+allLocations[i].url+'" data-project-url="game-client?location='+allLocations[i].url+'" >Play</a>')
  }
}


$(document).ready(function(){
    shareMenu.writeSocialMediaImageToTempCanvas();
    gaInit()
          //Build Different Play buttons For locations
      buildPlayButtonsForLocations()
});

$(window).resize(function(){
  resizeImages();
  resizeAvatar();

})
$(window).load(function(){
      //shareMenu.onLoadCreateFileIfItDoesNotExsist();

      generateAvatar();
      updateStatsAndScores();

      // Message for Window Loaded
      resizeImages();
      resizeAvatar();


      shareMenu.writeSocialMediaLinks();

      // setTimeout(function(){
      //  $('#playGame').click() //for testing
      // },5000)

      //Parse Locations
      parseLocations(allLocations);

      // Initialize Google Maps
      initMap();

      // Check if you are logged in and set avatar info page
      // Check cookie is set for first visit and change
      // animation based on that.
      //checkAndSetCookieForMenu();

      //Check cookie is set for visited artworks
      //checkAndSetCookieForVisitedArtwork();

      // Fade out Loading Screen with a delay of 4 seconds











           //Fix height problem with intro
     $('#carousel-example-generic').height($(document).height()-$('.page.intro .intro-footer').height());

     //Fix height problem with sign-up
     $('#carousel-sign-up .carousel-inner .item').height($(document).height());




     $('body').on('touchstart', '.btn', function(e){
       e.stopPropagation(); e.preventDefault();
       $(this).blur();
       console.log('test');
     });


     // Regenerate Avatar Button
     $('body').on('tap', '.regenerate-avatar-btn', function(e){
      generateAvatar();
     });
      // Regenerate Avatar Button
     $('body').on('touchstart', '.regenerate-avatar-btn', function(e){
       generateAvatar();
     });

     // Regenerate Avatar Image
     $('body').on('tap', '.regenerate-avatar-image', function(e){
      generateAvatar();
     });
      // Regenerate Avatar Image
     $('body').on('touchstart', '.regenerate-avatar-image', function(e){
       generateAvatar();
     });


     // Links to slide additional info
     $('body').on('touchstart', '.more-details', function(e){
          console.log($(this).hasClass('logout'))
                 gaTrack(e);
                 if($(this).hasClass('logout')){
                   login.logout();
                 }
        moreDetails($(this));
     });

     // $('body').on('tap', '.more-details', function(e){
     //   console.log('click')
     //   if($(this).hasClass('logout')){
     //     login.logout();
     //   }
     //   moreDetails($(this));
//
     //});

     $('body').on('touchstart', 'a.social-media', function(e){
          gaTrack(e);
     });



     // Close Panels
     $('body').on('touchstart', '.close', function(e){
        e.stopPropagation();
        console.log('clicked close');
        slideDownPanel($(this));
     });


    // Close Warning When you click Find locations
     $('body').on('touchstart', '.warning-find-locations', function(e){
        e.stopPropagation();
        //console.log('clicked close');
        slideDownPanel($(this).parent().siblings('.nav').children('.close'));
     });


      $('body').on('tap', '.close', function(e){
        e.stopPropagation();
        console.log('tapped close');
        slideDownPanel($(this));
     });


     //**********/
     /*  Login  */
     /***********/
     login.init();
     login.checkIfLoggedIn();
     //**********/
     /* Sign up */
     /***********/
     signUp.init();

     // Fixes problem where button stays in active styles when pressed
     $('.btn').mouseup(function(e){
          // Removes focus of the button.
          $(this).blur();
     });

     $('.btn-default').mouseup(function(e){
          // Removes focus of the button.
          $(this).blur();
     });

});



/*************************

Login Functions

**************************/

var login = {
     emailTextFieldIsFilled:false,
     init:function(){
          $("#carousel-intro").carousel();
          login.eventListeners();
          login.checkIfFieldsAreFilled();
     },
     enableContinueButton:function(){
          $('.login-in-button-container').removeClass('disable')
     },
     disableContinueButton:function(){
          $('.login-in-button-container').addClass('disable')
     },
     checkIfLoggedIn:function(){
          if(store.get('user')){
               slideDownPanel($('.page.login .close'));
               slideDownPanel($('.page.intro .close'));
               login.setAvatarPageInfo();
               console.log('logged in');
          } else {

          }
     },
     checkIfFieldsAreFilled:function(){
          $('.form-control.email-address.login').on('keyup blur', function(event) {
                var emailSlideActive = $('#carousel-sign-up .item.email-sign-up').hasClass('active');
               if($.trim($(this).val()) != '' && emailSlideActive == true){
                    login.emailTextFieldIsFilled = true;
                    console.log('Input Email Filled');
                    login.enableContinueButton();
                    //
               } else {
                    login.emailTextFieldIsFilled = false;
                    login.disableContinueButton();
                    console.log('Input Email Empty');
               }
          });
          $('.more-details.logout').on('click touchstart', function(event) {
               login.logout();
          });
     },
     eventListeners:function(){
          $('body').on('touchstart', '.login-continue-btn', function(e){
               switch(true){
                    case $('#carousel-sign-up .item.email-sign-up').hasClass('active'):
                        // Break
                        var email = $('input.email-address.login').val();
                        $.post("/get-user",{email: email}, function(data){
                             console.log(data);
                             if(data){ // Email is in the database already

                                  console.log('you have a login');
                                  login.retrieveFromDatabase(data);
                                  login.setAvatarPageInfo();
                                  shareMenu.writeSocialMediaImageToTempCanvas();
                                  setTimeout(function(){
                                        shareMenu.writeSocialMediaLinks();
                                       slideDownPanel($('.page.login .close'));
                                       slideDownPanel($('.page.intro .close'));
                                  },500);
                             } else {
                                  $('.page.login').addClass('show-error');
                                  console.log('there is no email with the name');

                             }

                        });
                        //login.retrieveFromDatabase();
                        break;
               }
          });
     },
     setAvatarPageInfo:function(){
      var user = store.get('user');
      console.log('url(assets/images/avatars/'+user.avatar+'');
      $('.avatar-image').css('background-image','url(assets/images/avatars/'+user.avatar+')');
      $("body").addClass("dummyClass").removeClass("dummyClass");

     },
     retrieveFromDatabase:function(data){
          console.log(data)
          store.set('user',
               {
                    userName: data.userName,
                    email: data.email,
                    avatar: data.avatar, // This could be an object... with key values that are descriptive.. head, body ect... might be overkill
                    team: data.team,
                    //tasksPlayed: 'Array',
                    //maybe WaitTime:

                    // METRICS
                    score: data.score,
                    locationsVisited: data.locationsVisited, // not required, but tyler wanted it
               }
          );

     },
     logout:function(){
          store.clearAll();
          window.location.replace('http://joincollectiveaction.com');
          console.log('madeit');
     },
}
/*************************

Sign up Functions

**************************/
var signUpCarouselDirection = 'null';


var signUp = {
     index:0,
     carousel:$('#carousel-sign-up'),
     button:$('.sign-up-continue-btn'),
     pages:$('#carousel-sign-up .item').length,
     emailTextFieldIsFilled:false,
     usernameTextFieldIsFilled:false,
     init:function(){
          $("#carousel-sign-up").carousel();
          // $('.form-control.username').val(generateUsername());
          signUp.eventListeners();
          signUp.checkIfFieldsAreFilled();
          // $('.form-control.username').attr('placeholder', generateUsername())
     },
     goToNextSlide:function(){
          signUp.hideErrorMessages();
          signUp.carousel.carousel('next');
     },
     getCurrentPageIndex:function(){
          $('#carousel-sign-up .active').index('#carousel-sign-up .item');
     },
     enableContinueButton:function(){
          $('.sign-up-button-container').removeClass('disable')
     },
     disableContinueButton:function(){
          $('.sign-up-button-container').addClass('disable')
     },
     validateEmail:function(mail)
     {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(mail);
     },
     checkIfFieldsAreFilled:function(){
          $('.form-control.email-address').on('keyup blur', function(event) {
               var emailText = signUp.validateEmail($.trim($(this).val()))
               if(emailText){
                    signUp.emailTextFieldIsFilled = true;
                    console.log('Input Email Filled');
                    signUp.enableContinueButton();
                    //
               } else {
                    signUp.emailTextFieldIsFilled = false;
                    signUp.disableContinueButton();
                    console.log('Input Email Empty');
               }
          });
          $('.form-control.username').on('keyup blur', function(event) {
               if($.trim($(this).val()) != ''){
                    signUp.usernameTextFieldIsFilled = true;
                    signUp.enableContinueButton();
                    console.log('Input username Filled');
               } else {
                    signUp.usernameTextFieldIsFilled = false;
                    signUp.disableContinueButton();

                    console.log('Input username empty');

               }
          });
     },
     databaseHasEmail:function(){
          //put your cases here
          var email_address = $('input.email-address').val();
          $.post("/check-email",{email: email_address.toLowerCase()}, function(data){
               if(data == true){ // Email is in the database already
                    $('#carousel-sign-up .item.email-sign-up').addClass('show-error');
               } else if(data == false){
                    signUp.goToNextSlide();
                    //signUp.disableContinueButton();
                    setTimeout(function(){
                      // This is a fix for timing with keyup / blur problem
                      if(!signUp.usernameTextFieldIsFilled){
                        signUp.disableContinueButton();
                        console.log('test');
                      }
                    }, 50);
               }
          });
     },
     hideErrorMessages:function(){
          $('#carousel-sign-up .item.email-sign-up').removeClass('show-error');
          $('#carousel-sign-up .item.username-sign-up').removeClass('show-error-profane');
          $('#carousel-sign-up .item.username-sign-up').removeClass('show-error');
     },
     databaseHasUser:function(){
          //put your cases here
          var user_name = $('input.username').val();
          $.post("/check-user",{userName: user_name}, function(data){
               console.log(data);

              $('#carousel-sign-up .item.username-sign-up').removeClass('show-error-profane');
              $('#carousel-sign-up .item.username-sign-up').removeClass('show-error-special-characters');
              $('#carousel-sign-up .item.username-sign-up').removeClass('show-error');


               if(data === 'blank'){ // Email is in the database already
                    //$('#carousel-sign-up .item.username-sign-up').addClass('show-error-profane');
               } else if(data === 'profane'){ // Email is in the database already
                    $('#carousel-sign-up .item.username-sign-up').addClass('show-error-profane');
               } else if(data === 'specialCharacters') {
                    $('#carousel-sign-up .item.username-sign-up').addClass('show-error-special-characters');
               } else if(data === 'spaces') {
                    $('#carousel-sign-up .item.username-sign-up').addClass('show-error-spaces');
               } else if(data == true){ // Email is in the database already
                    $('#carousel-sign-up .item.username-sign-up').addClass('show-error');
               } else if(data == false){
                    signUp.goToNextSlide();
               }
          });
     },
     styleButtonToSave:function(){
          //somethingb
          this.button.text('Save');
          this.button.attr('href', '#homescreen');
          this.button.addClass('btn-primary');
     },
     styleButtonToContinue:function(){
          // Going back from the last slide
          this.button.text('Continue');
          this.button.attr('href', 'continue');
          this.button.removeClass('btn-primary');
     },
     saveToDatabase:function(button){
          //You clicked Save button
          // If Team is null give random number // COuld delete after playing
          var team;
          if($('.confirmation-sign-up .container .image').attr('data-team-id') == null){
            team = Math.ceil(Math.random() * 4);
          } else {
            team = $('.confirmation-sign-up .container .image').attr('data-team-id');
          }

               var userObject = {
                    userName: $('input.username').val(),
                    email: $('input.email-address').val().toLowerCase(),
                    avatar: $('.regenerate-avatar-image').attr('data-avatar-id')+'.png', // This could be an object... with key values that are descriptive.. head, body ect... might be overkill
                    team: team,

                    //tasksPlayed: 'Array',
                    //maybe WaitTime:

                    // METRICS
                    score: 0,
                    locationsVisited: [], // not required, but tyler wanted it
               }
               store.set('user',userObject);
                console.log(userObject);
          $.post("/save-user",userObject, function(data){
                 console.log(data);
                 login.setAvatarPageInfo();
                 shareMenu.writeSocialMediaImageToTempCanvas();
                 moreDetails(button);
                //Slide Down Signup page
                setTimeout(function(){
                      shareMenu.writeSocialMediaLinks();
                     slideDownPanel($('.page.sign-up .close'));
                     slideDownPanel($('.page.intro .close'));
                },500);
             });
          // Slide up Main menu / Home

     },
     setAndWriteTeamInfo(teamID){
        // Add image to

        console.log(teamID);
        var teamContainer = $('.confirmation-sign-up .container .image');
        teamContainer.attr('data-team-id',teamID);
        teamContainer.css('background-image' , 'url(assets/images/team/'+teamID+'.png)');
        teamContainer.css('background-position' , 'center center');
        teamContainer.css('background-size' , 'contain');
        teamContainer.css('background-repeat' , 'no-repeat');

        // HomeScreen
        $('.stats .top .team-id').html('<img style="height:30px;margin-top:-8px;margin-bottom:4px;" src="assets/images/teamicons/'+teamID+'.png">')

        var teamText = '';
        if(teamID == 1){
          teamText = 'Water<br>Team';
        } else if(teamID == 2) {
          teamText = 'Air<br>Team';
        } else if(teamID == 3) {
          teamText = 'Earth<br>Team';
        } else if(teamID == 4) {
          teamText = 'Fire<br>Team';
        }

        $('.stats .bottom .team-id').html(teamText)



     },
     checkTeamsAndSetTeam:function(){
      $.ajax({
        type: "GET",
        url: "get-team",
        dataType: 'json'

      }).done(function(data) {
        //console.log('saved');
        signUp.setAndWriteTeamInfo(data._id);
    });

     },
     preFillInUserName:function(){
      $('.form-control.username').val(generateUsername());
         if($.trim($('.form-control.username').val()) != ''){
              signUp.usernameTextFieldIsFilled = true;
              signUp.enableContinueButton();
              console.log('Input username Filled');
         } else {
              signUp.usernameTextFieldIsFilled = false;
              signUp.disableContinueButton();
              console.log('Input username empty');
         }
     },
     eventListeners:function(){
      console.log('test');
       $('body').on('touchstart', '.generate-username-btn', function(e){
         signUp.preFillInUserName();
       });

          $('body').on('touchstart', '.sign-up-continue-btn', function(e){
                        console.log('pushed forward!!');

               switch(true){
                    case $('#carousel-sign-up .item.email-sign-up').hasClass('active'):
                         signUp.databaseHasEmail();

                         signUp.checkTeamsAndSetTeam();
                         if(signUp.usernameTextFieldIsFilled){

                              //signUp.disableContinueButton();

                         } else {
                          signUp.preFillInUserName();
                         }
                         break;
                    case $('#carousel-sign-up .item.username-sign-up').hasClass('active'):
                         //put your cases here
                         // There will be a delay while the database is checking
                         signUp.databaseHasUser();
                         break;
                    case $('#carousel-sign-up .item.avatar-sign-up').hasClass('active'):
                         //put your cases here
                         signUp.goToNextSlide();
                         signUp.styleButtonToSave();
                         signUp.checkTeamsAndSetTeam();
                         break;
                    case $('#carousel-sign-up .item.confirmation-sign-up').hasClass('active'):
                         //put your cases here
                         signUp.saveToDatabase($(this));
                         break;
               }
          });

          $('body').on('touchstart click', '.sign-up-back-btn', function (e) {
             signUpCarouselDirection = 'left';
            $('#carousel-sign-up').carousel('prev');
            // do something…
            switch(true){
                 case $('#carousel-sign-up .item.email-sign-up').hasClass('active'):
                      slideDownPanel($('.page.sign-up .close'));
                      break;
                 case $('#carousel-sign-up .item.username-sign-up').hasClass('active'):
                      //put your cases here
                      setTimeout(function(){
                              signUp.enableContinueButton();
                              console.log('enable')
                      },100)
                      break;
                 case $('#carousel-sign-up .item.avatar-sign-up.active').hasClass('active'):
                      //put your cases here
                      break;
                 case $('#carousel-sign-up .item.confirmation-sign-up').hasClass('active'):
                      //put your cases here
                      signUp.styleButtonToContinue();
                      break;
            }
          });
     }



}






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

     if($this.hasClass('artwork')){
          showArtworkClose();

          console.log('artwork');

          // Get project desc panel and send it to marker as visited function
          var $thisProject = $this.parents('.project-slide-panel');
          //setMarkerAsVisited($thisProject);


          //console.log($this.attr('data-project-url'));
          var projectUrl = $this.attr('data-project-url');
          var $iframe = $('.iframe.project-slide-panel');
          //customProblemsAndFixesArtwork($('.slideUp.project-slide-panel'));

          //Set Panel from display none to display block
          $iframe.css('display','block');

          //Set Panel src
          $iframe.attr('src',projectUrl);

          //If we don't set a slight timeout the css animation won't work.
          setTimeout(function(){
            $iframe.addClass('slideUp');
          },100);

        }  else {

                    //Set Panel from display none to display block
                    $('.page.'+hash).css('display','block');

                    //If we don't set a slight timeout the css animation won't work.
                    setTimeout(function(){
                         $('.page.'+hash).addClass('slideUp');
                    },100);

                    var currentPageImage = $('.project-slide-panel.'+hash).find('.location-image-large');
                    var currentPage = $('.project-slide-panel.'+hash);
                    var currentImage = currentPage.attr('data-image')
                   if(currentPageImage.length){
                     $('<img/>').attr('src', '/assets/images/locations/'+currentImage+'-large.jpg').load(function() {
                      $(this).remove(); // prevent memory leaks as @benweet suggested
                      currentPageImage.css('background-image', 'url(/assets/images/locations/'+currentImage+'-large.jpg)');
                      currentPageImage.delay(700).velocity({opacity: 1},600);
                     });
                   }

           }
}


function slideDownPanel(link){
     var $this = link;

     if($this.hasClass('artwork')){
          var $iframe = $('.iframe.project-slide-panel');
          hideArtworkClose();

          $iframe.velocity({opacity: 0}, 150, function(){

            setTimeout(function(){
              $iframe.css('display','none');
              $iframe.attr('src', $iframe.attr('data-fake-src'));
              $iframe.removeClass('slideUp');

              setTimeout(function(){
                $iframe.removeClass('white'); // This is a fix for some of the projects
                $('.close.artwork').removeClass('black'); // This is a fix for some of the projects
                $iframe.css('opacity','1');
              },250);

            }, 550);



          });


        } else {
     if($this.parent('.nav').parent('.page').hasClass('sign-up')){
          $('#carousel-sign-up').carousel(0);
     }
     $this.parent('.nav').parent('.page').removeClass('slideUp');
     setTimeout(function(){
       $this.parent('.nav').parent('.page').css('display','none');
     }, 650);

     }
}


/******************************************
Map
*******************************************/

/****
Map Helper Functions
****/
String.prototype.stringToSlug = function() { // <-- removed the argument
    var str = this; // <-- added this statement

    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes
    return str;
};

function getMiles(i) {
    return i*0.000621371192;
}
function getMeters(i) {
  return i*1609.344;
}

function disableGoogleMapsFontFromLoading(){
     var head = document.getElementsByTagName('head')[0];

     // Save the original method
     var insertBefore = head.insertBefore;

     // Replace it!
     head.insertBefore = function(newElement, referenceElement) {

         if (newElement.href && newElement.href.indexOf('https://fonts.googleapis.com/css?family=Roboto') === 0) {

             console.info('Prevented Roboto from loading!');
             return;
         }

         insertBefore.call(head, newElement, referenceElement);
     };

}

function updateMarkerDistances(currentPos) {

    for (var i = allMarkers.length - 1; i >= 0; i--) {
      var $slug = $('.'+allMarkers[i].slug);
      var passedTime = Date.now() - allMarkers[i].timer;
      var distance = calcGeoDistance(currentPos.lat, currentPos.lng, allProjects[i].locationLat, allProjects[i].locationLng);
      var roundedDistance = distance.toFixed(2);
      //console.log(allMarkers[i].slug +'-'+ roundedDistance);
      allMarkers[i].distance = roundedDistance;
      $slug.find('.marker-distance').html(allMarkers[i].distance);


      allMarkers[i].setVisible(true);
      //allCircles[i].setOptions({fillOpacity:1, strokeOpacity:1});
      allCircles[i].setOptions({fillOpacity:0, strokeOpacity:0});

      console.log(allMarkers[i].slug);

      if(allMarkers[i].distance <= allMarkers[i].radius){
            $slug.removeClass('outside-fence');
            $slug.addClass('inside-fence');
            allMarkers[i].insideFence = true;
            // Has five seconds passed?
            if (passedTime > totalTime) {
             ///////////$('#'+allMarkers[i].slug+'-modal').modal();
              allMarkers[i].timer = Date.now(); // Save the current time to restart the timer!
            }
      } else {
        allMarkers[i].insideFence = false;
          $slug.addClass('outside-fence');
          $slug.removeClass('inside-fence');
      }

    }


  }
  function findMarkerWithCertainLatLng(circleLat, circleLng){
    for (var i = allMarkers.length - 1; i >= 0; i--) {
      //console.log(parseFloat(circleLat) == allMarkers[i].getPosition().lat());

      if(circleLat == allProjects[i].locationLat && circleLng == allProjects[i].locationLng){
        console.log('made it');
        //console.log(allMarkers[i]);
        return allMarkers[i];
      }
    }
  }

  function findCircleWithCertainLatLng(lat, lng){
    for (var i = allCircles.length - 1; i >= 0; i--) {
      if(lat == allProjects[i].locationLat && lng == allProjects[i].locationLng){
        return allCircles[i];
      }
    }
  }



/****
Map Main Functions
****/

function initMap() {
    disableGoogleMapsFontFromLoading();

    var bounds = new google.maps.LatLngBounds();



        googleMap = new google.maps.Map(document.getElementById('map'), {
              zoom: 15,
              maxZoom:25, //
              minZoom:5, //15 might be good
              backgroundColor: 'none',
              disableDefaultUI: true,
              center: {lat:  34.045206, lng: -118.334594},

              styles: googleMapStyles
              //mapTypeId: google.maps.MapTypeId.TERRAIN
            });


    // MAP listener
    google.maps.event.addListener(googleMap, "dragstart", function() {
        toggleFollowCurentLocation = false;
        //$('.gps').removeClass('active');
        console.log('dragged')
    });

    // Create the shared infowindow with two DIV placeholders
    // One for a text string, the other for the StreetView panorama.
    content = document.createElement("DIV");
    title = document.createElement("DIV");
    content.appendChild(title);
    //streetview.style.width = "200px";
    //streetview.style.height = "200px";
    //content.appendChild(streetview);
    //infowindow = new google.maps.InfoWindow({
    //  content: content,
    //  maxWidth: 150,
    //});


    infowindow = new InfoBubble({
        map: googleMap,
        content: content,
        position: new google.maps.LatLng(-35, 151),
        shadowStyle: 0,
        padding: 12,
        backgroundColor: 'rgb(255,255,255)',
        borderRadius: 4,
        maxWidth: 183,
        minWidth: 183,
        //arrowSize: 10,
        borderWidth: 2,
        borderColor: '#f05a28',
        disableAutoPan: true,
        hideCloseButton: true,
        //maxheight:'auto',
        //arrowPosition: 30,
        backgroundClassName: 'info-window',
        //arrowStyle: 2
    });

    //locationWindow = new google.maps.InfoWindow({map: googleMap});

    //for (var i = polygons.length - 1; i >= 0; i--) {
    //  var mapPoly = new google.maps.Polygon({
    //  paths:  polygons[i].coords,
    //    strokeColor: '#FF0000',
    //    strokeOpacity: 0.8,
    //    strokeWeight: 2,
    //    fillColor: '#FF0000',
    //    fillOpacity: 0.35
    //  });
    //  mapPoly.setMap(map);
    //
    //
    //  for (var j = polygons[i].coords.length - 1; j >= 0; j--) {
    //    bounds.extend(new google.maps.LatLng(polygons[i].coords[j].lat, polygons[i].coords[//j].lng));
    //  };
    //};

    for (var i = allProjects.length - 1; i >= 0; i--) {

        jQuery.get('/assets/images/locations/' + allProjects[i].locationImage + '');

        allMarkers[i] = new google.maps.Marker({
            position: new google.maps.LatLng(allProjects[i].locationLat, allProjects[i].locationLng),
            map: googleMap,
            distance: 0,
            visited: false,
            timer: Date.now() - (totalTime * .95), // This is here to that if you open the app inside a location you don't need to wait 5 minutes for the popup to happen.
            radius: allProjects[i].locationRadius,
            projectTitle: allProjects[i].projectTitle,
            projectUrl: allProjects[i].projectUrl,
            name: allProjects[i].name,
            insideFence: false,
            slug: allProjects[i].slug,
            locationImage: '<div class="info-window-image" style="display:none;background-image:url(./assets/images/locations/' + allProjects[i].locationImage + ');background-position:no-repeat;background-size:cover;background-position:center;"></div>',
            locationName: allProjects[i].locationName,
            //content: data.name,
            icon: {
                url: './assets/images/maps/'+allProjects[i].icon, // url
                scaledSize: new google.maps.Size(36, 50), // scaled size
                origin: new google.maps.Point(0,0), // origin
                anchor: new google.maps.Point(18,50) // anchor
               },
            //zone:data.zone,
            zIndex: 9,
            //type:data.type
        });


        allCircles[i] = new google.maps.Circle({
            strokeColor: '#f05a28',
            strokeOpacity: 1,
            strokeWeight: 2,
            fillColor: '#ffffff',
            fillOpacity: 1,
            map: googleMap,
            center: new google.maps.LatLng(allProjects[i].locationLat, allProjects[i].locationLng),
            radius: getMeters(allProjects[i].locationRadius)
        });


        // This zooms map out to fit all locations
        bounds.extend(new google.maps.LatLng(allProjects[i].locationLat, allProjects[i].locationLng));

        /***********************
         Google Map Event Listeners
        ***********************/
        google.maps.event.addListener(allMarkers[i], "click", function() {
            googleMap.panTo(this.getPosition());
            googleMap.panBy(0, -150);
            //panTo(this.getPosition().lat(), this.getPosition().lng());
            openInfoWindow(this);
            //alert(allMarkers[i].artistName);
        });


        google.maps.event.addListener(allCircles[i], "click", function() {
            googleMap.panTo(this.center);
            googleMap.panBy(0, -150);
            //panTo(this.getPosition().lat(), this.getPosition().lng());
            console.log(this.center.lat() + '----' + this.center.lng());
            var markerInsideCircle = findMarkerWithCertainLatLng(this.center.lat(), this.center.lng().toFixed(6));
            console.log(markerInsideCircle);
            openInfoWindow(markerInsideCircle);
            //console.log(this);
            //alert(allMarkers[i].artistName);
        });

        google.maps.event.addListener(googleMap, 'mousedown', function() {
           infowindow.close();
         });


    }

    googleMap.fitBounds(bounds);


}






function parseLocations(json) {
   console.log('parsed location JSON');
   for (var i = 0; i < json.length; i++) {

       var tempObject = {
           slug: json[i].name.stringToSlug(),
           projectUrl: json[i].url,
           locationName: json[i].name, // This function was add for Laxart which is often spell like La><art
           locationImage: json[i].image,
           locationLat: json[i].lat,
           locationLng: json[i].lon,
           locationRadius: json[i].radius,
           googleMapsLink: json[i].googleMapsLink,
           description:json[i].description,
           icon:json[i].icon,
           distance: 9999,
       }

       // Make a newly formatted Master List/Array
       // of all of the projects
       allProjects.push(tempObject);

   }
   createModalsForEachLocation();
   //sortPanels();
};

function createModalsForEachLocation(){
    console.log('modals constructed');

    for (var i = allProjects.length - 1; i >= 0; i--) {
         var content = '<div class="outside-fence project-slide-panel page '+allProjects[i].slug+' scrollable" data-lat="'+allProjects[i].locationLat+'" data-lng="'+allProjects[i].locationLng+'" data-image="'+allProjects[i].locationImage.slice(0, -4)+'" style="display:none">'+
                         '<div class="nav">'+
                           '<div class="close glyphicon glyphicon-menu-left"></div>'+
                         '</div>'+
                         '<div class="location-image" style="margin-top:-10px;background-image:url(/assets/images/locations/'+allProjects[i].locationImage.slice(0, -4)+'.jpg);-webkit-filter: blur(5px);-moz-filter: blur(5px);-o-filter: blur(5px);-ms-filter: blur(5px);filter: blur(5px);"></div><div class="location-image location-image-large" style=" position: absolute;top: 50px;opacity:.01;"></div>'+
                         '<div class="text-container">'+
                           '<div class="outside-fence-text">'+
                             '<div class="alert alert-danger" style="text-align:center"><strong>*</strong>You are currently too far away to play (approximately <span class="marker-distance">'+allProjects[i].distance+'</span> miles away). </div>'+
                             '<a target="_blank" href="'+allProjects[i].googleMapsLink+'" role="button" class="btn btn-default" >Get Directions</a>'+
                           '</div>'+
                          '<div class="inside-fence-text">'+
                             '<div class="alert alert-success" style="text-align:center"><strong>*</strong>You are currently in proximity to play!</div>'+
                             '<a class="project-launcher btn btn-default more-details artwork" data-project-url="'+allProjects[i].projectUrl+'" href="#'+allProjects[i].slug+'-game" role="button" >Play Now!</a>'+
                           '</div>'+
                         '<div class="project-container">'+
                         '<h2 class="project-title"><strong><i>'+allProjects[i].locationName+'</i></strong></h2>'+
                         //'<h3><strong>'+allProjects[i].name+'</strong> <a class="artist-bio btn btn-primary" href="#'+allProjects[i].slug+'-bio" role="button" style="font-size:10px;padding:2px 6px;">Artist Bio</a></h3>'+
                         '<p>'+allProjects[i].description+'</p>'+
                         '</div>'+
                       '</div>'+
                     '</div>';



      var contentModal = '<div class="modal" id="'+allProjects[i].slug+'-modal" tabindex="-1" role="dialog" aria-labelledby="'+allProjects[i].slug+'-modal-label">'+
                          '<div class="modal-dialog" role="document">'+
                            '<div class="modal-content">'+
                              '<div class="modal-header">'+
                                '<div type="button" class="close glyphicon glyphicon glyphicon-remove" data-dismiss="modal" aria-label="Close"></div>'+
                                '<h4 class="modal-title" id="myModalLabel">You have made it!</h4>'+
                              '</div>'+
                              '<div class="modal-body">'+
                                '<div class="project-image" style="background-image:url(./assets/images/locations/'+allProjects[i].locationImage+');margin-bottom: 16px;height:200px;"></div>'+
                                'You are near <span class="project-name"><i>'+allProjects[i].locationName+'</i>.</span> Click more details to play!'+
                              '</div>'+
                              '<div class="modal-footer">'+
                                '<div class="row">'+
                                  '<div class="col-xs-6" style="padding-right:7.5px;">'+
                                    '<a href="#'+allProjects[i].slug+'" role="button" class="btn btn-default more-details"  data-dismiss="modal">More Details</a>'+
                                  '</div>'+
                                  '<div class="col-xs-6" style="padding-left:7.5px;">'+
                                    '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'+
                                  '</div>'+
                                '</div>'+
                              '</div>'+
                            '</div>'+
                          '</div>'+
                        '</div>';

      $('body').append(content);
      $('body').append(contentModal);
    };
}


function openInfoWindow(marker) {
        title.innerHTML = '<strong style="color:#f05a28;text-transform:uppercase;width:100%;display:inline-block;text-align:center;" >' + marker.locationName + '</strong><br><div class="more-details-container" ><a class="btn btn-default more-details" id="'+marker.slug+'-more-details-maps" style="display:none" href="#'+marker.slug+'" onclick="moreDetails(this);">More Details</a></div>';
        infowindow.open(googleMap, marker);
}


/***************************************

Custom Marker

***************************************/

var myMarker = 0;
function displayLocation( position ) {
  // create a new LatLng object for every position update
  var myLatLng = new google.maps.LatLng( position.lat, position.lng );
  // build entire marker first time thru
  if ( !myMarker ) {
   // define our custom marker image
   var getUser = store.get('user');
   var markerImage;
   if(getUser){
      var avatar = getUser.avatar.split('.');
      avatarID = avatar[0];
      markerImage = avatarID+'-head.png'
      console.log('/assets/images/avatars/'+markerImage);
   } else {
      //return;
   }
   // then create the new marker
   myMarker = new google.maps.Marker({
      //flat: true,
      map: googleMap,
      title: 'I might be here',
      position: myLatLng,
      zIndex:9999,
      icon: {
         url: '/assets/images/avatars/'+markerImage,
        //size: new google.maps.Point( 16, 16 ),
              scaledSize: new google.maps.Size(36, 36), // scaled size
              origin: null, // origin
              anchor: new google.maps.Point(18,18) // anchor
      },
      optimized: false,
      // visible: true
   });
   console.log('made custom marker');
  // just change marker position on subsequent passes
  } else {
   myMarker.setPosition( myLatLng );
   //console.log('made custom marker set position');

  }

  // center map view on every pass
  //googleMap.setCenter( myLatLng );
}


function zoomInOnMyLocation(){
  googleMap.panTo(new google.maps.LatLng(currentPosition.lat, currentPosition.lng));
  googleMap.setZoom(18);
  //googleMap.setCenter( new google.maps.LatLng(currentPosition.lat, currentPosition.lng );
}



function drawImageScaled(img, ctx) {
   var canvas = ctx.canvas ;
   var hRatio = canvas.width*.7  / img.width    ;
   var vRatio =  canvas.height*.7 / img.height  ;
   var ratio  = Math.min ( hRatio, vRatio );
   var centerShift_x = ( canvas.width - img.width*ratio ) / 2;
   var centerShift_y = ( canvas.height - img.height*ratio ) / 2;
   //ctx.clearRect(0,0,canvas.width, canvas.height);
   ctx.drawImage(img, 0,0, img.width, img.height,
                      centerShift_x,centerShift_y,img.width*ratio, img.height*ratio);
}

var shareMenu = {
  canvas: null,
  writeSocialMediaImageToTempCanvas: function(){
    var getUser = store.get('user');
    if(getUser == undefined){
        // You are not logged in
    } else if(!getUser.hasOwnProperty('socialMediaImageSave')){

          var f = new Image();
          var userAvatar = new Image();

              this.canvas = document.createElement("canvas");
              var tCtx = this.canvas.getContext("2d");
              this.canvas.width = 1600;
              this.canvas.height = 1600;

          tCtx.fillStyle = "white";
          tCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

          f.onload = function() {
             tCtx.drawImage(f, 0,0, 3333, 3333, 0, 0, 1600, 1600);

              userAvatar.onload = function() {
                  var offsetX = 0.5;   // center x
                    var offsetY = 0.5;   // center y
                  //drawImageProp(tCtx, userAvatar, 0, 0, shareMenu.canvas.width, shareMenu.canvas.height, offsetX, offsetY);
                  drawImageScaled(userAvatar, tCtx );
                  //tCtx.drawImage(userAvatar,shareMenu.canvas.width/2-userAvatar.width/4,shareMenu.canvas.height/2-userAvatar.height/4, userAvatar.width/2, userAvatar.height/2);

                  console.log('!!!!!');
                  shareMenu.onLoadCreateFileIfItDoesNotExsist();
                  shareMenu.writeSocialMediaLinks();
              };
              userAvatar.src = '/assets/images/avatars/'+getUser.avatar;
          };
          f.src = '/assets/images/share/frame/1.png';


    }
  },
  onLoadCreateFileIfItDoesNotExsist:function(){
    var getUser = store.get('user');

    if(getUser == undefined){
        // You are not logged in
    } else if(!getUser.hasOwnProperty('socialMediaImageSave')){

      var img = this.canvas.toDataURL("image/png");
      $.ajax({
        type: "POST",
        url: "share-save",
        data: {
           image: img,
           userName: getUser.userName
        }
      }).done(function(o) {
        //console.log('saved');
        //console.log(o);
        getUser = store.get('user');
        getUser.socialMediaImageSave = 'true';
        store.set('user', getUser);
        // If you want the file to be visible in the browser
        // - please modify the callback in javascript. All you
        // need is to return the url to the file, you just saved
        // and than put the image in your browser.

    });

    } // End if
  },
writeSocialMediaLinks:function(){

    var getUser = store.get('user')
    if(getUser){


    var title = encodeURIComponent('Meet '+getUser.userName+' from #CollectiveAction at ');
    var titleFacebook = encodeURIComponent('Meet '+getUser.userName+' from #CollectiveAction');

    //var titleEmail = encodeURIComponent('#CollectiveAction at #NorthernSpark');
    var description = encodeURIComponent('Sign up and play at http://collectiveaction.info #ClimateChangeIsReal #act #NorthernSpark');
    var image = encodeURIComponent('http://joincollectiveaction.com/assets/images/social-media/ns2017/'+getUser.userName+'.png');


    var permalink = encodeURIComponent('http://joincollectiveaction.com/share/'+getUser.userName);
    var permalinkSave = 'http://joincollectiveaction.com/assets/images/social-media/ns2017/'+getUser.userName+'.png';

    var emailHref = 'mailto:?subject='+ title + '&body='+title + ' '+ permalink +' ' +description;
    var twitterHref = 'https://twitter.com/intent/tweet?text='+ titleFacebook + '&amp;url='+ permalink +'&amp;source=';
    var facebookHref = 'https://www.facebook.com/sharer/sharer.php?u='+ permalink +'&picture='+ image +'&title='+ titleFacebook + '&caption=&quote=&description='+ description;
    var textMessageHref = 'sms:?body='+encodeURIComponent(title + ' '+ permalink +' ' +description)+'' ;


    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("iphone") > -1 || ua.indexOf("ipad") > -1){
        textMessageHref = 'sms:&body='+encodeURIComponent(title + ' ' +description)+'' ;
    }

    //var tumblrHref = 'https://www.tumblr.com/share/link?url='+ permalink +'&title=#CollectiveAction at #NorthernSpark&content='+ title + '&amp;s=';
    console.log(permalinkSave);
    $('.menu-share .container #twitter').attr('href' , twitterHref);
    $('.menu-share .container #facebook').attr('href' , facebookHref);
    $('.menu-share .container #text-message').attr('href' , textMessageHref);
    //$('.menu-share .container #tumblr').attr('href' , tumblrHref);
    $('.menu-share .container #email').attr('href' , emailHref);
    $('.menu-share .container #save-button').attr('href' , permalinkSave);
    $('.menu-share .container #save-button').attr('download' , getUser.userName);

    $('.menu-share .container #save-button-instagram').attr('href' , permalinkSave);
    $('.menu-share .container #save-button-instagram').attr('download' , getUser.userName);
    console.log('SOCIALK MEDIA')
    }
  },

}

function updateStatsAndScores(){
  var getUser = store.get('user');
  if(getUser){
    // name ID
    var name = getUser.userName;
    updateMyName(name);

    // Team ID
    var teamID = getUser.team;
    signUp.setAndWriteTeamInfo(teamID);

    // My Score
    var myScore = getUser.score;
    updateMyScore(myScore);

    // Locations Visited
    var locationsVisited = getUser.locationsVisited.length;
    updateLocationsVisited(locationsVisited);

    //Team score....
    //var locationsVisited = getUser.locationsVisited.length;
    //updateLocationsVisited(locationsVisited);





  }
}
function updateMyName(name){
    $('.page.homescreen .nav .title').html(name);
    //$('.stats .bottom .my-score').html(teamText);
}
function updateLocationsVisited(numberOfLocations){
    $('.stats .top .locations-visited').html(numberOfLocations+'/6');
    //$('.stats .bottom .my-score').html(teamText);
}
function updateMyScore(myScore){
    $('.stats .top .my-score').html(myScore);
    //$('.stats .bottom .my-score').html(teamText);
}

function generateUsername(){
//way of being, things, action
// [kind] of [thing] that can be [discribed]
  var first = ['Kooky','Sunny','Happy','Rainy','Light','Heavy','Windy','Cloudy','Chipper','Wild','Grumpy','Silly','Active','Sneaky','Jumpy','Flippy','Smelly','Wierd','Strange','Odd', 'Normal', 'Plain', 'Squishy', 'Green','Magenta','Blue','Purple','Nice','Magic','Orange','Cool','Sloppy','Slow','Fast','Hungry','Sleepy','Short','Tall','Peppy','Standing','Sitting','Shiny','Loud', 'Quiet', 'Chirpy','Good','Lumpy','Old', 'Young', 'Big', 'Little', 'Lovely', 'Loopy', 'Floppy', 'Hip', 'Cold', 'Icy', 'Droopy', 'Spotted', 'Stripey', 'Small', 'Huge', 'Tiny', 'Wavy', 'Fun', 'Boring', 'Speedy' ];

  var second =
  ['Worm','Bug','Bird','River','Mountain','Owl','Canoe','Boat','Tree','Turtle','Lake','Otter','Bee','Fly','Wolf','Leaf','Pollen','Pants','Cloud','Raindrop','Iceberg','Heatwave','Shoe','Oar','Sail','Grass','Sand','Rock','Water','Sky','Sun','Moon','Planet','Ocean','Nest','Moose','Bear','Ant','Spider','Fish','Plant','Snack','Bike','Earth','Snail', 'Hill', 'Valley', 'Reef', 'Coral', 'Snowshoe', 'Tent', 'Glacier', 'Ice', 'Sea', 'Ship', 'Stone', 'Sandal', 'Root', 'Puddle', 'Lightning', 'Thunder', 'Data', 'Flower' ];

  var third = ['Dance','Party','Jump','Paddle','Trip','Skip','Walk','Run','Stand','Shout','Stampede','Parade','Race','Commute','Highfive','Hug','Snooze','Nap','Hike','Garden','Friend','Popsicle','Flag','Chant', 'Flight', 'Roll', 'Storm', 'Drawing', 'Painting', 'Sketch', 'Book', 'Farm', 'Song', 'Border', 'Race', 'Activist', 'Action', 'Sign', 'Print', 'Talk', 'Machine', 'System', 'Season', 'Time', 'Task', 'Project', 'Movie', 'Sport', 'Geyser', 'Flow', 'Puddle', 'Group', 'Team', 'Den', 'Fort', 'Thought', 'Journey' ];

// StrangeMountainStampede
  // console.log('ll',first.length,second.length,third.length);
  r1 = Math.floor(Math.random()*first.length)
  r2 = Math.floor(Math.random()*second.length)
  r3 = Math.floor(Math.random()*third.length)

  if(Math.random() < 0.6){
    if(first[r1].length +second[r2].length +third[r3].length >= 20){
      return first[r1]+third[r3];
    } else {
      return first[r1]+second[r2]+third[r3];
    }

  }else{
    return first[r1]+second[r2];
  }

}


setTimeout(function(){
//////////////////////////scoreboard, integrate later!
$.post("/getTeamScores",{}, function(results){

  results.sort(function(a, b) {
      return b.score - a.score
  })
  var appendData = ''
  results.forEach(function(result){
    var teamString =''
    if(result.team == 1){
     teamString = '<div style="color:#97c355;"><p class="align-left" ><img style="height:50px;margin-top:-8px;" src="assets/images/teamicons/3.png"> Earth</p> '
    }else if(result.team == 2){
      teamString = '<div style="color:#4baaf8"><p class="align-left" ><img style="height:50px;margin-top:-8px;" src="assets/images/teamicons/1.png"> Water</p> '
    }else if(result.team == 3){
      teamString = '<div style="color:#e88f3d"><p class="align-left" ><img style="height:50px;margin-top:-8px;" src="assets/images/teamicons/4.png"> Fire</p> '
    }else if(result.team == 4){
      teamString = '<div style="color:#8e98f8"><p class="align-left" ><img style="height:50px;margin-top:-8px;" src="assets/images/teamicons/2.png"> Air</p> '
    }

    appendData += teamString+'<p class="align-right">' + result.score + '</p><div style="clear:both"></div></div>'
  })

  $('.teamScores').html(appendData)

});

$.post("/getHighScores",{},function(results){
    // console.log('highScores',results);
    var appendData = ''
    results.forEach(function(result){
      appendData += '<div><div style="float:left;width:50px;height:50px;background-image:url(assets/images/avatars/'+ result.avatar +');background-repeat:no-repeat;background-position:center center;background-size:contain;" ></div><p class="align-left" >' + result.userName + '</p><p class="align-right">' + result.score + '</p><div style="clear:both"></div></div>';
    })
    // console.log(appendData);
    $('.scoreBoard').html(appendData)
})



},1000)








