class Point {
  constructor() {
    this.coord = [0,0,0];
    this.color = [1,1,1,1];
    this.size = 5;
    this.type = "Point";
  }

  render() {
    var xy = this.coord;
    var rgba = this.color;
    var size = this.size;

    // Add points to buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ xy[0], xy[1] ]), gl.DYNAMIC_DRAW);
    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // pass the size of the point
    gl.uniform1f(u_Size, size);
    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}