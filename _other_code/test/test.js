$(function(){

  //index.js line 371

  for (var i = 0; i < 70; i++) {
    openInNewTab('https://joincollectiveaction.com/game-client?location=littleafrica')
  }


})



  function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
  }
