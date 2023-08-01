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

function enableDarkMode() {
  const style = document.createElement('style');
  style.innerHTML = `
    body {
      background-color: #121212;
    }
    #name {
      color: #D7B7FD;
    }
    .alohomora {
      color: #eaeaea;
    }
    .header1 {
      color: #FFFFFF;
    }
    .header2 {
      color: #BB86FC;
    }
    #wormhead {
      color: #D7B7FD;
    }
    #wormbody1 {
      color: #3700B3;
    }
    #wormbody2 {
      color: #BB86FC;
    }
    #wormbody3 {
      color: #6200EE;
    }
    #wormtail {
      color: #D7B7FD;
    }
    #img_gatech {
      content:url("./img/georgiatech_dark.png");
    }
    #img_intel {
      content:url("./img/intel_dark.png");
    }
    #img_google {
      content:url("./img/google_dark.png");
    }
    #img_usaid {
      content:url("./img/usaid_dark.png");
    }
    #img_regeneron {
      content:url("./img/regeneron_dark.png");
    }
    #img_nasa {
      content:url("./img/nasa_dark.png");
    }
    #img_nmsc {
      content:url("./img/nmsc_dark.png");
    }
    a {
      color: white;
    }
    b {
      color: white;
    }
    div[name=content] {
      background-color: #1E1E1E;
      color: #bdbdbd;
    }
  `;
  document.head.appendChild(style);
  document.getElementById('toggleTheme').innerHTML = 'Light Theme';
}

function toggleMode() {
  const darkModeStyle = document.querySelector('style');
  if (darkModeStyle) {
    darkModeStyle.remove();
    document.getElementById('toggleTheme').innerHTML = 'Dark Theme';
  } else {
    enableDarkMode();
  }
}

function checkSystemDarkMode() {
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDarkMode) {
    enableDarkMode();
  }
}

checkSystemDarkMode();