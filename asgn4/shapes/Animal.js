class Animal {
    constructor() {
        this.textureNum = -3;
        this.matrix = new Matrix4();
    }

    render() {
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        var body = new Cube();
        body.textureNum = this.textureNum;
        body.color = [1.0, 1.0, 1.0, 1.0];
        body.matrix.translate(0.15, -0.75, -0.1);
        body.matrix.scale(-0.6, 0.9, 0.5);
        body.normalMatrix.setInverseOf(body.matrix).transpose();
        body.render();

        var outerBody = new Cube();
        outerBody.textureNum = this.textureNum;
        outerBody.color = [0, 0, 0, 1.0];
        outerBody.matrix.translate(-0.6, -0.85, 0);
        outerBody.matrix.scale(0.9, 1.1, 0.7);
        outerBody.normalMatrix.setInverseOf(outerBody.matrix).transpose();
        outerBody.render();

        var head = new Cube();
        head.textureNum = this.textureNum;
        head.color = [1.0, 1.0, 1.0, 1.0];
        head.matrix.setTranslate(0,0,0);
        head.matrix.translate(0.125, 0.25, 0.05);
        head.matrix.scale(-0.55, 0.4, 0.5);
        head.matrix.translate(0.5, 0.5, 0.5);
        head.matrix.rotate(g_headAngle, 0,1,0);
        head.matrix.translate(-0.5, -0.5, -0.5);
        head.normalMatrix.setInverseOf(head.matrix).transpose();
        var innerHeadMat = new Matrix4(head.matrix);
        head.render();
        
        var outerHead = new Cube();
        outerHead.textureNum = this.textureNum;
        outerHead.color = [0.0, 0.0, 0.0, 1.0];
        outerHead.matrix = innerHeadMat;
        outerHead.matrix.translate(-0.125, 0, 0.06);
        outerHead.matrix.scale(1.25, 1.1, 1);
        outerHead.normalMatrix.setInverseOf(outerHead.matrix).transpose();
        outerHead.render();

        var leftEye = new Cube();
        leftEye.textureNum = this.textureNum;
        leftEye.color = [0.0, 0.0, 0.0, 1.0];
        leftEye.matrix = innerHeadMat;
        leftEye.matrix.translate(0.6, 0.45, -0.11);
        var leftEyeMat = new Matrix4(leftEye.matrix);
        leftEye.matrix.scale(0.07, 0.11, 0.5);
        leftEye.normalMatrix.setInverseOf(leftEye.matrix).transpose();
        leftEye.render();

        var rightEye = new Cube();
        rightEye.textureNum = this.textureNum;
        rightEye.color = [0.0, 0.0, 0.0, 1.0];
        rightEye.matrix = leftEyeMat;
        var rightEyeMat = new Matrix4(rightEye.matrix);
        rightEye.matrix.translate(-0.25, 0, 0);
        rightEye.matrix.scale(0.07, 0.11, 0.5);
        rightEye.normalMatrix.setInverseOf(rightEye.matrix).transpose();
        rightEye.render();

        var beak = new Cone();
        beak.textureNum = this.textureNum;
        beak.color = [1.0, 0.7, 0.2, 1.0];
        beak.matrix = rightEyeMat;
        beak.matrix.translate(-0.29, -0.25, 0.1);
        beak.matrix.rotate(270, 1,0,0);
        beak.matrix.scale(0.4, 0.34, 0.15);
        beak.render();

        var feet = new Cube();
        feet.textureNum = this.textureNum;
        feet.color = [1, 1, 0, 1.0];
        feet.matrix.translate(-0.6, -0.85, -0.15);
        feet.matrix.scale(0.9, -0.1, 0.85);
        feet.normalMatrix.setInverseOf(feet.matrix).transpose();
        feet.render();

        var leftWing1 = new Cube();
        leftWing1.textureNum = this.textureNum;
        leftWing1.color = [0.05, 0.05, 0.05, 1];
        leftWing1.wing = 'right';
        leftWing1.matrix.setTranslate(0, 0, 0);
        leftWing1.matrix.translate(0.23, 0.17, 0.1);
        leftWing1.matrix.rotate(-140, 0, 0, 1);
        var leftWing1Mat = new Matrix4(leftWing1.matrix);
        leftWing1.matrix.scale(-0.11, 0.2, 0.5);
        leftWing1.normalMatrix.setInverseOf(leftWing1.matrix).transpose();
        leftWing1.render();


        var leftWing2 = new Cube();
        leftWing2.textureNum = this.textureNum;
        leftWing2.matrix = leftWing1Mat;
        leftWing2.color = [0.05, 0.05, 0.05, 1];
        leftWing2.wing = 'right';
        leftWing2.matrix.translate(-0.03, 0.15, 0);
        var leftWing2Mat = new Matrix4(leftWing2.matrix);
        leftWing2.matrix.rotate(-40, 0, 0, 1);
        leftWing2.matrix.scale(-0.1, 0.5, 0.5);
        leftWing2.normalMatrix.setInverseOf(leftWing2.matrix).transpose();
        leftWing2.render();


        var leftWing3 = new Cube();
        leftWing3.textureNum = this.textureNum;
        leftWing3.matrix = leftWing2Mat;
        leftWing3.color = [0.05, 0.05, 0.05, 1];
        leftWing3.wing = 'right';
        leftWing3.matrix.translate(0.24, 0.28, 0.1);
        leftWing3.matrix.rotate(-40, 0, 0, 1);
        leftWing3.matrix.scale(-0.1, 0.2, 0.35);
        leftWing3.normalMatrix.setInverseOf(leftWing3.matrix).transpose();
        leftWing3.render();

        var rightWing1 = new Cube();
        rightWing1.textureNum = this.textureNum;
        rightWing1.color = [0.05, 0.05, 0.05, 1];
        rightWing1.wing = 'right';
        rightWing1.matrix.setTranslate(0, 0, 0);
        rightWing1.matrix.translate(-0.65, 0.03, 0.1);
        rightWing1.matrix.rotate(-35, 0, 0, 1);
        rightWing1.matrix.scale(-0.1, 0.2, 0.5);
        rightWing1.normalMatrix.setInverseOf(rightWing1.matrix).transpose();
        rightWing1.render();

        var rightWing2 = new Cube();
        rightWing2.textureNum = this.textureNum;
        rightWing2.color = [0.05, 0.05, 0.05, 1];
        rightWing2.wing = 'left';
        rightWing2.matrix.translate(-0.73, -0.4, 0.1);
        rightWing2.matrix.rotate(0, 0, 0, 1);
        rightWing2.matrix.scale(0.1, 0.5, 0.5);
        rightWing2.normalMatrix.setInverseOf(rightWing2.matrix).transpose();
        rightWing2.render();

        var rightWing3 = new Cube();
        rightWing3.textureNum = this.textureNum;
        rightWing3.color = [0.05, 0.05, 0.05, 1];
        rightWing3.wing = 'left';
        rightWing3.matrix.translate(-0.72, -0.55, 0.1);
        rightWing3.matrix.rotate(5, 0, 0, 1);
        rightWing3.matrix.scale(0.1, 0.15, 0.5);
        rightWing3.normalMatrix.setInverseOf(rightWing3.matrix).transpose();
        rightWing3.render();
    }
}