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
    url:"location-1",
    name: "Ben's House",
    lat: 44.957124,
    lon: -93.283987,
    radius: .16,
    timer:Date.now() - (totalTime * .95), // This is here to that if you open the app inside a location you don't need to wait 5 minutes for the popup to happen.
    googleMapsLink: "https://www.google.com/maps/place/2438+Grand+Ave+S,+Minneapolis,+MN+55405/",
    description: "Ben Moren is a Minneapolis based media artist working at the intersection of filmmaking, performance, and creative coding. His projects investigate the disappearing separation between the digital and natural worlds. He has created site specific and mixed reality projects for the Northern Spark Festival in Minneapolis, Kultur Park in Berlin, and the Weisman Art Museum. He has exhibited at the Soap Factory, the Minneapolis Institute of Arts, the Chicago Artists Coalition, and the Beijing Film Academy. He co-founded and facilitates the WZFR, an experimental rural filmmaking residency in western Wisconsin. He is an Assistant Professor at the Minneapolis College of Art and Design teaching in the Media Arts department and the Web+Multimedia Environments major.",
    image:'bens-house.jpg'

  },
  {
    url:"location-2",
    name: "Tyler's House",
    lat: 34.045206,
    lon: -118.334594,
    radius: .16,
    timer:Date.now() - (totalTime * .95), // This is here to that if you open the app inside a location you don't need to wait 5 minutes for the popup to happen.
    googleMapsLink:"https://www.google.com/maps/place/1641+La+Fayette+Rd,+Los+Angeles,+CA+90019/",
    description: "Tyler Stefanich (b.1985) is an artist and designer. His work, through installations and performances, uses software-based systems to explore issues related to history, memory and identity. Stefanich received a BFA in Interactive Media from the Minneapolis College of Art and Design, and earned an MFA from UCLA in Media Art. Currently he lives and works in Los Angeles, California, as manager of the UCLA Game Lab, a creative research center that combines art and technology as well as Web Director at Northern Lights.mn, a media arts organization based in Minnesota.",
    image:'tylers-house.jpg'
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
    image:'mcad.jpg'
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
    image:'ucla.jpg'
  }
]

function showArtworkClose(){
   var closeButton = $('.close.artwork');
   closeButton.css('display','block');
   closeButton.velocity({opacity: 1}, 500);
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
  for (var i = allMarkers.length - 1; i >= 0; i--) {
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

      if (passedTime > totalTime) {
            console.log($('#'+allMarkers[i].slug+'-modal'));
            //alert( "reset menu" );

            //alert('You are at' + allMarkers[i].slug)
            $('#'+allMarkers[i].slug+'-modal').modal();
            allMarkers[i].timer = Date.now(); // Save the current time to restart the timer!
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
        updateMarkerDistances(currentPosition);

        // Sets custom Marker for your location
        displayLocation(currentPosition);

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
      var newHeight = $(window).height();
      newHeight = newHeight - ($('.intro-footer').outerHeight() * 1.6) ;
      $('.page.intro .carousel-inner').css('margin-top', $('.intro-footer').outerHeight()+'px' );
      $('.page.intro .carousel-inner .item img').css('height', newHeight+'px')
      //setTimeout(function(){
      //  $('#playGame').click() //for testing
      //},5000)

      //Parse Locations
      parseLocations(allLocations)

      // Initialize Google Maps
      initMap();

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
          } else {

          }
     },
     checkIfFieldsAreFilled(){
          $('.form-control.email-address.login').on('keyup blur', function(event) {
               if($.trim($(this).val()) != ''){
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
          $('.more-details.logout').on('click tap', function(event) {
               login.logout();
          });
     },
     eventListeners:function(){
          $('body').on('click tap', '.login-continue-btn', function(e){
               switch(true){
                    case $('#carousel-sign-up .item.email-sign-up').hasClass('active'):
                         // Break
                         login.retrieveFromDatabase();
                         break;
               }
          });
     },
     retrieveFromDatabase:function(button){
          store.set('user',
               {
                    userName:'Marcus',
                    email: 'email',
                    avatar: 'Array', // This could be an object... with key values that are descriptive.. head, body ect... might be overkill
                    team: 'Number',
                    tasksPlayed: 'Array',

                    // PING
                    loggedIn: 'Boolean',
                    currentLocation: 'String',

                    // METRICS
                    score: 'Number',
                    locationsVisited: 'Array', // location + timespent
                    totalTasks: 'Number', // this may not be needed scores = totalPlays
                    totalTaskTime: 'Number',
                    totalWaitTime: 'Number',
                    priority: 1, // 1-5, lower is lower
               }
          );
          setTimeout(function(){
               slideDownPanel($('.page.login .close'));
               slideDownPanel($('.page.intro .close'));
          },500);

     },
     logout:function(){
          store.clearAll();
          location.reload();
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
          signUp.eventListeners();
          signUp.checkIfFieldsAreFilled();
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
     validateEmail(mail)
     {
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
       {
         return (true)
       }
         //alert("You have entered an invalid email address!")
         return (false)
     },
     checkIfFieldsAreFilled(){
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
          $.post("http://localhost:8080/check-email",{email: email_address.toLowerCase()}, function(data){
               if(data == true){ // Email is in the database already
                    $('#carousel-sign-up .item.email-sign-up').addClass('show-error');
               } else if(data == false){
                    signUp.goToNextSlide();
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
          $.post("http://localhost:8080/check-user",{userName: user_name}, function(data){
               console.log(data);
               if(data === 'blank'){ // Email is in the database already
                    //$('#carousel-sign-up .item.username-sign-up').addClass('show-error-profane');
               } else if(data === 'profane'){ // Email is in the database already
                    $('#carousel-sign-up .item.username-sign-up').addClass('show-error-profane');
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
          // Slide up Main menu / Home
          moreDetails(button);
          //Slide Down Signup page
          setTimeout(function(){
               slideDownPanel($('.page.sign-up .close'));
               slideDownPanel($('.page.intro .close'));
          },500);
     },
     eventListeners:function(){
          $('body').on('click tap', '.sign-up-continue-btn', function(e){
               switch(true){
                    case $('#carousel-sign-up .item.email-sign-up').hasClass('active'):
                         signUp.databaseHasEmail();
                         if(!signUp.usernameTextFieldIsFilled){
                              signUp.disableContinueButton();
                         }
                         break;
                    case $('#carousel-sign-up .item.username-sign-up').hasClass('active'):
                         //put your cases here
                         signUp.databaseHasUser();
                         break;
                    case $('#carousel-sign-up .item.avatar-sign-up').hasClass('active'):
                         //put your cases here
                         signUp.goToNextSlide();
                         signUp.styleButtonToSave();
                         break;
                    case $('#carousel-sign-up .item.confirmation-sign-up').hasClass('active'):
                         //put your cases here
                         signUp.saveToDatabase($(this));
                         break;
               }
          });

          $('body').on('click tap', '.sign-up-back-btn', function (e) {
            // do something…
            switch(true){
                 case $('#carousel-sign-up .item.email-sign-up').hasClass('active'):
                      slideDownPanel($('.page.sign-up .close'));
                      break;
                 case $('#carousel-sign-up .item.username-sign-up').hasClass('active'):
                      //put your cases here
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

$(document).ready(function(){

     //Fix height problem with intro
     $('#carousel-example-generic').height($(document).height()-$('.page.intro .intro-footer').height());

     //Fix height problem with sign-up
     $('#carousel-sign-up .carousel-inner .item').height($(document).height());

     // Regenerate Avatar Button
     $('body').on('click tap', '.regenerate-avatar-btn', function(e){
       var totalNumberOfAvatars =  75;
       var r = Math.round(Math.random()*totalNumberOfAvatars)
       $('.regenerate-avatar-image').attr('src', 'assets/images/avatars/'+ r +'.svg')
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

            }, 750);



          });


        } else {
     if($this.parent('.nav').parent('.page').hasClass('sign-up')){
          $('#carousel-sign-up').carousel(0);
     }
     $this.parent('.nav').parent('.page').removeClass('slideUp');
     setTimeout(function(){
       $this.parent('.nav').parent('.page').css('display','none');
     }, 750);

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
      allCircles[i].setOptions({fillOpacity:1, strokeOpacity:1});
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
        backgroundColor: 'rgb(0,0,0)',
        borderRadius: 4,
        maxWidth: 183,
        minWidth: 183,
        //arrowSize: 10,
        borderWidth: 2,
        borderColor: '#ffffff',
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
            locationImage: '<div class="info-window-image" style="background-image:url(./assets/images/locations/' + allProjects[i].locationImage + ');background-position:no-repeat;background-size:cover;background-position:center;"></div>',
            locationName: allProjects[i].locationName,
            //content: data.name,
            icon: {
                url: './assets/images/maps/white-pin.png', // url
                scaledSize: new google.maps.Size(50, 50), // scaled size
                origin: new google.maps.Point(0,0), // origin
                anchor: new google.maps.Point(25,50) // anchor
               },
            //zone:data.zone,
            zIndex: 9,
            //type:data.type
        });


        allCircles[i] = new google.maps.Circle({
            strokeColor: '#000',
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
        title.innerHTML = '' + marker.locationImage + '<strong>' + marker.locationName + '</strong><br><div class="more-details-container" ><a class="btn btn-default more-details" id="'+marker.slug+'-more-details-maps" href="#'+marker.slug+'" onclick="moreDetails(this);">More Details</a></div>';
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

   // then create the new marker
   myMarker = new google.maps.Marker({
      //flat: true,
      map: googleMap,
      title: 'I might be here',
      position: myLatLng,
      zIndex:9999,
      icon: {
         url: '/assets/images/avatars/avatar_68.png',
        //size: new google.maps.Point( 16, 16 ),
              scaledSize: new google.maps.Size(17, 17), // scaled size
              origin: null, // origin
              //anchor: new google.maps.Point(25,50) // anchor
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
