// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;  // uniform変数
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else {
      gl_FragColor = vec4(1,.2,.2,1);  
    }
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
let a_UV;
let u_fragColor;
let u_whichTexture;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;

let u_Sampler0;
let u_Sampler1;
let u_Sampler2;

let g_globalXAngle = 0;
let g_globalYAngle = 0;
let g_headAngle = 0;
let g_mouseX = 0;

var g_camera;
var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

var g_map = Array.from({ length: 32 }, (_, row) =>
  Array.from({ length: 32 }, (_, col) =>
    (row === 0 || row === 31 || col === 0 || col === 31) ? 1 : 0
  )
);

var g_mapCubes = [];

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

  g_camera = new Camera(canvas);

  canvas.addEventListener("mousemove", (event) => {
    if (event.buttons != 1) {
      g_mouseX = 0;
      return;
    }

    bbox = canvas.getBoundingClientRect();
    const x = (event.clientX - bbox.left);

    if (g_mouseX == 0) {
      g_mouseX = x;
      return;
    }

    const delta = x - g_mouseX;
    g_mouseX = x;

    const sens = 0.5;
    const alpha = delta * sens;

    g_camera.pan(alpha);

    renderAllShapes();
  })

  document.addEventListener("keydown", (ev) => {
    if (ev.key == "q") { // right arrow
      g_camera.pan(g_camera.alpha);
    } else if (ev.key == "e") { // left arrow
      g_camera.pan(-(g_camera.alpha));
    } else if (ev.key == "w") { // up arrow
      g_camera.forward();
    } else if (ev.key == "s") { // down arrow
      g_camera.back();
    } else if (ev.key == "a") { // up arrow
      g_camera.left();
    } else if (ev.key == "d") { // down arrow
      g_camera.right();
    }
    renderAllShapes();
  });
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

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
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

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function initTextures(gl, n) {
  var image1 = new Image();
  var image2 = new Image();
  var image3 = new Image();

  if (!image1) {
    console.log('Failed to create image obj');
    return false;
  }
  if (!image2) {
    console.log('Failed to create image obj');
    return false;
  }
  if (!image3) {
    console.log('Failed to create image obj');
    return false;
  }

  image1.onload = function () {
    loadTexture(image1, gl.TEXTURE0, u_Sampler0, 0);
  }
  image1.src = 'textures\\dirt.jpg';

  image2.onload = function () {
    loadTexture(image2, gl.TEXTURE1, u_Sampler1, 1);
  }
  image2.src = 'textures\\floor.jpg';

  image3.onload = function () {
    loadTexture(image3, gl.TEXTURE2, u_Sampler2, 2);
  }
  image3.src = 'textures\\sky.png';
  return true;
}

function loadTexture(image, textureArg, sampler, samplerNum) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log("Failed to create texture obj");
    return false;
  }
  gl.uniform1i(sampler, samplerNum);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // flip img y-axis
  gl.activeTexture(textureArg);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  //gl.clear(gl.COLOR_BUFFER_BIT);
  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  stats.begin();
  renderAllShapes();
  stats.end();
  requestAnimationFrame(tick);
}

function generateHill(map, centerX, centerY, radius) {
  const maxHeight = radius + 1;

  for (let x = centerX - radius; x <= centerX + radius; x++) {
    for (let y = centerY - radius; y <= centerY + radius; y++) {
      if (x < 0 || x >= map.length || y < 0 || y >= map[0].length) {
        continue;
      }

      if (x === 0 || x === map.length - 1 || y === 0 || y === map[0].length - 1) {
        continue;
      }

      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        const height = Math.max(1, Math.round(maxHeight - distance));
        map[x][y] += height;
      }
    }
  }
}

function randomizeHills(map, hills, height) {
  for (i = 0; i < hills; i++) {
    var x = Math.floor(Math.random() * 31);
    var y = Math.floor(Math.random() * 31);
    var r = Math.floor(Math.random() * height);
    generateHill(map, x, y, r);
  }
}

function createMap(map) {
  g_mapCubes = [];
  for (i = 0; i < map.length; i++) {
    for (j = 0; j < map[i].length; j++) {
      if (map[i][j] != 0) {
        for (k = 0; k < map[i][j]; k++) {
          var cube = new Cube();
          cube.color = [1.0, 1.0, 1.0, 1.0];
          cube.textureNum = 0;
          cube.matrix.translate(0, -0.75, 0);
          cube.matrix.scale(0.5, 0.5, 0.5);
          cube.matrix.translate(i - 16, 1 * k, j - 16);
          g_mapCubes.push(cube);
        }
      }
    }
  }
}

function drawMap() {
  for (i = 0; i < g_mapCubes.length; i++) {
    g_mapCubes[i].render();
  }
}

function renderAllShapes() {
  var globalRotMat = new Matrix4().rotate(g_globalXAngle, 0, 1, 0);
  globalRotMat.rotate(g_globalYAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projM.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewM.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var floor = new Cube();
  floor.color = [1, 0, 0, 1];
  floor.textureNum = 1;
  floor.matrix.translate(0, -0.75, 0);
  floor.matrix.scale(15, 0, 15);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.render();

  var sky = new Cube();
  sky.color = [0.37, 0.81, 1, 1];
  sky.textureNum = -2;
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  drawMap();
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

function updateAngle() {
  var angle = document.getElementById("cam_angle").value;
  g_globalXAngle = angle;
  renderAllShapes();
}

function regenerateWorld() {
  var hills = document.getElementById("hill_field").value;
  var height = document.getElementById("height_field").value;

  g_map = Array.from({ length: 32 }, (_, row) =>
    Array.from({ length: 32 }, (_, col) =>
      (row === 0 || row === 31 || col === 0 || col === 31) ? 1 : 0
    )
  );

  randomizeHills(g_map, hills, height);
  createMap(g_map);
  renderAllShapes();
}

function addHills() {
  var hills = document.getElementById("hill_field").value;
  var height = document.getElementById("height_field").value;

  randomizeHills(g_map, hills, height);
  createMap(g_map);
  renderAllShapes();
}

function csvToArray(csv) {
  rows = csv.split("\n");

  return rows.map(function (row) {
    return row.split(",");
  });
}

function exportMap() {
  let csvContent = "data:text/csv;charset=utf-8,"
    + g_map.map(e => e.join(",")).join("\n");
  var encodedUri = encodeURI(csvContent);
  window.open(encodedUri);
}

function importMap(csv) {
  g_map = csv;
  createMap(g_map);
  renderAllShapes();
}

const fileInput = document.getElementById('csv')
const readFile = () => {
  const reader = new FileReader()
  reader.onload = () => {
    var res = csvToArray(reader.result);
    importMap(res);
  }
  // start reading the file. When it is done, calls the onload event defined above.
  reader.readAsBinaryString(fileInput.files[0])
}

fileInput.addEventListener('change', readFile)

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  initTextures(gl, 0);

  // Specify the color for clearing <canvas>
  gl.clearColor((220 / 255), (243 / 255), (255 / 255), 1);
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  regenerateWorld();
  updateAngle();
  tick();
}
