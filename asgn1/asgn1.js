// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;  // uniform変数
  void main() {
    gl_FragColor = u_FragColor;  
  }`;

let canvas;
let picker;
let gl;
let a_Position;
let u_fragColor;
let u_Size;

var g_shapesList = [];
var current_shape = 0; // 0 = point, 1 = triangle, 2 = circle

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function updateColorPreview() {
  var r_val = (document.getElementById("r_slider").value - 1) * (2.5656 + 1);
  var g_val = (document.getElementById("g_slider").value - 1) * (2.5656 + 1);
  var b_val = (document.getElementById("b_slider").value - 1) * (2.5656 + 1);

  picker.fillStyle = `rgb(${r_val}, ${g_val}, ${b_val}, 255)`;
  picker.fillRect(0, 0, canvas.width, canvas.height);
}

function setupColorPreview() {
   // Retrieve <canvas> element
  pickerCanvas = document.getElementById('color_preview');

  // Get the rendering context for WebGL
  picker = pickerCanvas.getContext('2d');
  if (!picker) {
    console.log('Failed to get the rendering context for color preview');
    return;
  }
  updateColorPreview();
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for (var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}

function convertCoordinateEventsToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return([x, y]);
}

function clearCanvas() {
  gl.clearColor(0, 0, 0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  g_shapesList = []
  renderAllShapes();
}

function setBackground() {
  var r_val = document.getElementById("r_slider").value / 100;
  var g_val = document.getElementById("g_slider").value / 100;
  var b_val = document.getElementById("b_slider").value / 100;

  gl.clearColor(r_val, g_val, b_val, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function setShape(val) {
  current_shape = val;
}

function click(ev) {
  // mouse is down
  if (ev.buttons == 1) {
    var [x,y] = convertCoordinateEventsToGL(ev);

    // get RGB vals from sliders
    var r_val = document.getElementById("r_slider").value / 100;
    var g_val = document.getElementById("g_slider").value / 100;
    var b_val = document.getElementById("b_slider").value / 100;

    var size_val = document.getElementById("size_slider").value;

    var new_pt;
    if (current_shape == 1) {
      new_pt = new Triangle();
    } else if (current_shape == 2) {
      new_pt = new Circle();
      new_pt.segments = document.getElementById("segment_slider").value;
    } else {
      new_pt = new Point();
    }
    
    new_pt.coord = [x,y];
    new_pt.color = [r_val, g_val, b_val, "255"];
    new_pt.size = size_val;

    g_shapesList.push(new_pt);
    renderAllShapes();
  }
}

function drawPicture() {

  gl.clearColor(1, 0.588, 0.196, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Jack-o-lantern

  // eyes
  gl.uniform4f(u_FragColor, 0, 0, 0, 255);
  vert = [-0.2, 0, -0.5, 0, -0.5, 0.3];
  drawTriangle(vert);
  vert = [0.2, 0, 0.5, 0, 0.5, 0.3];
  drawTriangle(vert);

  // mouth outline
  vert = [-0.8, -0.4, -0.5, -0.4, -0.5, -0.7];
  drawTriangle(vert);
  vert = [0.8, -0.4, 0.5, -0.4, 0.5, -0.7];
  drawTriangle(vert);
  vert = [-0.5, -0.4, -0.5, -0.7, 0.5, -0.7];
  drawTriangle(vert);
  vert = [-0.5, -0.4, 0.5, -0.7, 0.5, -0.4];
  drawTriangle(vert);

  // upper teeth
  gl.uniform4f(u_FragColor, 1, 0.588, 0.196, 1.0);
  vert = [-0.6, -0.4, -0.4, -0.4, -0.5, -0.5];
  drawTriangle(vert);
  vert = [0.4, -0.4, 0.6, -0.4, 0.5, -0.5];
  drawTriangle(vert);

  // lower teeth
  vert = [-0.5, -0.7, -0.3, -0.7, -0.4, -0.6];
  drawTriangle(vert);
  vert = [0.3, -0.7, 0.5, -0.7, 0.4, -0.6];
  drawTriangle(vert);

  // eyebrows
  gl.uniform4f(u_FragColor, 0, 0, 0, 255);
  vert = [-0.4, 0.5, -0.5, 0.4, -0.6, 0.5];
  drawTriangle(vert);
  vert = [0.4, 0.5, 0.5, 0.4, 0.6, 0.5];
  drawTriangle(vert);

  // nose
  vert = [-0.1, -0.2, 0, -0.1, 0.1, -0.2];
  drawTriangle(vert);

  // colored eyeball
  gl.uniform4f(u_FragColor, 255, 0, 0, 255);
  vert = [-0.2, 0, -0.3, 0, -0.3, 0.1];
  drawTriangle(vert);
  vert = [0.2, 0, 0.3, 0, 0.3, 0.1];
  drawTriangle(vert);

  // initials - b
  gl.uniform4f(u_FragColor, 1, 0, 0, 1.0);
  vert = [-0.3, -0.4, 0, -0.4, -0.3, -0.55];
  drawTriangle(vert);
  vert = [-0.3, -0.7, 0, -0.7, -0.3, -0.55];
  drawTriangle(vert);

  // initials - r
  gl.uniform4f(u_FragColor, 1, 0, 0, 1.0);
  vert = [0.1, -0.4, 0.3, -0.4, 0.3, -0.5];
  drawTriangle(vert);
  vert = [0.1, -0.4, 0.1, -0.5, 0.3, -0.5];
  drawTriangle(vert);
  vert = [0.1, -0.5, 0.3, -0.7, 0.1, -0.7];
  drawTriangle(vert);
}

function main() {
  setupWebGL();
  setupColorPreview();
  connectVariablesToGLSL();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = click;

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}
