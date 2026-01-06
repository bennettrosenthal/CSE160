// DrawTriangle.js (c) 2012 matsuda
var canvas = document.getElementById('example');  
// Get the rendering context for 2DCG
var ctx = canvas.getContext('2d');

function main() {  
  // Retrieve <canvas> element
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Draw a blue rectangle
  ctx.lineWidth = 1;

  var vec = new Vector3([2.25, 2.25, 0]);
  drawVector(vec, "red");
}

function drawVector(v, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(200, 200);

  var x_coord = v.elements[0];
  var y_coord = v.elements[1];

  x_coord = 200 + (x_coord * 20);
  y_coord = 200 - (y_coord * 20);

  ctx.lineTo(x_coord, y_coord);
  ctx.closePath();
  ctx.stroke();
}

function angleBetween(v1, v2) {
  var dp = Vector3.dot(v1, v2);
  var mag_p = v1.magnitude() * v2.magnitude();
  var rad = Math.acos((dp / mag_p));
  return (rad * 180) / Math.PI;
}

function areaTriangle(v1, v2) {
  var cross = Vector3.cross(v1, v2);
  return (cross.magnitude()) / 2;
}

function handleDrawEvent() {
  ctx.clearRect(0,0,400,400);
  
  var v1_x = document.getElementById("v1_x").value;
  var v1_y = document.getElementById("v1_y").value;
  var v2_x = document.getElementById("v2_x").value;
  var v2_y = document.getElementById("v2_y").value;

  var vec1;
  var vec2;

  vec1 = new Vector3([v1_x, v1_y, 0]);
  drawVector(vec1, "red");

  vec2 = new Vector3([v2_x, v2_y, 0]);
  drawVector(vec2, "blue");
}

function handleDrawOperationEvent() {
  ctx.clearRect(0,0,400,400);
  
  var v1_x = document.getElementById("v1_x").value;
  var v1_y = document.getElementById("v1_y").value;
  var v2_x = document.getElementById("v2_x").value;
  var v2_y = document.getElementById("v2_y").value;

  var vec1;
  var vec2;

  if (Number.isFinite(+v1_x) && Number.isFinite(+v1_y)) {
    vec1 = new Vector3([v1_x, v1_y, 0]);
    drawVector(vec1, "red");
  }

  if (Number.isFinite(+v2_x) && Number.isFinite(+v2_y)) {
    vec2 = new Vector3([v2_x, v2_y, 0]);
    drawVector(vec2, "blue");
  }

  var op = document.getElementById("operations_select").value;
  var scalar = document.getElementById("scalar_box").value;

  switch(op) {
    case "add":
      drawVector(vec1.add(vec2), "green");
      break;
    case "sub":
      drawVector(vec1.sub(vec2), "green");
      break;
    case "mul":
      drawVector(vec1.mul(scalar), "green");
      drawVector(vec2.mul(scalar), "green");
      break;
    case "div":
      drawVector(vec1.div(scalar), "green");
      drawVector(vec2.div(scalar), "green");
      break;
    case "mag":
      console.log("Magnitude v1: " + vec1.magnitude())
      console.log("Magnitude v2: " + vec2.magnitude())
      break;
    case "norm":
      drawVector(vec1.normalize(), "green");
      drawVector(vec2.normalize(), "green");
      break;
    case "angle":
      console.log("Angle between: " + angleBetween(vec1, vec2));
    case "area":
      console.log("Area of the triangle: " + areaTriangle(vec1, vec2));
    default:
  }
}

