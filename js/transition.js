/* Really just some functions to handle the show/hide functionality; kinda boring lol */

var divs = ["about", "edu", "research", "awards", "worm", "contact"];

function reveal(id) {

  for (var i=0; i<divs.length; i++) {
    if (divs[i] == id) {
      if (document.getElementById(id).className == "hidden") {
        document.getElementById(id).className = "hidden active";
      }
      else {
        document.getElementById(id).className = "hidden";
        canvas.height = window.innerHeight;
      }
    }
    else {
      document.getElementById(divs[i]).className = "hidden";
      canvas.height = window.innerHeight;
    }
  }

  setTimeout(function() { resize(); }, 500);

}
