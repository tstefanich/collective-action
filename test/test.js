$(function(){

  //index.js line 371

  for (var i = 0; i < 10; i++) {
    openInNewTab('http://localhost:8080')
  }


})



  function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
  }
