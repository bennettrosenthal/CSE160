class Triangle {
  constructor() {
    this.coord = [0,0,0];
    this.color = [1,1,1,1];
    this.size = 5;
    this.type = "Triangle";
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
    drawTriangle( [xy[0], xy[1], xy[0]+siz, xy[1], xy[0], xy[1]+siz] );
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
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  // Draw arrays
  gl.drawArrays(gl.TRIANGLES, 0, n);
}