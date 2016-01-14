// Create the canvas
var canvas = window.document.getElementById("canvas");
var context = canvas.getContext("2d");

// Define the width and height attributes
canvas.width;
canvas.height;

// Text styling
//context.font = "10vw lato-heavy";
//context.textAlign = "center";
//context.textBaseline ="middle";

/* class Point
 *   Parameters:
 *     int x - x coordinate
 *     int y - y coordinate
 */
function Point(x, y) {
  this.x = x;
  this.y = y;
};

/* class Polygon
 *   Parameters:
 *     string name - name of this polygon
 *     Point centerPoint - center point of this polygon
 *     int radius - distance from the center point to any vertex
 *     int numVertices (>2) - number of sides/vertices
 *     float speed - radians per second of rotation
 *     bool clockwise - clockwise or counterclockwise rotation
 */
function Polygon(name, centerPoint, radius, theta, numVertices, speed, clockwise) {
  this.name = name;
  this.center = centerPoint;
  this.radius = radius;
  this.theta = theta;
  this.speed = speed;
  this.clockwise = clockwise;
  this.vertices = [];
  var i, dtheta = 2 * Math.PI / numVertices;
  if(numVertices < 3) numVertices = 3;
  for(i = 0; i < numVertices; i++) {
    this.vertices[i] = new Point(this.radius * Math.cos(this.theta + i * dtheta) + this.center.x, this.radius * Math.sin(this.theta + i * dtheta) + this.center.y);
  }
  this.red = Math.round(Math.random() * 255);
  this.green = Math.round(Math.random() * 255);
  this.blue = Math.round(Math.random() * 255);
  while(this.red + this.green + this.blue > 400) {
    this.red = Math.round(Math.random() * 255);
    this.green = Math.round(Math.random() * 255);
    this.blue = Math.round(Math.random() * 255);
  }
  this.render = function() {
    context.save();
    var color = "rgb(" + polygon.red + ", " + polygon.green + ", " + polygon.blue + ")";
    context.beginPath();
    context.moveTo(this.vertices[0].x, this.vertices[0].y);
    var i;
    for(i = 1; i < this.vertices.length; i++) {
      context.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    context.closePath();
    context.lineWidth = 5;
    context.strokeStyle = color;
    context.stroke();
    context.fillStyle = color;
    context.fill();
    context.restore();
  };
  this.rotate = function(radians) {
    if(this.clockwise) radians *= -1;
    this.theta += radians;
    var i, dtheta = 2 * Math.PI / this.vertices.length;
    for(i = 0; i < this.vertices.length; i++) {
      this.vertices[i] = new Point(this.radius * Math.cos(this.theta + i * dtheta) + this.center.x, this.radius * Math.sin(this.theta + i * dtheta) + this.center.y);
    }
  };
  window.console.log("Polygon instantiated");
}

// The one and only Polygon
var polygon = new Polygon("William", new Point(canvas.width / 2, canvas.height / 2), Math.min(canvas.width, canvas.height) * 3 / 4, Math.random() * 2 * Math.PI, Math.round(Math.random() * 3 + 3), Math.PI / 4, Math.random() >= 0.5 ? true : false);

// Size it correctly
var resize_shape = function() {
  if(canvas.width != canvas.parentElement.clientWidth) {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    var red = polygon.red, green = polygon.green, blue = polygon.blue;
    polygon = new Polygon(polygon.name, new Point(canvas.width / 2, canvas.height / 2), Math.min(canvas.width, canvas.height) * 12 / 25, polygon.theta, polygon.vertices.length, polygon.speed, polygon.clockwise);
    polygon.red = red;
    polygon.green = green;
    polygon.blue = blue;
  }
  window.console.log("(" + canvas.width + ", " + canvas.height + ")");
};
resize_shape();

// Update Polygon
//   modifier - seconds since last update
var update = function(modifier) {
  polygon.rotate(modifier * polygon.speed);
  if(Math.random() * 3 < 1) polygon.red == 0 ? polygon.red = 255 : polygon.red - modifier * 25;
  else if(Math.random() * 3 < 2) polygon.green == 0 ? polygon.green = 255 : polygon.green - modifier * 25;
  else polygon.blue == 0 ? polygon.blue = 255 : polygon.blue - modifier * 25;
};

var drawText = function () {
  context.save();
  context.font = "10vw lato-heavy";
  context.textAlign = "center";
  context.textBaseline ="middle";
  context.fillStyle = "#CC9";
  context.fillText("Sean", canvas.width / 4, canvas.height / 2);
  context.fillText("Krail", canvas.width * 3 / 4, canvas.height / 2);
  context.strokeStyle = "#CC9";
  context.strokeText("Sean", canvas.width / 4, canvas.height / 2);
  context.strokeText("Krail", canvas.width * 3 / 4, canvas.height / 2);
  context.stroke();
  context.fill();
  context.restore();
};

// Render Polygon
var render = function () {
  context.clearRect(0, 0, canvas.width, canvas.height);
  polygon.render();
  drawText();
};

// The main loop
var then = Date.now();
var main = function () {
  var now = Date.now();
  var delta = now - then;
  update(delta / 1000);
  render();
  then = now;
  window.requestAnimationFrame(main);
};

// Start the main loop
//   call in body's onload method
var start = function() {
  // Create the canvas
  canvas = window.document.getElementById("canvas");
  context = canvas.getContext("2d");
  // Define the width and height attributes
  canvas.width;
  canvas.height;
  context.fillStyle = "#FFF";
  main();
};

main();
