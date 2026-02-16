class Camera {
    constructor(canvas) {
        this.fov = 60;
        this.speed = 1;
        this.alpha = 2;
        this.eye = new Vector3([0,0,0]);
        this.at =  new Vector3([0,0,-1]);
        this.up =  new Vector3([0,1,0]);

        this.projM = new Matrix4();
        this.projM.setPerspective(60, canvas.width / canvas.height, 0.1, 1000);
        
        this.viewM = new Matrix4();
        this.viewM.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2],
        );
    }

    forward() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(this.speed);
        this.at.add(f);
        this.eye.add(f);

        this.updateViewMatrix();
    }

    back() {
        var b = new Vector3();
        b.set(this.eye);
        b.sub(this.at);
        b.normalize();
        b.mul(this.speed);
        this.at.add(b);
        this.eye.add(b);

        this.updateViewMatrix();
    }

    left() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        var s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(this.speed);

        this.at.add(s);
        this.eye.add(s);

        this.updateViewMatrix();
    }

    right() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        var s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(this.speed);

        this.at.add(s);
        this.eye.add(s);

        this.updateViewMatrix();
    }

    pan(alpha) {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);

        var rm = new Matrix4().setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var f_prime = rm.multiplyVector3(f);

        this.at = new Vector3().set(this.eye).add(f_prime);
        this.updateViewMatrix();
    }

    updateViewMatrix() {
        this.viewM.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2],
        );
    }
}