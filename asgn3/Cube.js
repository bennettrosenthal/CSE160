class Cube {
    constructor() {
        this.type = 'cube';
        // this.postition = [0, 0, 0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        // this.size = 5.0;
        // this.segments = 10;
        this.matrix = new Matrix4();
        this.textureNum = 0;
    }

    getCenter() {
        // Local center of cube
        const localCenter = [0.5, 0.5, 0.5, 1.0];

        const e = this.matrix.elements;

        // Multiply Matrix4 * vec4 manually
        const x =
            e[0] * localCenter[0] +
            e[4] * localCenter[1] +
            e[8] * localCenter[2] +
            e[12] * localCenter[3];

        const y =
            e[1] * localCenter[0] +
            e[5] * localCenter[1] +
            e[9] * localCenter[2] +
            e[13] * localCenter[3];

        const z =
            e[2] * localCenter[0] +
            e[6] * localCenter[1] +
            e[10] * localCenter[2] +
            e[14] * localCenter[3];

        return [x, y, z];
    }

    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // front of cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);

        // top of cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);
        drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0]);

        // back of cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([0,0,1, 1,0,1, 1,1,1], [0,0, 1,0, 1,1]);
        drawTriangle3DUV([0,0,1, 1,1,1, 0,1,1], [0,0, 1,1, 0,1]);

        // bottom of cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([0,0,0, 1,0,0, 1,0,1], [0,1, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0, 1,0,1, 0,0,1], [0,1, 1,0, 0,0]);

        // right of cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1]);
        drawTriangle3DUV([1,0,0, 1,0,1, 1,1,1], [0,0, 1,0, 1,1]);

        // left of cube
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([0,0,0, 0,1,0, 0,1,1], [1,0, 1,1, 0,1]);
        drawTriangle3DUV([0,0,0, 0,1,1, 0,0,1], [1,0, 0,1, 0,0]);
    }
}