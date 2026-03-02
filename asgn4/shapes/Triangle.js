class Triangle {
  constructor() {
    this.coord = [0, 0, 0];
    this.color = [1, 1, 1, 1];
    this.size = 5;
    this.type = "Triangle";
    this.buffer = gl.createBuffer();
    this.uvBuffer = gl.createBuffer();
    this.normalBuffer = gl.createBuffer();

    if (!this.buffer || !this.uvBuffer || !this.normalBuffer) {
      console.log("Failed to create buffer objects");
    }
  }

  render() {
    var xy = this.coord;
    var rgba = this.color;
    var siz = this.size / 100;

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // pass the size of the point
    gl.uniform1f(u_Size, siz);

    // Draw
    drawTriangle([xy[0], xy[1], xy[0] + siz, xy[1], xy[0], xy[1] + siz]);
  }
}

function drawTriangle(vertices) {
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  // Draw arrays
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3D(vertices) {
  var n = 3; // The number of vertices

  // Create a buffer object
  if (this.buffer == null) {
    this.buffer = gl.createBuffer();
    if (!this.buffer) {
      console.log("Failed to create the buffer object");
      return -1;
    }
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  // Draw arrays
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUV(vertices, uv) {
  var n = 3; // The number of vertices

  // Create a buffer object
  if (this.buffer == null) {
    this.buffer = gl.createBuffer();
    if (!this.buffer) {
      console.log("Failed to create the buffer object");
      return -1;
    }
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  if (this.uvBuffer == null) {
    this.uvBuffer = gl.createBuffer();
    if (!this.uvBuffer) {
      console.log("Failed to create the buffer object");
      return -1;
    }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_UV);

  // Draw arrays
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUVNormal(vertices, uv, normals) {
  var n = vertices.length / 3; // The number of vertices

  // Create a buffer object
  if (this.buffer == null) {
    this.buffer = gl.createBuffer();
    if (!this.buffer) {
      console.log("Failed to create the buffer object");
      return -1;
    }
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  if (this.uvBuffer == null) {
    this.uvBuffer = gl.createBuffer();
    if (!this.uvBuffer) {
      console.log("Failed to create the buffer object");
      return -1;
    }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_UV);

  if (this.normalBuffer == null) {
    this.normalBuffer = gl.createBuffer();
    if (!this.normalBuffer) {
      console.log("Failed to create the buffer object");
      return -1;
    }
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Normal);

  // Draw arrays
  gl.drawArrays(gl.TRIANGLES, 0, n);
}