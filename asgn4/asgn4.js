// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_vertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_vertPos = u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_vertPos;
  uniform vec4 u_FragColor;  // uniform変数
  // uniform sampler2D u_Sampler0;
  // uniform sampler2D u_Sampler1;
  // uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  uniform bool u_lightOn;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0);
    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else {
      gl_FragColor = vec4(1,.2,.2,1);  
    }

    
    vec3 lightVector = vec3(v_vertPos) - u_lightPos;
    float r = length(lightVector);

    /*
    if (r < 1.0) {
      gl_FragColor = vec4(1,0,0,1);
    } else if (r < 2.0) {
      gl_FragColor = vec4(0,1,0,1);
    }
    */
    // gl_FragColor = vec4(vec3(gl_FragColor) / (r*r), 1);

    vec3 L = normalize(lightVector);
    vec3 N = normalize(-(v_Normal));
    float nDotL = max(dot(N,L), 0.0);

    vec3 R = reflect(L, N);
    vec3 E = normalize(u_cameraPos - vec3(v_vertPos));
    float specular = pow(max(dot(E,R), 0.0), 64.0) * 0.8;

    vec3 diffuse = vec3(1.0,1.0,0.9) * vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.2;

    if (u_lightOn) {
      gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
    } else {
      if (u_whichTexture == -3) {
        gl_FragColor = vec4((v_Normal + 1.0)/2.0, 1.0);
      } else {
        gl_FragColor = u_FragColor;
      }
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
let a_Normal;

let u_fragColor;
let u_whichTexture;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_lightPos;
let u_lightOn;

let u_Sampler0;
let u_Sampler1;
let u_Sampler2;

let v_vertPos;

let g_globalXAngle = 0;
let g_globalYAngle = 0;
let g_headAngle = 0;
let g_mouseX = 0;
let g_universalColor = -2;
let g_normals = false;
let g_lightPos = [0,3,2];
let g_animateLight = false;
let g_lightOn = true;

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

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
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

  
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }
  /*
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
  */

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  v_vertPos = gl.getUniformLocation(gl.program, 'v_vertPos');
  if (!v_vertPos) {
    console.log('Failed to get the storage location of v_vertPos');
    return;
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

var animal = new Animal();
var sphere = new Sphere();
sphere.matrix.translate(1.75,-1,0);
sphere.matrix.scale(0.5, 0.5, 0.5);

function renderAllShapes() {
  var globalRotMat = new Matrix4().rotate(g_globalXAngle, 0, 1, 0);
  globalRotMat.rotate(g_globalYAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projM.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewM.elements);
  gl.uniform1i(u_lightOn, g_lightOn);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos, g_camera.eye.x, g_camera.eye.y, g_camera.eye.z);
  if (g_animateLight) {
    g_lightPos[0] = Math.cos(g_seconds);
  }

  var light = new Cube();
  light.color = [1,1,0,1];
  light.textureNum = g_universalColor;
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-.1,-.1,-.1);
  light.matrix.translate(-0.5, -0.5, -0.5);
  light.render();

  var sky = new Cube();
  sky.color = [(242/255), (235/255), (226/255), 1];
  sky.textureNum = g_universalColor;
  sky.matrix.scale(-10, -10, -10);
  sky.matrix.translate(-0.5, -0.85, -0.5);
  sky.render();
  
  animal.textureNum = g_universalColor;
  animal.render();

  sphere.textureNum = g_universalColor;
  sphere.render();
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

function updateLightPos() {
  var x = document.getElementById("light_x").value;
  var y = document.getElementById("light_y").value;
  var z = document.getElementById("light_z").value;

  g_lightPos = [x/100,y/100,z/100];
  renderAllShapes();
}

function toggleLightAnimation() {
  g_animateLight = !g_animateLight;
}

function regenerateWorld() {
  g_camera.forward();
  g_camera.forward();
  g_camera.pan(180);
  createMap(g_map);
  renderAllShapes();
}

function toggleNormals() {
  if (!g_normals) {
    g_universalColor = -3;
  } else {
    g_universalColor = -2;
  }
  g_normals = !g_normals;
}

function toggleLight() {
  g_lightOn = !g_lightOn;
}

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
