// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let g_globalAngle = 0;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
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

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function renderAllShapes() {

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //drawTriangle3D( [-1,0,0, -0.5,-1,0, 0,0,0]);

  var body = new Cube();
  body.color = [1.0, 1.0, 1.0, 1.0];
  body.matrix.translate(0.15, -0.75, -0.1);
  body.matrix.scale(-0.6, 0.9, 0.5);
  body.render();

  var outerBody = new Cube();
  outerBody.color = [0, 0, 0, 1.0];
  outerBody.matrix.translate(-0.6, -0.85, 0);
  outerBody.matrix.scale(0.9, 1.1, 0.7);
  outerBody.render();

  var head = new Cube();
  head.color = [1.0, 1.0, 1.0, 1.0];
  head.matrix.translate(0.13, 0.25, 0.05);
  head.matrix.scale(-0.55, 0.4, 0.5);
  head.render();

  var outerHead = new Cube();
  outerHead.color = [0.0, 0.0, 0.0, 1.0];
  outerHead.matrix.translate(-0.52, 0.25, 0.06);
  outerHead.matrix.scale(0.75, 0.45, 0.55);
  outerHead.render();

  var leftEye = new Cube();
  leftEye.color = [0.0, 0.0, 0.0, 1.0];
  leftEye.matrix.translate(-0.2, 0.5, 0.049);
  leftEye.matrix.scale(-0.05, -0.05, 0.5);
  leftEye.render();

  var rightEye = new Cube();
  rightEye.color = [0.0, 0.0, 0.0, 1.0];
  rightEye.matrix.translate(-0.05, 0.5, 0.049);
  rightEye.matrix.scale(-0.05, -0.05, 0.5);
  rightEye.render();

  var beak = new Cube();
  beak.color = [1.0, 0.7, 0.2, 1.0];
  beak.matrix.translate(-0.3, 0.43, -0.1);
  beak.matrix.scale(0.3, -0.085, 0.4);
  beak.render();

  var feet = new Cube();
  feet.color = [1, 1, 0, 1.0];
  feet.matrix.translate(-0.6, -0.85, -0.15);
  feet.matrix.scale(0.9, -0.1, 0.85);
  feet.render();

  var leftWing = new Cube();
  leftWing.color = [0,0,0,1];
  leftWing.wing = 'left';
  leftWing.matrix.rotate(8, 0,0,1);
  leftWing.matrix.translate(0.4, -0.75, 0.1);
  leftWing.matrix.scale(-0.1, 0.9, 0.5);
  leftWing.render();

  var rightWing = new Cube();
  rightWing.color = [0,0,0,1];
  rightWing.wing = 'right';
  rightWing.matrix.rotate(-8, 0,0,1);
  rightWing.matrix.translate(-0.6, -0.75, 0.1);
  rightWing.matrix.scale(-0.1, 0.9, 0.5);
  rightWing.render();

  // TODO
  // - add tail or scarf
  // - make wings 3-piece each
  // - make slider to control each wing
  // - animate wings
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

function click(ev) {
  // mouse is down
}

function updateAngle() {
  var angle = document.getElementById("cam_angle").value;
  g_globalAngle = angle;
  renderAllShapes();
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = click;

  // Specify the color for clearing <canvas>
  gl.clearColor(0.4, 0.0, 0.0, 1.0);
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  updateAngle();
}
