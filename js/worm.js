/*
For OpenWorm connectome credits AND A DISCLAIMER, see connectome.js.
Javascript worm animation (originally a snake animation) created by Diana (@dmabelbeck) on CodePen.
Original Code: https://codepen.io/dmabelbeck/pen/GpGKEL
*/

var proximity = false;
var tfood = Math.random() * 1.5;
var velocity = 3;
var theta = Math.PI * Math.random();
var velocityModerator = 0.01;
var angleModerator = 2;

function nextWormState() {

  console.log(theta);

  // Simple simulation routine:

  if (proximity) {
    console.log("OBSTACLE (Nose Touch)");
    dendriteAccumulate("FLPR");
    dendriteAccumulate("FLPL");
    dendriteAccumulate("ASHL");
    dendriteAccumulate("ASHR");
    dendriteAccumulate("IL1VL");
    dendriteAccumulate("IL1VR");
    dendriteAccumulate("OLQDL");
    dendriteAccumulate("OLQDR");
    dendriteAccumulate("OLQVR");
    dendriteAccumulate("OLQVL");
    runconnectome();
    forward = accumleft + accumright;
    lateral = accumleft - accumright;
    theta += Math.atan(lateral/forward) * angleModerator;
    velocity = new_speed * velocityModerator;
  }

  else {

    if (tfood < 2) {
      console.log("SENSING FOOD");
      dendriteAccumulate("ADFL");
      dendriteAccumulate("ADFR");
      dendriteAccumulate("ASGR");
      dendriteAccumulate("ASGL");
      dendriteAccumulate("ASIL");
      dendriteAccumulate("ASIR");
      dendriteAccumulate("ASJR");
      dendriteAccumulate("ASJL");
      runconnectome();
      forward = accumleft + accumright;
      lateral = accumleft - accumright;
      theta += Math.atan(lateral/forward) * angleModerator;
      velocity = new_speed * velocityModerator;
    }
    tfood += Math.random() * 0.5;
    if (tfood > 3 + Math.random() * 17) {
      tfood = 0;
    }
  }

  // If the worm is lethargic, speed it up a little?
  if (velocity < 2) {
    velocity = 2;
  }

}

// Animation stuff:

var canvas, ctx;
var numberOfSegments = 20;
var segLength = 20;

var x = Array.apply(null, Array(numberOfSegments)).map(Number.prototype.valueOf, 0);
var y = Array.apply(null, Array(numberOfSegments)).map(Number.prototype.valueOf, 0);

var curXpos = 0;
var curYpos = 0;

var mousePos;

var forward = 0;
var lateral = 0;
var senseDistance = 100;

const resize = () => {
  canvas.width = window.innerWidth;
  canvas.height = document.documentElement.scrollHeight;
}

function init() {

  canvas = document.getElementById("wormCanvas");
  resize();
  curXpos = 0.7 * window.innerWidth;
  curYpos = 0.3 * window.innerHeight;
  window.addEventListener('resize', resize);
  ctx = canvas.getContext('2d');
  var wormStateInterval = window.setInterval(function(){ nextWormState() }, 500);
  var wormMoveInterval = window.setInterval(function(){ moveWorm() }, 10);

}

function moveWorm() {

  if (isNaN(theta)) {
    console.log('WASNAN!');
    theta = Math.PI * Math.random();
  }

  if (theta >= 2 * Math.PI) {
    theta -= 2 * Math.PI;
  }

  curXpos += Math.cos(theta) * velocity;
  curYpos += Math.sin(theta) * velocity;

  // Worm movement info, uncomment if you wanna see it:
  //console.log(velocity, Math.cos(theta) * velocity, Math.sin(theta) * velocity, theta)

  if (curXpos < senseDistance) {
    proximity = true;
    if (curXpos < 10) {
      curXpos = 10;
      theta += 0.8 * ((theta >= Math.PI) ? 1 : -1);
    }
    //nextWormState();
  }
  else if (curYpos < senseDistance) {
    proximity = true;
    if (curYpos < 10) {
      curYpos = 10;
      theta += 0.8 * ((theta >= Math.PI/2) ? 1 : -1);
    }
    //nextWormState();
  }
  else if (curXpos > window.innerWidth - senseDistance) {
    proximity = true;
    if (curXpos > window.innerWidth - 10) {
      curXpos = window.innerWidth - 10;
      theta += 0.8 * ((theta >= 0) ? 1 : -1);
    }
    //nextWormState();
  }
  else if (curYpos > document.documentElement.scrollHeight - senseDistance) {
    proximity = true;
    if (curYpos > window.innerHeight - 10) {
      curYpos = window.innerHeight - 10;
      theta += 0.8 * ((theta >= 3*Math.PI/2) ? 1 : -1);
    }
    //nextWormState();
  }
  else {
    proximity = false;
  }

  requestAnimationFrame(animate);

}

function animate() {

  var bodyElement = document.getElementsByTagName("body")[0];
  var color = window.getComputedStyle(bodyElement).backgroundColor;

  console.log(color);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawSnake(curXpos, curYpos);

}

function drawSnake(posX, posY) {

      drawHead(posX-5, posY-5);
      dragSegment(0, posX-5, posY-5);
      for(var i=x.length-2; i >= 0; i--) {
         dragSegment(i+1, x[i], y[i]);
      }
      drawTail();

}

function drawHead(xin, yin) {

      dx = xin - x[0];
      dy = yin - y[0];

      ctx.save();
      ctx.translate(dx, dy);

      var headElement = document.getElementById('wormhead');
      var color = window.getComputedStyle(headElement).color;

      angle = Math.atan2(dy, dx);

      ctx.translate(curXpos - 5, curYpos - 5); // Move the canvas origin to the center of the rectangle
      ctx.rotate(angle); // Rotating the canvas by the specified angle
      
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.fillRect(-20, -10, 20, 20); // Centering the rectangle at (0, 0)
      ctx.arc(0, 0, 10, -Math.PI, Math.PI);      
      ctx.fill();

      // // Draw the two black eye dots (circles)
      // ctx.fillStyle = "black";
      // ctx.beginPath();
      // ctx.arc(-2, -3, 3, 0, 2 * Math.PI); // First eye dot
      // ctx.fill();
      // ctx.beginPath();
      // ctx.arc(-2, 3, 3, 0, 2 * Math.PI); // Second eye dot
      // ctx.fill();
      
      ctx.restore();

}

function drawTail() {

      dx = x[numberOfSegments-2] - x[numberOfSegments-1];
      dy = y[numberOfSegments-2] - y[numberOfSegments-1];

      angle = Math.atan2(dy, dx);

      ctx.save();
      ctx.translate(x[numberOfSegments-1], y[numberOfSegments-1]);
      ctx.rotate(angle - (2 * Math.PI / 180));
      ctx.translate(0, -10);

      var tailElement = document.getElementById('wormtail');
      var color = window.getComputedStyle(tailElement).color;

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.fillRect(-20, 0, 20, 20); // Centering the rectangle at (0, 0)
      ctx.arc(-20, 10, 10, Math.PI, -Math.PI);      
      ctx.fill();

      ctx.restore();

}

function dragSegment(i,  xin,  yin) {

   dx = xin - x[i];
   dy = yin - y[i];

   angle = Math.atan2(dy, dx);

   x[i] = xin - Math.cos(angle) * segLength;
   y[i] = yin - Math.sin(angle) * segLength;

  ctx.save();
  ctx.translate(x[i], y[i]);
  ctx.rotate(angle);
  
  var body1Element = document.getElementById('wormbody1');
  var color1 = window.getComputedStyle(body1Element).color;
  var body2Element = document.getElementById('wormbody2');
  var color2 = window.getComputedStyle(body2Element).color;
  var body3Element = document.getElementById('wormbody3');
  var color3 = window.getComputedStyle(body3Element).color;

  var segColor;

  if (i % 3 == 1)
    segColor = color1;
  else if (i % 3 == 2)
    segColor = color2;
  else
    segColor = color3;
  drawLine(0, 0, segLength, 0, segColor, 20);

  ctx.restore();

}

function drawLine(x1, y1, x2, y2, color, width) {

  ctx.save();

  ctx.strokeStyle = color;
  ctx.lineWidth = width;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.restore();

}
