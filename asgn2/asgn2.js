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

// from Lab 2
var stats = new Stats();
stats.dom.style.left = "auto";
stats.dom.style.right = "0";
stats.showPanel(0);
document.body.appendChild(stats.dom);

let canvas;
let picker;
let gl;
let a_Position;
let u_fragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let g_globalXAngle = 0;
let g_globalYAngle = 0;

let g_leftWing1Angle = 0;
let g_leftWing2Angle = 0;
let g_leftWing3Angle = 0;

let g_headAngle = 0;
let g_liftPos = 2;

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
var animating = false;
var headAnimating = false;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);

  canvas.addEventListener("mousemove", (event) => {
    if (event.buttons != 1) {
      return;
    }

    bbox = canvas.getBoundingClientRect()

    const x = (event.clientX - bbox.left) - 200;
    const y = (event.clientY - bbox.top) - 200;

    console.log(`x: ${x}, y: ${y}`);
    g_globalXAngle = -x % 365;
    g_globalYAngle = y % 365;
    renderAllShapes();
  })

  canvas.addEventListener("click", (event) => {
    if (event.shiftKey) {
      console.log("shiftclicked");
      headAnimating = !headAnimating;
    }
  })
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

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  stats.begin();
  updateAnimationAngles();
  updateHeadAnimationAngles();
  renderAllShapes();
  stats.end();
  requestAnimationFrame(tick);
}

function renderAllShapes() {

  var globalRotMat = new Matrix4().rotate(g_globalXAngle, 0, 1, 0);
  globalRotMat.rotate(g_globalYAngle, 1,0,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

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
  head.matrix.setTranslate(0,0,0);
  
  head.matrix.translate(0.125, 0.25 * g_liftPos, 0.05);
  head.matrix.scale(-0.55, 0.4, 0.5);

  head.matrix.translate(0.5, 0.5, 0.5);
  head.matrix.rotate(g_headAngle, 0,1,0);
  head.matrix.translate(-0.5, -0.5, -0.5);

  var innerHeadMat = new Matrix4(head.matrix);
  head.render();
  
  var outerHead = new Cube();
  outerHead.color = [0.0, 0.0, 0.0, 1.0];
  outerHead.matrix = innerHeadMat;
  outerHead.matrix.translate(-0.125, 0, 0.06);
  outerHead.matrix.scale(1.25, 1.1, 1);
  outerHead.render();

  var leftEye = new Cube();
  leftEye.color = [0.0, 0.0, 0.0, 1.0];
  leftEye.matrix = innerHeadMat;
  leftEye.matrix.translate(0.6, 0.45, -0.11);
  var leftEyeMat = new Matrix4(leftEye.matrix);

  leftEye.matrix.scale(0.07, 0.11, 0.5);
  leftEye.render();

  var rightEye = new Cube();
  rightEye.color = [0.0, 0.0, 0.0, 1.0];
  rightEye.matrix = leftEyeMat;
  var rightEyeMat = new Matrix4(rightEye.matrix);

  rightEye.matrix.translate(-0.25, 0, 0);
  rightEye.matrix.scale(0.07, 0.11, 0.5);
  rightEye.render();

  var beak = new Cube();
  beak.color = [1.0, 0.7, 0.2, 1.0];
  beak.matrix = rightEyeMat;
  beak.matrix.translate(-0.3, -0.2, -0.1);
  beak.matrix.scale(0.4, 0.15, 0.4);
  beak.render();

  var feet = new Cube();
  feet.color = [1, 1, 0, 1.0];
  feet.matrix.translate(-0.6, -0.85, -0.15);
  feet.matrix.scale(0.9, -0.1, 0.85);
  feet.render();

  var leftWing1 = new Cube();
  leftWing1.color = [0.05, 0.05, 0.05, 1];
  leftWing1.wing = 'right';

  leftWing1.matrix.setTranslate(0, 0, 0);
  leftWing1.matrix.translate(0.23, 0.17, 0.1);

  leftWing1.matrix.rotate(-140, 0, 0, 1);
  leftWing1.matrix.rotate(g_leftWing1Angle, 0, 0, 1);
  var leftWing1Mat = new Matrix4(leftWing1.matrix);

  leftWing1.matrix.scale(-0.11, 0.2, 0.5);
  leftWing1.render();


  var leftWing2 = new Cube();
  leftWing2.matrix = leftWing1Mat;
  leftWing2.color = [0.05, 0.05, 0.05, 1];
  leftWing2.wing = 'right';

  leftWing2.matrix.translate(-0.03, 0.15, 0);
  leftWing2.matrix.rotate(g_leftWing2Angle, 0, 0, 1);
  var leftWing2Mat = new Matrix4(leftWing2.matrix);

  leftWing2.matrix.rotate(-40, 0, 0, 1);
  leftWing2.matrix.scale(-0.1, 0.5, 0.5);
  leftWing2.render();


  var leftWing3 = new Cube();
  leftWing3.matrix = leftWing2Mat;
  leftWing3.color = [0.05, 0.05, 0.05, 1];
  leftWing3.wing = 'right';

  leftWing3.matrix.translate(0.24, 0.28, 0.1);
  leftWing3.matrix.rotate(g_leftWing3Angle, 0, 0, 1);

  leftWing3.matrix.rotate(-40, 0, 0, 1);
  leftWing3.matrix.scale(-0.1, 0.2, 0.35);
  leftWing3.render();

  var rightWing1 = new Cube();
  rightWing1.color = [0.05, 0.05, 0.05, 1];
  rightWing1.wing = 'right';
  rightWing1.matrix.setTranslate(0, 0, 0);
  rightWing1.matrix.translate(-0.65, 0.03, 0.1);
  rightWing1.matrix.rotate(-35, 0, 0, 1);
  rightWing1.matrix.scale(-0.1, 0.2, 0.5);
  rightWing1.render();

  var rightWing2 = new Cube();
  rightWing2.color = [0.05, 0.05, 0.05, 1];
  rightWing2.wing = 'left';
  rightWing2.matrix.translate(-0.73, -0.4, 0.1);
  rightWing2.matrix.rotate(0, 0, 0, 1);
  rightWing2.matrix.scale(0.1, 0.5, 0.5);
  rightWing2.render();

  var rightWing3 = new Cube();
  rightWing3.color = [0.05, 0.05, 0.05, 1];
  rightWing3.wing = 'left';
  rightWing3.matrix.translate(-0.72, -0.55, 0.1);
  rightWing3.matrix.rotate(5, 0, 0, 1);
  rightWing3.matrix.scale(0.1, 0.15, 0.5);
  rightWing3.render();
}

function convertCoordinateEventsToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return ([x, y]);
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
  g_globalXAngle = angle;
  renderAllShapes();
}

function updateWingJointAngle(id) {
  var angle = 0;
  switch (id) {
    case 1:
      angle = document.getElementById("wing_joint_slider").value;
      g_leftWing1Angle = angle;
      break;
    case 2:
      angle = document.getElementById("wing_joint_2_slider").value;
      g_leftWing2Angle = angle;
      break;
    case 3:
      angle = document.getElementById("wing_joint_3_slider").value;
      g_leftWing3Angle = angle;
      break;
    default:
      angle = document.getElementById("wing_joint_slider").value;
      g_leftWing1Angle = angle;
      angle = document.getElementById("wing_joint_2_slider").value;
      g_leftWing2Angle = angle;
      angle = document.getElementById("wing_joint_3_slider").value;
      g_leftWing3Angle = angle;
      break;
  }
  renderAllShapes();
}

function toggleAnimation() {
  animating = !animating;
}

function resetAngleSliders() {
  document.getElementById("wing_joint_slider").value = 0;
  document.getElementById("wing_joint_2_slider").value = 0;
  document.getElementById("wing_joint_3_slider").value = 0;

  g_globalXAngle = 5;
  g_globalYAngle = 0;
  renderAllShapes();
}

function updateAnimationAngles() {
  if (animating) {
    g_leftWing1Angle = 45 + (45 * Math.sin(1 * g_seconds));
    g_leftWing2Angle = 45 + (25 * Math.sin(1 * g_seconds));
    g_leftWing3Angle = (25 * Math.sin(1 * g_seconds));
  } else {
    updateWingJointAngle();
  }
}

function updateHeadAnimationAngles() {
  if (headAnimating) {
    g_headAngle = g_seconds * 100 % 365;
    g_liftPos = 1 + (Math.abs(Math.sin(0.5 * g_seconds)))
    console.log(g_headAngle);
  } else {
    g_headAngle = 0;
    g_liftPos = 1;
  }
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
  tick();
}
